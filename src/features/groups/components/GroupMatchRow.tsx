import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { GroupMatchItem } from "@/src/features/groups/types/group-match.types";
import {
  formatMatchDate,
  formatMatchTime,
} from "@/src/features/matches/utils/match-formatters";
import { AppLink } from "@/src/components/navigation/AppLink";

type GroupMatchRowProps = {
  match: GroupMatchItem;
};

export function GroupMatchRow({ match }: GroupMatchRowProps) {
  const hasResult = match.home_score !== null && match.away_score !== null;

  return (
    <div className="rounded-2xl bg-background p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 md:grid-cols-[1fr_auto_1fr_auto] md:gap-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <TeamFlag
            name={match.home_team_name_pl}
            flagCode={match.home_team_flag_code}
            flagEmoji={match.home_team_flag_emoji}
            className="h-7 w-7 shrink-0 bg-white md:h-9 md:w-9"
          />

          <div className="min-w-0">
            <p className="truncate text-xs font-bold sm:text-sm md:text-base">
              {match.home_team_name_pl}
            </p>
            <p className="text-[10px] text-muted-foreground md:text-xs">
              {match.home_team_code}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-3 py-2 text-center md:rounded-2xl md:px-5 md:py-3">
          <p className="font-heading text-lg md:text-2xl">
            {hasResult ? `${match.home_score}:${match.away_score}` : "VS"}
          </p>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2 md:gap-3">
          <div className="min-w-0 text-right">
            <p className="truncate text-xs font-bold sm:text-sm md:text-base">
              {match.away_team_name_pl}
            </p>
            <p className="text-[10px] text-muted-foreground md:text-xs">
              {match.away_team_code}
            </p>
          </div>

          <TeamFlag
            name={match.away_team_name_pl}
            flagCode={match.away_team_flag_code}
            flagEmoji={match.away_team_flag_emoji}
            className="h-7 w-7 shrink-0 bg-white md:h-9 md:w-9"
          />
        </div>

        <Button
          asChild
          variant="outline"
          className="col-span-3 mt-2 rounded-full bg-white md:col-span-1 md:mt-0"
        >
          <AppLink href={`/matches/${match.id}`}>Mecz</AppLink>
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
