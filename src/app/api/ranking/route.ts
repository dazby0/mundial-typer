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
    .from("ranking_view")
    .select("*")
    .order("total_points", { ascending: false })
    .order("exact_scores_count", { ascending: false })
    .order("correct_results_count", { ascending: false })
    .order("username", { ascending: true });

  if (error) {
    return NextResponse.json(
      { data: null, error: "Could not load ranking." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data,
    error: null,
  });
}
