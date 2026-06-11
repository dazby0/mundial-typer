import Link from "next/link";
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

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {formatGroupName(match.group_name)}
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

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="flex items-center gap-3">
              <TeamFlag
                name={match.home_team_name_pl}
                flagCode={match.home_team_flag_code}
                flagEmoji={match.home_team_flag_emoji}
                className="h-11 w-11"
              />

              <div className="min-w-0">
                <p className="truncate font-bold">{match.home_team_name_pl}</p>
                <p className="text-xs text-muted-foreground">
                  {match.home_team_code}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center rounded-2xl bg-background px-5 py-3">
              {prediction ? (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Twój typ
                  </p>
                  <p className="font-heading text-3xl">
                    {prediction.predicted_home_score}:
                    {prediction.predicted_away_score}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Twój typ
                  </p>
                  <p className="font-heading text-3xl text-muted-foreground">
                    -:-
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 md:justify-end">
              <div className="min-w-0 md:text-right">
                <p className="truncate font-bold">{match.away_team_name_pl}</p>
                <p className="text-xs text-muted-foreground">
                  {match.away_team_code}
                </p>
              </div>

              <TeamFlag
                name={match.away_team_name_pl}
                flagCode={match.away_team_flag_code}
                flagEmoji={match.away_team_flag_emoji}
                className="h-11 w-11"
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

        <Button asChild className="rounded-full lg:w-auto">
          <Link href={`/matches/${match.id}`}>
            {getActionIcon(matchStarted, prediction)}
            {getActionLabel(matchStarted, prediction)}
          </Link>
        </Button>
      </div>
    </div>
  );
}
