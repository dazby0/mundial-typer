import { createClient } from "@/src/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
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

  const { data: match, error: matchError } = await supabase
    .from("matches_view")
    .select("*")
    .eq("id", id)
    .single();

  if (matchError || !match) {
    return NextResponse.json(
      { data: null, error: "Match not found." },
      { status: 404 },
    );
  }

  const matchStarted = new Date(match.kickoff_time).getTime() <= Date.now();

  let predictionsQuery = supabase
    .from("predictions")
    .select(
      `
      id,
      user_id,
      match_id,
      predicted_home_score,
      predicted_away_score,
      points,
      created_at,
      updated_at,
      profiles (
        username
      )
    `,
    )
    .eq("match_id", id)
    .order("created_at", { ascending: true });

  if (!matchStarted) {
    predictionsQuery = predictionsQuery.eq("user_id", user.id);
  }

  const { data: predictions, error: predictionsError } = await predictionsQuery;

  if (predictionsError) {
    return NextResponse.json(
      { data: null, error: "Could not load predictions." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: {
      match,
      predictions,
      predictionsVisible: matchStarted,
    },
    error: null,
  });
}
