import { technicalEmailDomain } from "@/src/constants/auth";
import { loginSchema } from "@/src/features/auth/schemas/auth.schema";
import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = loginSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid login data." }, { status: 400 });
  }

  const username = parsedBody.data.username.toLowerCase();
  const email = `${username}@${technicalEmailDomain}`;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsedBody.data.password,
  });

  if (error) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    user: data.user,
  });
}
