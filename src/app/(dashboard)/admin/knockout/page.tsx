import { redirect } from "next/navigation";
import { GitBranch, ShieldCheck } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { AppLink } from "@/src/components/navigation/AppLink";
import { createClient } from "@/src/lib/supabase/server";
import {
  AdminKnockoutProposalMatch,
  AdminKnockoutReadiness,
  AdminKnockoutThirdPlaceOption,
} from "@/src/features/admin/types/admin-knockout.types";
import { AdminKnockoutConfirmationForm } from "@/src/features/admin/components/knockout/AdminKnockoutConfirmationForm";

export const dynamic = "force-dynamic";

export default async function AdminKnockoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: readiness, error: readinessError } = await supabase
    .from("knockout_admin_readiness_view")
    .select("*")
    .single();

  if (readinessError) {
    throw new Error("Could not load knockout readiness.");
  }

  const { data: proposalMatches, error: proposalError } = await supabase
    .from("knockout_round_of_32_proposal_view")
    .select("*")
    .order("match_order", { ascending: true });

  if (proposalError) {
    throw new Error("Could not load knockout proposal.");
  }

  const { data: thirdPlaceOptions, error: optionsError } = await supabase
    .from("knockout_round_of_32_third_place_options_view")
    .select("*")
    .order("match_code", { ascending: true })
    .order("slot_side", { ascending: true })
    .order("third_place_rank", { ascending: true });

  if (optionsError) {
    throw new Error("Could not load third-place options.");
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 rounded-full">Panel admina</Badge>

            <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
              Zatwierdzanie drabinki
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Tutaj zatwierdzasz tylko 1/16 finału. Miejsca z pierwszych i
              drugich pozycji w grupach podstawiają się automatycznie, a Ty
              wybierasz wyłącznie drużyny z trzecich miejsc.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-white"
              >
                <AppLink href="/admin">
                  <ShieldCheck className="h-4 w-4" />
                  Wróć do wyników
                </AppLink>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-full bg-white"
              >
                <AppLink href="/knockout">
                  <GitBranch className="h-4 w-4" />
                  Podgląd drabinki
                </AppLink>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-background px-6 py-5 lg:min-w-80">
            <p className="text-sm text-muted-foreground">Tryb</p>
            <p className="font-heading text-3xl">VAR drabinki</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Jedno kliknięcie tutaj tworzy realne mecze 1/16 finału.
            </p>
          </div>
        </div>
      </div>

      <AdminKnockoutConfirmationForm
        readiness={readiness as AdminKnockoutReadiness}
        matches={(proposalMatches || []) as AdminKnockoutProposalMatch[]}
        thirdPlaceOptions={
          (thirdPlaceOptions || []) as AdminKnockoutThirdPlaceOption[]
        }
      />
    </section>
  );
}
