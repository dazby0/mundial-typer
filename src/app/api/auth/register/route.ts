import { technicalEmailDomain } from "@/src/constants/auth";
import { registerSchema } from "@/src/features/auth/schemas/auth.schema";
import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid register data." },
      { status: 400 },
    );
  }

  const username = parsedBody.data.username.toLowerCase();
  const email = `${username}@${technicalEmailDomain}`;

  const supabase = await createClient();

  const { data: availability, error: availabilityError } = await supabase.rpc(
    "is_username_available",
    {
      input_username: username,
    },
  );

  if (availabilityError) {
    return NextResponse.json(
      { error: "Could not check username availability." },
      { status: 500 },
    );
  }

  if (!availability) {
    return NextResponse.json(
      { error: "Username is already taken." },
      { status: 409 },
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsedBody.data.password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    user: data.user,
  });
}
