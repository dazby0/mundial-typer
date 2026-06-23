import {
  Beer,
  CalendarDays,
  Percent,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { ResultMatchItem } from "@/src/features/results/types/result.types";
import {
  formatGroupName,
  formatMatchDate,
  formatMatchTime,
} from "@/src/features/matches/utils/match-formatters";
import { AppLink } from "@/src/components/navigation/AppLink";
import {
  getResolutionMethodLabel,
  isKnockoutStage,
} from "@/src/features/knockout/utils/knockout-rules";

type ResultMatchCardProps = {
  match: ResultMatchItem;
};

export function ResultMatchCard({ match }: ResultMatchCardProps) {
  const isKnockoutMatch = isKnockoutStage(match.stage);

  const homeTeamName = match.home_team_name_pl || match.home_team_code;
  const awayTeamName = match.away_team_name_pl || match.away_team_code;
  const winnerTeamName =
    match.winner_team_name_pl || match.winner_team_code || null;

  const competitionLabel = isKnockoutMatch
    ? match.round_label || "Faza pucharowa"
    : formatGroupName(match.group_name || "");

  const hasPenaltyResult =
    match.resolution_method === "penalties" &&
    match.home_penalty_score !== null &&
    match.away_penalty_score !== null;

  const knockoutWinnerOnlyCount = Math.max(
    match.correct_results_count - match.knockout_method_predictions_count,
    0,
  );

  const successfulPredictionsCount =
    match.exact_scores_count + match.correct_results_count;

  const accuracyRate =
    match.predictions_count > 0
      ? Math.round((successfulPredictionsCount / match.predictions_count) * 100)
      : 0;

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full">Rozliczone</Badge>

            <Badge variant="secondary" className="rounded-full">
              {competitionLabel}
            </Badge>

            <Badge variant="outline" className="rounded-full bg-white">
              Mecz #{match.match_number ?? "-"}
            </Badge>

            {isKnockoutMatch && match.resolution_method ? (
              <Badge variant="outline" className="rounded-full bg-white">
                {getResolutionMethodLabel(match.resolution_method)}
              </Badge>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <TeamFlag
                name={homeTeamName}
                flagCode={match.home_team_flag_code}
                flagEmoji={match.home_team_flag_emoji}
                className="h-8 w-8 shrink-0 sm:h-12 sm:w-12"
              />

              <div className="min-w-0">
                <p className="truncate text-xs font-black sm:text-lg">
                  {homeTeamName}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {match.home_team_code}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-foreground px-3 py-2 text-center text-background sm:rounded-2xl sm:px-6 sm:py-4">
              <p className="hidden text-xs uppercase tracking-[0.18em] text-background/60 sm:block">
                Wynik
              </p>

              <p className="font-heading text-2xl sm:text-5xl">
                {match.home_score}
                <span className="mx-1 text-background/40 sm:mx-3">:</span>
                {match.away_score}
              </p>

              {hasPenaltyResult ? (
                <p className="mt-1 text-xs text-background/60">
                  karne {match.home_penalty_score}:{match.away_penalty_score}
                </p>
              ) : null}
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
              <div className="min-w-0 text-right">
                <p className="truncate text-xs font-black sm:text-lg">
                  {awayTeamName}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {match.away_team_code}
                </p>
              </div>

              <TeamFlag
                name={awayTeamName}
                flagCode={match.away_team_flag_code}
                flagEmoji={match.away_team_flag_emoji}
                className="h-8 w-8 shrink-0 sm:h-12 sm:w-12"
              />
            </div>
          </div>

          {isKnockoutMatch && winnerTeamName ? (
            <div className="mt-3 rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground">
              Awans:{" "}
              <span className="font-semibold text-foreground">
                {winnerTeamName}
              </span>
            </div>
          ) : null}

          <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
            <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-background px-3 py-1.5 sm:gap-2">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />

              <span className="truncate">
                {formatMatchDate(match.kickoff_time)},{" "}
                {formatMatchTime(match.kickoff_time)}
              </span>
            </span>

            {match.venue_city_pl ? (
              <span className="shrink-0 rounded-full bg-background px-3 py-1.5">
                {match.venue_city_pl}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground sm:text-sm">Typów</p>
            <p className="mt-0.5 font-heading text-2xl sm:text-3xl">
              {match.predictions_count}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Idealne
            </div>

            <p className="mt-0.5 font-heading text-2xl sm:text-3xl">
              {isKnockoutMatch
                ? match.knockout_perfect_predictions_count
                : match.exact_scores_count}
            </p>

            <p className="text-xs text-muted-foreground">
              {isKnockoutMatch ? "4 pkt" : "3 pkt"}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {isKnockoutMatch ? "Sposób" : "Za 1 pkt"}
            </div>

            <p className="mt-0.5 font-heading text-2xl sm:text-3xl">
              {isKnockoutMatch
                ? match.knockout_method_predictions_count
                : match.correct_results_count}
            </p>

            <p className="text-xs text-muted-foreground">
              {isKnockoutMatch ? "2 pkt" : "dobry rezultat"}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {isKnockoutMatch ? "Awans" : "Pudła"}
            </div>

            <p className="mt-0.5 font-heading text-2xl sm:text-3xl">
              {isKnockoutMatch
                ? knockoutWinnerOnlyCount
                : match.wrong_predictions_count}
            </p>

            <p className="text-xs text-muted-foreground">
              {isKnockoutMatch ? "1 pkt" : "0 pkt"}
            </p>
          </div>

          {isKnockoutMatch ? (
            <div className="rounded-2xl bg-background px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Pudła
              </div>

              <p className="mt-0.5 font-heading text-2xl sm:text-3xl">
                {match.wrong_predictions_count}
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <Beer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Punkty
            </div>

            <p className="mt-0.5 font-heading text-2xl sm:text-3xl">
              {match.total_points_awarded}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Skuteczność
            </div>

            <p className="mt-0.5 font-heading text-2xl sm:text-3xl">
              {accuracyRate}%
            </p>
          </div>

          <Button asChild className="col-span-2 mt-1 rounded-full">
            <AppLink href={`/matches/${match.id}`}>
              Zobacz szczegóły kompromitacji
            </AppLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
