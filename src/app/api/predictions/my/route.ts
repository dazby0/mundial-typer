import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

  const { data, error } = await supabase
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
      matches (
        id,
        match_number,
        kickoff_time,
        group_name,
        matchday,
        venue_city_pl,
        home_score,
        away_score,
        status,
        home_team:teams!matches_home_team_id_fkey (
          id,
          code,
          name_pl,
          flag_code,
          flag_emoji
        ),
        away_team:teams!matches_away_team_id_fkey (
          id,
          code,
          name_pl,
          flag_code,
          flag_emoji
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { data: null, error: "Could not load predictions." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data,
    error: null,
  });
}
