import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import {
  MatchListItem,
  MyMatchPrediction,
} from "@/src/features/matches/types/match.types";
import {
  formatGroupName,
  formatMatchDate,
  formatMatchTime,
} from "@/src/features/matches/utils/match-formatters";

type UpcomingMatchCardProps = {
  match: MatchListItem;
  prediction?: MyMatchPrediction;
};

export function UpcomingMatchCard({
  match,
  prediction,
}: UpcomingMatchCardProps) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full bg-background px-3 py-1.5">
              {formatGroupName(match.group_name)}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
              <Clock className="h-4 w-4" />
              {formatMatchDate(match.kickoff_time)},{" "}
              {formatMatchTime(match.kickoff_time)}
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="flex items-center gap-3">
              <TeamFlag
                name={match.home_team_name_pl}
                flagCode={match.home_team_flag_code}
                flagEmoji={match.home_team_flag_emoji}
                className="h-11 w-11"
              />

              <div className="min-w-0">
                <p className="truncate font-black">{match.home_team_name_pl}</p>
                <p className="text-xs text-muted-foreground">
                  {match.home_team_code}
                </p>
              </div>
            </div>

            <div className="text-center font-heading text-2xl text-muted-foreground">
              VS
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              <div className="min-w-0 sm:text-right">
                <p className="truncate font-black">{match.away_team_name_pl}</p>
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

          <p className="mt-4 text-sm text-muted-foreground">
            {prediction
              ? `Typ zapisany. Dowody są w systemie: ${prediction.predicted_home_score}:${prediction.predicted_away_score}.`
              : "Jeszcze nie typowano. Ekspert niby analizuje, ale zegar tyka."}
          </p>
        </div>

        <Button asChild className="rounded-full">
          <Link href={`/matches/${match.id}`}>
            {prediction ? "Podejrzyj typ" : "Obstaw teraz"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
