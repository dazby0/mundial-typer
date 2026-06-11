import { Crown, Flame, Goal, Trophy } from "lucide-react";
import { PublicTournamentPrediction } from "@/src/features/tournament-predictions/types/tournament-prediction.types";
import { getTournamentCommunityStats } from "@/src/features/tournament-predictions/utils/tournament-community-stats";
import { TournamentPredictionTeamPill } from "@/src/features/tournament-predictions/components/TournamentPredictionTeamPill";

type TournamentCommunityStatsProps = {
  predictions: PublicTournamentPrediction[];
};

export function TournamentCommunityStats({
  predictions,
}: TournamentCommunityStatsProps) {
  const {
    totalPredictions,
    mostPopularChampion,
    mostPopularTopScorer,
    mostPopularTopScoringTeam,
    highestBonusPrediction,
  } = getTournamentCommunityStats(predictions);

  if (totalPredictions === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Crown className="h-5 w-5" />
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Grupa wierzy w
        </p>

        <div className="mt-3">
          {mostPopularChampion ? (
            <TournamentPredictionTeamPill
              name={mostPopularChampion.name}
              code={mostPopularChampion.code}
              flagCode={mostPopularChampion.flagCode}
              flagEmoji={mostPopularChampion.flagEmoji}
            />
          ) : null}
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          {mostPopularChampion?.count || 0} osób typuje ten kraj na mistrza.
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Flame className="h-5 w-5" />
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Król Exceli
        </p>

        <p className="mt-3 text-2xl font-black">
          {mostPopularTopScorer?.value || "-"}
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          {mostPopularTopScorer?.count || 0} osób wpisało tego samego strzelca.
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Goal className="h-5 w-5" />
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Według grupy najwięcej goli
        </p>

        <div className="mt-3">
          {mostPopularTopScoringTeam ? (
            <TournamentPredictionTeamPill
              name={mostPopularTopScoringTeam.name}
              code={mostPopularTopScoringTeam.code}
              flagCode={mostPopularTopScoringTeam.flagCode}
              flagEmoji={mostPopularTopScoringTeam.flagEmoji}
            />
          ) : null}
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          {mostPopularTopScoringTeam?.count || 0} osób liczy na ofensywny
          festyn.
        </p>
      </div>

      <div className="rounded-[2rem] bg-foreground p-5 text-background shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-foreground">
          <Trophy className="h-5 w-5" />
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-background/60">
          Najlepsze proroctwo
        </p>

        <p className="mt-3 text-2xl font-black">
          {highestBonusPrediction?.username || "-"}
        </p>

        <p className="mt-3 text-sm text-background/70">
          {highestBonusPrediction?.total_points || 0} pkt z bonusów
          turniejowych.
        </p>
      </div>
    </div>
  );
}
