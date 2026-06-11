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
    .from("group_standings_view")
    .select("*")
    .order("group_name", { ascending: true })
    .order("points", { ascending: false })
    .order("goal_difference", { ascending: false })
    .order("goals_for", { ascending: false })
    .order("name_pl", { ascending: true });

  if (error) {
    return NextResponse.json(
      { data: null, error: "Could not load group standings." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data,
    error: null,
  });
}
