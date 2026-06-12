import { redirect } from "next/navigation";
import { Badge } from "@/src/components/ui/badge";
import { createClient } from "@/src/lib/supabase/server";
import { TournamentBonusRulesCard } from "@/src/features/tournament-predictions/components/TournamentBonusRulesCard";
import { TournamentPredictionForm } from "@/src/features/tournament-predictions/components/TournamentPredictionForm";
import { PublicTournamentPredictionsList } from "@/src/features/tournament-predictions/components/PublicTournamentPredictionsList";
import { TournamentCommunityStats } from "@/src/features/tournament-predictions/components/TournamentCommunityStats";
import { TournamentPredictionsLockedCommunityCard } from "@/src/features/tournament-predictions/components/TournamentPredictionsLockedCommunityCard";
import {
  PublicTournamentPrediction,
  TournamentPrediction,
  TournamentTeamOption,
} from "@/src/features/tournament-predictions/types/tournament-prediction.types";

export default async function TournamentPredictionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id, name_pl, name_en, code, group_name, flag_code, flag_emoji")
    .order("name_pl", { ascending: true });

  if (teamsError) {
    throw new Error("Could not load teams.");
  }

  const { data: predictionData, error: predictionError } = await supabase
    .from("tournament_predictions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (predictionError) {
    throw new Error("Could not load tournament prediction.");
  }

  const { data: isTournamentStarted, error: lockedError } = await supabase.rpc(
    "is_tournament_started",
  );

  if (lockedError) {
    throw new Error("Could not verify tournament status.");
  }

  const unlockUntil = new Date("2026-06-13T00:00:00+02:00");

  const isLocked = Boolean(isTournamentStarted) && new Date() >= unlockUntil;

  const { data: publicPredictionsData, error: publicPredictionsError } =
    Boolean(isLocked)
      ? await supabase
          .from("tournament_predictions_public_view")
          .select("*")
          .order("total_points", { ascending: false })
          .order("username", { ascending: true })
      : { data: [], error: null };

  if (publicPredictionsError) {
    throw new Error("Could not load public tournament predictions.");
  }

  const teams = (teamsData || []) as TournamentTeamOption[];
  const prediction = predictionData as TournamentPrediction | null;
  const publicPredictions = (publicPredictionsData ||
    []) as PublicTournamentPrediction[];

  return (
    <section className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <Badge className="mb-4 rounded-full">Bonusy na cały Mundial</Badge>

        <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
          Wielkie proroctwa
        </h1>

        <p className="mt-3 max-w-3xl text-muted-foreground">
          Tu typujesz rzeczy, które będą się za Tobą ciągnęły przez cały
          Mundial: mistrz, finaliści, TOP 4, król strzelców i najbardziej
          bramkostrzelna drużyna. Jedna decyzja, kilka tygodni stresu.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <TournamentPredictionForm
          teams={teams}
          initialPrediction={prediction}
          isLocked={Boolean(isLocked)}
        />

        <TournamentBonusRulesCard />
      </div>

      <div className="mt-6">
        {Boolean(isLocked) ? (
          <div className="space-y-6">
            <TournamentCommunityStats predictions={publicPredictions} />

            <PublicTournamentPredictionsList predictions={publicPredictions} />
          </div>
        ) : (
          <TournamentPredictionsLockedCommunityCard />
        )}
      </div>
    </section>
  );
}
