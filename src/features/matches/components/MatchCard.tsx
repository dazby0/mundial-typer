import { MapPin } from "lucide-react";
import { MatchListItem, MyMatchPrediction } from "../types/match.types";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import {
  formatGroupName,
  formatMatchTime,
  getMatchStatusLabel,
} from "../utils/match-formatters";
import { Badge } from "@/src/components/ui/badge";
import { TeamLine } from "./TeamLine";
import { Button } from "@/src/components/ui/button";
import {
  getHoursToKickoff,
  isLastCallMatch,
  isMatchToday,
  isStartingSoon,
} from "../utils/match-filters";
import { AppLink } from "@/src/components/navigation/AppLink";

type MatchCardProps = {
  match: MatchListItem;
  myPrediction?: MyMatchPrediction;
};

export function MatchCard({ match, myPrediction }: MatchCardProps) {
  const isFinished = match.status === "finished";
  const matchToday = isMatchToday(match);
  const lastCall = isLastCallMatch(match);
  const startingSoon = isStartingSoon(match);
  const hoursToKickoff = getHoursToKickoff(match);

  return (
    <Card className="border-0 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Mecz #{match.match_number}
            </p>
            <p className="mt-1 text-sm font-medium text-primary">
              {formatGroupName(match.group_name)}
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {matchToday ? (
              <Badge variant="secondary" className="rounded-full">
                Dzisiaj
              </Badge>
            ) : null}

            {lastCall ? (
              <Badge variant="destructive" className="rounded-full">
                Ostatnia szansa
              </Badge>
            ) : null}

            {!lastCall && startingSoon ? (
              <Badge variant="secondary" className="rounded-full">
                Start za {hoursToKickoff}h
              </Badge>
            ) : null}

            <Badge
              variant={isFinished ? "secondary" : "default"}
              className="rounded-full"
            >
              {getMatchStatusLabel(match.status)}
            </Badge>
          </div>
        </div>

        <div className="rounded-3xl bg-background p-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-3xl">
              {formatMatchTime(match.kickoff_time)}
            </p>
            <p className="text-sm text-muted-foreground">
              Kolejka {match.matchday}
            </p>
          </div>

          {match.venue_city_pl ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {match.venue_city_pl}
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <TeamLine
            name={match.home_team_name_pl}
            code={match.home_team_code}
            flagCode={match.home_team_flag_code}
            flagEmoji={match.home_team_flag_emoji}
            score={match.home_score}
          />

          <div className="h-px bg-border" />

          <TeamLine
            name={match.away_team_name_pl}
            code={match.away_team_code}
            flagCode={match.away_team_flag_code}
            flagEmoji={match.away_team_flag_emoji}
            score={match.away_score}
          />

          <div className="rounded-2xl bg-background px-4 py-3">
            {myPrediction ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Status typu
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Dowody są zapisane w systemie.
                  </p>
                </div>

                <p className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Zatwierdzono
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Status typu
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Jeszcze cisza. Ekspert analizuje.
                  </p>
                </div>

                <p className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Nie typowano
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="mt-6 w-full rounded-full bg-white"
        >
          <AppLink href={`/matches/${match.id}`}>Szczegóły i typowanie</AppLink>
        </Button>
      </CardContent>
    </Card>
  );
}
