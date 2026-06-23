"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { ThirdPlaceSelectionPayload } from "@/src/features/admin/types/admin-knockout.types";

type ConfirmRoundOf32Result = {
  success: boolean;
  message: string;
};

export async function confirmRoundOf32BracketAction(
  selections: ThirdPlaceSelectionPayload[],
): Promise<ConfirmRoundOf32Result> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Musisz być zalogowany.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return {
      success: false,
      message: "Nie masz uprawnień administratora.",
    };
  }

  const { error } = await supabase.rpc("confirm_round_of_32_bracket", {
    third_place_selections: selections,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/knockout");
  revalidatePath("/knockout");
  revalidatePath("/matches");
  revalidatePath("/predictions");

  return {
    success: true,
    message: "Drabinka 1/16 finału została zatwierdzona.",
  };
}
