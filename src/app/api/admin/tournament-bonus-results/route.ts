import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { tournamentBonusResultSchema } from "@/src/features/tournament-predictions/schemas/tournament-prediction.schema";
import { TournamentPrediction } from "@/src/features/tournament-predictions/types/tournament-prediction.types";
import { calculateTournamentPredictionPoints } from "@/src/features/tournament-predictions/utils/tournament-points";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      isAdmin: false,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    user,
    isAdmin: profile?.role === "admin",
  };
}

export async function GET() {
  const { supabase, isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("tournament_bonus_results")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json(
      { message: "Could not load tournament bonus results." },
      { status: 500 },
    );
  }

  return NextResponse.json({ result: data });
}

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await requireAdmin();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (!isAdmin) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = tournamentBonusResultSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Invalid data." },
      { status: 400 },
    );
  }

  const { data: savedResult, error: saveError } = await supabase
    .from("tournament_bonus_results")
    .upsert(
      {
        id: 1,
        ...parsed.data,
        updated_by: user.id,
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (saveError) {
    return NextResponse.json(
      { message: "Could not save tournament bonus results." },
      { status: 500 },
    );
  }

  if (!parsed.data.is_finalized) {
    return NextResponse.json({ result: savedResult, recalculated: false });
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from("tournament_predictions")
    .select("*");

  if (predictionsError) {
    return NextResponse.json(
      { message: "Could not load tournament predictions." },
      { status: 500 },
    );
  }

  const updates = ((predictions || []) as TournamentPrediction[]).map(
    (prediction) => {
      const points = calculateTournamentPredictionPoints(
        prediction,
        parsed.data,
      );

      return {
        id: prediction.id,
        user_id: prediction.user_id,
        champion_team_id: prediction.champion_team_id,
        finalist_team_1_id: prediction.finalist_team_1_id,
        finalist_team_2_id: prediction.finalist_team_2_id,
        semifinalist_team_1_id: prediction.semifinalist_team_1_id,
        semifinalist_team_2_id: prediction.semifinalist_team_2_id,
        semifinalist_team_3_id: prediction.semifinalist_team_3_id,
        semifinalist_team_4_id: prediction.semifinalist_team_4_id,
        top_scorer_name: prediction.top_scorer_name,
        top_scoring_team_id: prediction.top_scoring_team_id,
        ...points,
      };
    },
  );

  if (updates.length > 0) {
    const { error: updateError } = await supabase
      .from("tournament_predictions")
      .upsert(updates, { onConflict: "id" });

    if (updateError) {
      return NextResponse.json(
        { message: "Could not recalculate tournament bonus points." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    result: savedResult,
    recalculated: true,
    predictions_count: updates.length,
  });
}
