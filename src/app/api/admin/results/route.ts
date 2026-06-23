import { NextResponse } from "next/server";
import { resultSchema } from "@/src/features/admin/schemas/result.schema";
import { calculatePredictionPoints } from "@/src/features/predictions/utils/calculate-points";
import { createClient } from "@/src/lib/supabase/server";
import {
  calculateKnockoutPredictionPoints,
  isKnockoutStage,
  validateKnockoutResult,
} from "@/src/features/knockout/utils/knockout-rules";
import { KnockoutResolutionMethod } from "@/src/features/knockout/types/knockout-rules.types";

type MatchResultUpdatePayload = {
  home_score: number;
  away_score: number;
  status: "finished";
  winner_team_id: string | null;
  resolution_method: KnockoutResolutionMethod | null;
  home_penalty_score: number | null;
  away_penalty_score: number | null;
  updated_at: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { data: null, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return NextResponse.json(
      { data: null, error: "Forbidden." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const parsedBody = resultSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { data: null, error: "Invalid result data." },
      { status: 400 },
    );
  }

  const {
    matchId,
    homeScore,
    awayScore,
    winnerTeamId = null,
    resolutionMethod = null,
    homePenaltyScore = null,
    awayPenaltyScore = null,
  } = parsedBody.data;

  const { data: existingMatch, error: existingMatchError } = await supabase
    .from("matches")
    .select("id, stage, home_team_id, away_team_id")
    .eq("id", matchId)
    .single();

  if (existingMatchError || !existingMatch) {
    return NextResponse.json(
      { data: null, error: "Could not load match." },
      { status: 500 },
    );
  }

  const isKnockoutMatch = isKnockoutStage(existingMatch.stage);

  if (isKnockoutMatch) {
    if (!winnerTeamId || !resolutionMethod) {
      return NextResponse.json(
        {
          data: null,
          error:
            "For knockout matches, winner team and resolution method are required.",
        },
        { status: 400 },
      );
    }

    const validation = validateKnockoutResult({
      homeTeamId: existingMatch.home_team_id,
      awayTeamId: existingMatch.away_team_id,
      homeScore,
      awayScore,
      winnerTeamId,
      resolutionMethod,
      homePenaltyScore,
      awayPenaltyScore,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          data: null,
          error: validation.errors[0] || "Invalid knockout result.",
        },
        { status: 400 },
      );
    }
  }

  if (
    !isKnockoutMatch &&
    (winnerTeamId ||
      resolutionMethod ||
      homePenaltyScore !== null ||
      awayPenaltyScore !== null)
  ) {
    return NextResponse.json(
      {
        data: null,
        error: "Knockout result fields are not allowed for group matches.",
      },
      { status: 400 },
    );
  }

  const matchUpdatePayload: MatchResultUpdatePayload = isKnockoutMatch
    ? {
        home_score: homeScore,
        away_score: awayScore,
        status: "finished",
        winner_team_id: winnerTeamId,
        resolution_method: resolutionMethod,
        home_penalty_score:
          resolutionMethod === "penalties" ? homePenaltyScore : null,
        away_penalty_score:
          resolutionMethod === "penalties" ? awayPenaltyScore : null,
        updated_at: new Date().toISOString(),
      }
    : {
        home_score: homeScore,
        away_score: awayScore,
        status: "finished",
        winner_team_id: null,
        resolution_method: null,
        home_penalty_score: null,
        away_penalty_score: null,
        updated_at: new Date().toISOString(),
      };

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .update(matchUpdatePayload)
    .eq("id", matchId)
    .select(
      `
      id,
      home_score,
      away_score,
      status,
      winner_team_id,
      resolution_method,
      home_penalty_score,
      away_penalty_score
    `,
    )
    .single();

  if (matchError || !match) {
    return NextResponse.json(
      { data: null, error: "Could not update match result." },
      { status: 500 },
    );
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from("predictions")
    .select(
      `
      id,
      predicted_home_score,
      predicted_away_score,
      predicted_winner_team_id,
      predicted_resolution_method
    `,
    )
    .eq("match_id", matchId);

  if (predictionsError) {
    return NextResponse.json(
      { data: null, error: "Could not load predictions." },
      { status: 500 },
    );
  }

  const updatedPredictions = await Promise.all(
    (predictions || []).map((prediction) => {
      const points = isKnockoutMatch
        ? calculateKnockoutPredictionPoints({
            predictedWinnerTeamId: prediction.predicted_winner_team_id,
            predictedResolutionMethod:
              prediction.predicted_resolution_method as KnockoutResolutionMethod | null,
            predictedHomeScore: prediction.predicted_home_score,
            predictedAwayScore: prediction.predicted_away_score,
            actualWinnerTeamId: winnerTeamId,
            actualResolutionMethod: resolutionMethod,
            actualHomeScore: homeScore,
            actualAwayScore: awayScore,
          })
        : calculatePredictionPoints({
            predictedHomeScore: prediction.predicted_home_score,
            predictedAwayScore: prediction.predicted_away_score,
            homeScore,
            awayScore,
          });

      return supabase
        .from("predictions")
        .update({
          points,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prediction.id)
        .select("id, points")
        .single();
    }),
  );

  const failedUpdate = updatedPredictions.find((result) => result.error);

  if (failedUpdate) {
    return NextResponse.json(
      { data: null, error: "Could not update prediction points." },
      { status: 500 },
    );
  }

  let advancedMatches: unknown[] = [];

  if (isKnockoutMatch) {
    const { data: advancedData, error: advanceError } = await supabase.rpc(
      "advance_knockout_result",
      {
        p_match_id: matchId,
      },
    );

    if (advanceError) {
      return NextResponse.json(
        {
          data: null,
          error: advanceError.message || "Could not advance knockout bracket.",
        },
        { status: 500 },
      );
    }

    advancedMatches = advancedData || [];
  }

  return NextResponse.json({
    data: {
      match,
      updatedPredictionsCount: updatedPredictions.length,
      advancedMatches,
    },
    error: null,
  });
}
