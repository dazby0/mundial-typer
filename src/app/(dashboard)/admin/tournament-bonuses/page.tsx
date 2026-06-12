import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/src/lib/supabase/server";
import { AdminTournamentBonusResultsForm } from "@/src/features/tournament-predictions/components/AdminTournamentBonusResultsForm";
import { AdminTournamentBonusSummary } from "@/src/features/tournament-predictions/components/AdminTournamentBonusSummary";
import {
  TournamentBonusResult,
  TournamentTeamOption,
} from "@/src/features/tournament-predictions/types/tournament-prediction.types";
import { AppLink } from "@/src/components/navigation/AppLink";

export default async function AdminTournamentBonusesPage() {
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

  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id, name_pl, name_en, code, group_name, flag_code, flag_emoji")
    .order("name_pl", { ascending: true });

  if (teamsError) {
    throw new Error("Could not load teams.");
  }

  const { data: resultData, error: resultError } = await supabase
    .from("tournament_bonus_results")
    .select("*")
    .eq("id", 1)
    .single();

  if (resultError) {
    throw new Error("Could not load tournament bonus results.");
  }

  const { count: predictionsCount, error: countError } = await supabase
    .from("tournament_predictions")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw new Error("Could not load tournament predictions count.");
  }

  const teams = (teamsData || []) as TournamentTeamOption[];
  const result = resultData as Partial<TournamentBonusResult> | null;

  return (
    <section className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <Button
          asChild
          variant="outline"
          className="mb-5 rounded-full bg-white"
        >
          <AppLink href="/admin">
            <ArrowLeft className="h-4 w-4" />
            Wróć do panelu admina
          </AppLink>
        </Button>

        <Badge className="mb-4 rounded-full">Admin • typy turniejowe</Badge>

        <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
          Rozliczenie bonusów
        </h1>

        <p className="mt-3 max-w-3xl text-muted-foreground">
          Tu wpisujesz oficjalne rozstrzygnięcia całego Mundialu. Po finalizacji
          system przeliczy punkty bonusowe i doda je do rankingu.
        </p>
      </div>

      <div className="mt-6">
        <AdminTournamentBonusSummary
          predictionsCount={predictionsCount || 0}
          finalized={Boolean(result?.is_finalized)}
        />
      </div>

      <div className="mt-6">
        <AdminTournamentBonusResultsForm
          teams={teams}
          initialResult={result}
          predictionsCount={predictionsCount || 0}
        />
      </div>
    </section>
  );
}
