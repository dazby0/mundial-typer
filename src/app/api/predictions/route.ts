import { predictionSchema } from "@/src/features/predictions/schemas/prediction.schema";
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

  const body = await request.json();
  const parsedBody = predictionSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { data: null, error: "Invalid prediction data." },
      { status: 400 },
    );
  }

  const { matchId, predictedHomeScore, predictedAwayScore } = parsedBody.data;

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, kickoff_time, status")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    return NextResponse.json(
      { data: null, error: "Match not found." },
      { status: 404 },
    );
  }

  if (match.status !== "scheduled") {
    return NextResponse.json(
      { data: null, error: "Predictions are closed for this match." },
      { status: 403 },
    );
  }

  if (new Date(match.kickoff_time).getTime() <= Date.now()) {
    return NextResponse.json(
      { data: null, error: "Predictions are closed for this match." },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("predictions")
    .insert({
      user_id: user.id,
      match_id: matchId,
      predicted_home_score: predictedHomeScore,
      predicted_away_score: predictedAwayScore,
      points: null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { data: null, error: "Could not create prediction." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data,
    error: null,
  });
}

export async function PUT(request: Request) {
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

  const body = await request.json();
  const parsedBody = predictionSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { data: null, error: "Invalid prediction data." },
      { status: 400 },
    );
  }

  const { matchId, predictedHomeScore, predictedAwayScore } = parsedBody.data;

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, kickoff_time, status")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    return NextResponse.json(
      { data: null, error: "Match not found." },
      { status: 404 },
    );
  }

  if (match.status !== "scheduled") {
    return NextResponse.json(
      { data: null, error: "Predictions are closed for this match." },
      { status: 403 },
    );
  }

  if (new Date(match.kickoff_time).getTime() <= Date.now()) {
    return NextResponse.json(
      { data: null, error: "Predictions are closed for this match." },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("predictions")
    .update({
      predicted_home_score: predictedHomeScore,
      predicted_away_score: predictedAwayScore,
      points: null,
    })
    .eq("user_id", user.id)
    .eq("match_id", matchId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { data: null, error: "Could not update prediction." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data,
    error: null,
  });
}
