import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: "Could not sign out." }, { status: 500 });
  }

  return NextResponse.json({
    message: "Signed out successfully.",
  });
}
