import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { GroupMatchItem } from "@/src/features/groups/types/group-match.types";
import {
  formatMatchDate,
  formatMatchTime,
} from "@/src/features/matches/utils/match-formatters";

type GroupMatchRowProps = {
  match: GroupMatchItem;
};

export function GroupMatchRow({ match }: GroupMatchRowProps) {
  const hasResult = match.home_score !== null && match.away_score !== null;

  return (
    <div className="rounded-2xl bg-background p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
        <div className="flex items-center gap-3">
          <TeamFlag
            name={match.home_team_name_pl}
            flagCode={match.home_team_flag_code}
            flagEmoji={match.home_team_flag_emoji}
            className="h-9 w-9 bg-white"
          />

          <div className="min-w-0">
            <p className="truncate font-bold">{match.home_team_name_pl}</p>
            <p className="text-xs text-muted-foreground">
              {match.home_team_code}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white px-5 py-3 text-center">
          <p className="font-heading text-2xl">
            {hasResult ? `${match.home_score}:${match.away_score}` : "VS"}
          </p>
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
            className="h-9 w-9 bg-white"
          />
        </div>

        <Button asChild variant="outline" className="rounded-full bg-white">
          <Link href={`/matches/${match.id}`}>Mecz</Link>
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatMatchDate(match.kickoff_time)},{" "}
          {formatMatchTime(match.kickoff_time)}
        </span>

        <span className="rounded-full bg-white px-3 py-1.5">
          Kolejka {match.matchday}
        </span>

        {match.venue_city_pl ? (
          <span className="rounded-full bg-white px-3 py-1.5">
            {match.venue_city_pl}
          </span>
        ) : null}
      </div>
    </div>
  );
}
