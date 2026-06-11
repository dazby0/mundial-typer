import { createClient } from "@/src/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

  const searchParams = request.nextUrl.searchParams;
  const groupName = searchParams.get("group");
  const status = searchParams.get("status");

  let query = supabase
    .from("matches_view")
    .select("*")
    .order("match_number", { ascending: true });

  if (groupName) {
    query = query.eq("group_name", groupName);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { data: null, error: "Could not load matches." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data,
    error: null,
  });
}
