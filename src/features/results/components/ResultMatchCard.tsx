import Link from "next/link";
import { Beer, CalendarDays, Target, Trophy, XCircle } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { ResultMatchItem } from "@/src/features/results/types/result.types";
import {
  formatGroupName,
  formatMatchDate,
  formatMatchTime,
} from "@/src/features/matches/utils/match-formatters";

type ResultMatchCardProps = {
  match: ResultMatchItem;
};

export function ResultMatchCard({ match }: ResultMatchCardProps) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full">Rozliczone</Badge>

            <Badge variant="secondary" className="rounded-full">
              {formatGroupName(match.group_name)}
            </Badge>

            <Badge variant="outline" className="rounded-full bg-white">
              Mecz #{match.match_number}
            </Badge>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="flex items-center gap-3">
              <TeamFlag
                name={match.home_team_name_pl}
                flagCode={match.home_team_flag_code}
                flagEmoji={match.home_team_flag_emoji}
                className="h-12 w-12"
              />

              <div className="min-w-0">
                <p className="truncate text-lg font-black">
                  {match.home_team_name_pl}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.home_team_code}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-foreground px-8 py-4 text-center text-background">
              <p className="text-xs uppercase tracking-[0.18em] text-background/60">
                Wynik
              </p>
              <p className="font-heading text-5xl">
                {match.home_score}
                <span className="mx-3 text-background/40">:</span>
                {match.away_score}
              </p>
            </div>

            <div className="flex items-center gap-3 md:justify-end">
              <div className="min-w-0 md:text-right">
                <p className="truncate text-lg font-black">
                  {match.away_team_name_pl}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.away_team_code}
                </p>
              </div>

              <TeamFlag
                name={match.away_team_name_pl}
                flagCode={match.away_team_flag_code}
                flagEmoji={match.away_team_flag_emoji}
                className="h-12 w-12"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatMatchDate(match.kickoff_time)},{" "}
              {formatMatchTime(match.kickoff_time)}
            </span>

            {match.venue_city_pl ? (
              <span className="rounded-full bg-background px-3 py-1.5">
                {match.venue_city_pl}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:w-107.5">
          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-sm text-muted-foreground">Typów</p>
            <p className="font-heading text-3xl">{match.predictions_count}</p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Idealne
            </div>
            <p className="font-heading text-3xl">{match.exact_scores_count}</p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              Za 1 pkt
            </div>
            <p className="font-heading text-3xl">
              {match.correct_results_count}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4" />
              Pudła
            </div>
            <p className="font-heading text-3xl">
              {match.wrong_predictions_count}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3 sm:col-span-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Beer className="h-4 w-4" />
              Punkty rozdane
            </div>
            <p className="font-heading text-3xl">
              {match.total_points_awarded}
            </p>
          </div>

          <Button asChild className="rounded-full sm:col-span-2">
            <Link href={`/matches/${match.id}`}>
              Zobacz szczegóły kompromitacji
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
