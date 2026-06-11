import { resultSchema } from "@/src/features/admin/schemas/result.schema";
import { calculatePredictionPoints } from "@/src/features/predictions/utils/calculate-points";
import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

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

  const { matchId, homeScore, awayScore } = parsedBody.data;

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: "finished",
    })
    .eq("id", matchId)
    .select("id, home_score, away_score, status")
    .single();

  if (matchError || !match) {
    return NextResponse.json(
      { data: null, error: "Could not update match result." },
      { status: 500 },
    );
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from("predictions")
    .select("id, predicted_home_score, predicted_away_score")
    .eq("match_id", matchId);

  if (predictionsError) {
    return NextResponse.json(
      { data: null, error: "Could not load predictions." },
      { status: 500 },
    );
  }

  const updatedPredictions = await Promise.all(
    predictions.map((prediction) => {
      const points = calculatePredictionPoints({
        predictedHomeScore: prediction.predicted_home_score,
        predictedAwayScore: prediction.predicted_away_score,
        homeScore,
        awayScore,
      });

      return supabase
        .from("predictions")
        .update({ points })
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

  return NextResponse.json({
    data: {
      match,
      updatedPredictionsCount: updatedPredictions.length,
    },
    error: null,
  });
}
