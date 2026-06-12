import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { MatchListItem } from "@/src/features/matches/types/match.types";
import {
  formatGroupName,
  formatMatchDate,
  formatMatchTime,
} from "@/src/features/matches/utils/match-formatters";
import { AppLink } from "@/src/components/navigation/AppLink";

type NextMissingPredictionCardProps = {
  match: MatchListItem | null;
  todayMissingCount: number;
};

export function NextMissingPredictionCard({
  match,
  todayMissingCount,
}: NextMissingPredictionCardProps) {
  if (!match) {
    return (
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xl font-black">Nie ma zaległych typów</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Wszystko ogarnięte. Podejrzanie profesjonalnie, ale nie będziemy
              psuć atmosfery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-foreground p-4 sm:p-6 text-background shadow-sm">
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background text-foreground">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-background/60">
                Najbliższy brak typu
              </p>

              <h2 className="mt-1 text-lg sm:text-2xl font-black">
                Ratuj honor, zanim zamkną bramkę
              </h2>

              <p className="mt-2 text-sm text-background/70">
                {todayMissingCount > 0
                  ? `Dzisiaj masz ${todayMissingCount} mecze bez typu. To już nie jest planowanie, to gaszenie pożaru.`
                  : "Ten mecz jest najbliżej bez Twojego typu. Jeszcze możesz udawać, że to była przemyślana decyzja."}
              </p>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 grid gap-2 sm:gap-4 grid-cols-[1fr_auto_1fr] items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <TeamFlag
                name={match.home_team_name_pl}
                flagCode={match.home_team_flag_code}
                flagEmoji={match.home_team_flag_emoji}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />

              <div className="min-w-0">
                <p className="truncate font-black text-sm sm:text-base">
                  {match.home_team_name_pl}
                </p>
                <p className="text-xs text-background/60">
                  {match.home_team_code}
                </p>
              </div>
            </div>

            <div className="text-center font-heading text-2xl text-background/50">
              VS
            </div>

            <div className="flex items-center gap-2 sm:gap-3 justify-end">
              <div className="min-w-0 text-right">
                <p className="truncate font-black text-sm sm:text-base">
                  {match.away_team_name_pl}
                </p>
                <p className="text-xs text-background/60">
                  {match.away_team_code}
                </p>
              </div>

              <TeamFlag
                name={match.away_team_name_pl}
                flagCode={match.away_team_flag_code}
                flagEmoji={match.away_team_flag_emoji}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
            </div>
          </div>

          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 text-xs sm:text-sm text-background/70">
            <span className="rounded-full bg-background/10 px-3 py-1.5">
              {formatGroupName(match.group_name)}
            </span>

            <span className="rounded-full bg-background/10 px-3 py-1.5">
              {formatMatchDate(match.kickoff_time)},{" "}
              {formatMatchTime(match.kickoff_time)}
            </span>
          </div>
        </div>

        <Button
          asChild
          className="w-full rounded-full bg-background text-foreground hover:bg-background/90"
        >
          <AppLink href={`/matches/${match.id}`}>Obstaw teraz</AppLink>
        </Button>
      </div>
    </div>
  );
}
