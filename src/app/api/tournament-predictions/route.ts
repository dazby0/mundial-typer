import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { tournamentPredictionSchema } from "@/src/features/tournament-predictions/schemas/tournament-prediction.schema";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("tournament_predictions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { message: "Could not load tournament prediction." },
      { status: 500 },
    );
  }

  return NextResponse.json({ prediction: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { data: tournamentStarted, error: tournamentStartedError } =
    await supabase.rpc("is_tournament_started");

  if (tournamentStartedError) {
    return NextResponse.json(
      { message: "Could not verify tournament status." },
      { status: 500 },
    );
  }

  if (tournamentStarted) {
    return NextResponse.json(
      { message: "Tournament predictions are already locked." },
      { status: 409 },
    );
  }

  const body = await request.json();
  const parsed = tournamentPredictionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Invalid data." },
      { status: 400 },
    );
  }

  const payload = {
    user_id: user.id,
    ...parsed.data,
    champion_points: null,
    finalist_points: null,
    finalist_bonus_points: null,
    semifinalist_points: null,
    top_scorer_points: null,
    top_scoring_team_points: null,
    total_points: 0,
  };

  const { data, error } = await supabase
    .from("tournament_predictions")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { message: "Could not save tournament prediction." },
      { status: 500 },
    );
  }

  return NextResponse.json({ prediction: data });
}
