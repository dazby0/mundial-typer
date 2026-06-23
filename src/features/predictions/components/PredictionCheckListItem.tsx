import { Lock, Pencil, Plus, Trophy } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import {
  MatchListItem,
  MyMatchPrediction,
} from "@/src/features/matches/types/match.types";
import {
  formatMatchDate,
  formatMatchTime,
  formatGroupName,
} from "@/src/features/matches/utils/match-formatters";
import { isMatchUrgent } from "../utils/prediction-checklist";
import { AppLink } from "@/src/components/navigation/AppLink";

type PredictionChecklistItemProps = {
  match: MatchListItem;
  prediction?: MyMatchPrediction;
};

function getActionLabel(matchStarted: boolean, prediction?: MyMatchPrediction) {
  if (matchStarted) {
    return "Zobacz mecz";
  }

  if (prediction) {
    return "Popraw typ";
  }

  return "Dodaj typ";
}

function getActionIcon(matchStarted: boolean, prediction?: MyMatchPrediction) {
  if (matchStarted) {
    return <Lock className="h-4 w-4" />;
  }

  if (prediction) {
    return <Pencil className="h-4 w-4" />;
  }

  return <Plus className="h-4 w-4" />;
}

export function PredictionChecklistItem({
  match,
  prediction,
}: PredictionChecklistItemProps) {
  // eslint-disable-next-line react-hooks/purity
  const matchStarted = new Date(match.kickoff_time).getTime() <= Date.now();
  const isFinished = match.status === "finished";
  const hasResult = match.home_score !== null && match.away_score !== null;
  const isUrgent = !prediction && !matchStarted && isMatchUrgent(match);

  const homeTeamName =
    match.home_team_name_pl || match.home_team_name_en || match.home_team_code;

  const awayTeamName =
    match.away_team_name_pl || match.away_team_name_en || match.away_team_code;

  const competitionLabel = match.group_name
    ? formatGroupName(match.group_name)
    : match.round_label || "Faza pucharowa";

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {competitionLabel}
              </Badge>

              <Badge variant="outline" className="rounded-full bg-white">
                Mecz #{match.match_number}
              </Badge>

              {isFinished ? (
                <Badge className="rounded-full">Rozliczone</Badge>
              ) : matchStarted ? (
                <Badge variant="secondary" className="rounded-full">
                  Zamknięte
                </Badge>
              ) : prediction ? (
                <Badge className="rounded-full">Typ zatwierdzony</Badge>
              ) : (
                <Badge variant="destructive" className="rounded-full">
                  Nie typowano
                </Badge>
              )}

              {isUrgent ? (
                <Badge variant="destructive" className="rounded-full">
                  Pilne — zaraz zamykamy bramkę
                </Badge>
              ) : null}
            </div>

            <Button
              asChild
              size="sm"
              className="w-full shrink-0 rounded-full sm:w-auto"
            >
              <AppLink href={`/matches/${match.id}`}>
                {getActionIcon(matchStarted, prediction)}
                {getActionLabel(matchStarted, prediction)}
              </AppLink>
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <TeamFlag
                name={homeTeamName}
                flagCode={match.home_team_flag_code}
                flagEmoji={match.home_team_flag_emoji}
                className="h-8 w-8 shrink-0 sm:h-11 sm:w-11"
              />

              <div className="min-w-0">
                <p className="truncate text-xs font-bold sm:text-base">
                  {match.home_team_name_pl}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {match.home_team_code}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center rounded-xl bg-background px-3 py-2 sm:rounded-2xl sm:px-5 sm:py-3">
              {prediction ? (
                <div className="text-center">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs sm:tracking-[0.18em]">
                    Twój typ
                  </p>
                  <p className="font-heading text-2xl sm:text-3xl">
                    {prediction.predicted_home_score}:
                    {prediction.predicted_away_score}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs sm:tracking-[0.18em]">
                    Twój typ
                  </p>
                  <p className="font-heading text-2xl text-muted-foreground sm:text-3xl">
                    -:-
                  </p>
                </div>
              )}
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
              <div className="min-w-0 text-right">
                <p className="truncate text-xs font-bold sm:text-base">
                  {match.away_team_name_pl}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {match.away_team_code}
                </p>
              </div>

              <TeamFlag
                name={awayTeamName}
                flagCode={match.away_team_flag_code}
                flagEmoji={match.away_team_flag_emoji}
                className="h-8 w-8 shrink-0 sm:h-11 sm:w-11"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="rounded-full bg-background px-3 py-1.5">
              {formatMatchDate(match.kickoff_time)},{" "}
              {formatMatchTime(match.kickoff_time)}
            </span>

            <span className="rounded-full bg-background px-3 py-1.5">
              Kolejka {match.matchday}
            </span>

            {hasResult ? (
              <span className="rounded-full bg-background px-3 py-1.5">
                Wynik: {match.home_score}:{match.away_score}
              </span>
            ) : null}

            {prediction?.points !== null && prediction?.points !== undefined ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1.5">
                <Trophy className="h-4 w-4" />
                {prediction.points} pkt
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
