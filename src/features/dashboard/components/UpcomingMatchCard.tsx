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
import { AppLink } from "@/src/components/navigation/AppLink";

type UpcomingMatchCardProps = {
  match: MatchListItem;
  prediction?: MyMatchPrediction;
};

export function UpcomingMatchCard({
  match,
  prediction,
}: UpcomingMatchCardProps) {
  const homeTeamName =
    match.home_team_name_pl || match.home_team_name_en || match.home_team_code;

  const awayTeamName =
    match.away_team_name_pl || match.away_team_name_en || match.away_team_code;

  const competitionLabel = match.group_name
    ? formatGroupName(match.group_name)
    : match.round_label || "Faza pucharowa";

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full bg-background px-3 py-1.5">
              {competitionLabel}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
              <Clock className="h-4 w-4" />
              {formatMatchDate(match.kickoff_time)},{" "}
              {formatMatchTime(match.kickoff_time)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <TeamFlag
                name={homeTeamName}
                flagCode={match.home_team_flag_code}
                flagEmoji={match.home_team_flag_emoji}
                className="h-9 w-9 sm:h-11 sm:w-11"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-black sm:text-base">
                  {homeTeamName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.home_team_code}
                </p>
              </div>
            </div>

            <div className="text-center font-heading text-lg text-muted-foreground sm:text-2xl">
              VS
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <div className="min-w-0 sm:text-right">
                <p className="truncate text-sm font-black sm:text-base">
                  {awayTeamName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.away_team_code}
                </p>
              </div>

              <TeamFlag
                name={awayTeamName}
                flagCode={match.away_team_flag_code}
                flagEmoji={match.away_team_flag_emoji}
                className="h-9 w-9 sm:h-11 sm:w-11"
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
          <AppLink href={`/matches/${match.id}`}>
            {prediction ? "Podejrzyj typ" : "Obstaw teraz"}
          </AppLink>
        </Button>
      </div>
    </div>
  );
}
