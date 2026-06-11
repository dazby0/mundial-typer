import { BarChart3, Lock, Target, Trophy, Users, XCircle } from "lucide-react";
import { MatchPrediction } from "@/src/features/matches/types/match.types";
import {
  getFinishedPredictionStats,
  getMostPopularScore,
  getPredictionStats,
  getUserAgainstCrowdMessage,
} from "@/src/features/predictions/utils/prediction-stats";

type MatchPredictionStatsProps = {
  predictions: MatchPrediction[];
  myPrediction: MatchPrediction | null;
  matchStarted: boolean;
  matchFinished: boolean;
  homeTeamName: string;
  awayTeamName: string;
};

export function MatchPredictionStats({
  predictions,
  myPrediction,
  matchStarted,
  matchFinished,
  homeTeamName,
  awayTeamName,
}: MatchPredictionStatsProps) {
  if (!matchStarted) {
    return (
      <div className="rounded-3xl bg-background p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-muted-foreground">
            <Lock className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold">
              Statystyki zamknięte do pierwszego gwizdka
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nie ma podglądania tłumu. Typujesz głową, sercem albo kompletnym
              przypadkiem.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = getPredictionStats(predictions);
  const popularScore = getMostPopularScore(predictions);
  const crowdMessage = getUserAgainstCrowdMessage(myPrediction, predictions);
  const finishedStats = getFinishedPredictionStats(predictions);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-background p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold">Nastroje typerów</p>
            <p className="text-sm text-muted-foreground">
              Typy odkryte. Teraz widać, kto myślał, a kto klikał jak leciało.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-sm text-muted-foreground">{homeTeamName}</p>
            <p className="font-heading text-3xl">{stats.homeWins}</p>
            <p className="text-xs text-muted-foreground">typów na wygraną</p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-sm text-muted-foreground">Remis</p>
            <p className="font-heading text-3xl">{stats.draws}</p>
            <p className="text-xs text-muted-foreground">ludzi bez odwagi</p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-sm text-muted-foreground">{awayTeamName}</p>
            <p className="font-heading text-3xl">{stats.awayWins}</p>
            <p className="text-xs text-muted-foreground">typów na wygraną</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Łącznie typów
            </div>
            <p className="mt-1 font-heading text-3xl">{stats.total}</p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Najpopularniejszy wynik
            </div>
            <p className="mt-1 font-heading text-3xl">
              {popularScore ? popularScore.score : "-:-"}
            </p>
            <p className="text-xs text-muted-foreground">
              {popularScore
                ? `${popularScore.count} osób uznało, że to brzmi mądrze`
                : "Brak typów"}
            </p>
          </div>
        </div>

        {crowdMessage ? (
          <div className="mt-3 rounded-2xl bg-foreground px-4 py-3 text-sm text-background">
            {crowdMessage}
          </div>
        ) : null}
      </div>

      {matchFinished ? (
        <div className="rounded-3xl bg-background p-5">
          <div className="mb-4">
            <p className="font-semibold">Rozliczenie typów</p>
            <p className="text-sm text-muted-foreground">
              Tu już nie ma filozofii. Jest wynik, punkty i cisza po złych
              decyzjach.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                Idealne
              </div>
              <p className="mt-1 font-heading text-3xl">
                {finishedStats.exactScores}
              </p>
              <p className="text-xs text-muted-foreground">3 pkt</p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                Dobry rezultat
              </div>
              <p className="mt-1 font-heading text-3xl">
                {finishedStats.correctResults}
              </p>
              <p className="text-xs text-muted-foreground">1 pkt</p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4" />
                Pudła
              </div>
              <p className="mt-1 font-heading text-3xl">
                {finishedStats.wrongPredictions}
              </p>
              <p className="text-xs text-muted-foreground">
                0 pkt i temat zamknięty
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
