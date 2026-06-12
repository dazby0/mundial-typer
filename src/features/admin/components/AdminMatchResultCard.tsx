import { CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import {
  formatGroupName,
  formatMatchDate,
  formatMatchTime,
  getMatchStatusLabel,
} from "@/src/features/matches/utils/match-formatters";
import { AdminResultForm } from "@/src/features/admin/components/AdminResultForm";
import { AdminMatchItem } from "@/src/features/admin/types/admin-match.types";
import { AppLink } from "@/src/components/navigation/AppLink";

type AdminMatchResultCardProps = {
  match: AdminMatchItem;
};

export function AdminMatchResultCard({ match }: AdminMatchResultCardProps) {
  const hasResult = match.home_score !== null && match.away_score !== null;

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {formatGroupName(match.group_name)}
            </Badge>

            <Badge variant="outline" className="rounded-full bg-white">
              Mecz #{match.match_number}
            </Badge>

            <Badge
              className="rounded-full"
              variant={hasResult ? "default" : "secondary"}
            >
              {hasResult ? "Wynik wpisany" : getMatchStatusLabel(match.status)}
            </Badge>

            <Badge variant="outline" className="rounded-full bg-white">
              <Users className="mr-1 h-3.5 w-3.5" />
              {match.predictions_count} typów do przeliczenia
            </Badge>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
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

            <div className="rounded-2xl bg-foreground px-6 py-4 text-center text-background">
              <p className="text-xs uppercase tracking-[0.18em] text-background/60">
                Wynik
              </p>
              <p className="font-heading text-4xl">
                {match.home_score === null ? "-" : match.home_score}
                <span className="mx-2 text-background/40">:</span>
                {match.away_score === null ? "-" : match.away_score}
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
              <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
                <MapPin className="h-4 w-4" />
                {match.venue_city_pl}
              </span>
            ) : null}
          </div>
        </div>

        <div className="w-full xl:w-[320px]">
          <AdminResultForm match={match} />

          <Button
            asChild
            variant="outline"
            className="mt-3 w-full rounded-full bg-white"
          >
            <AppLink href={`/matches/${match.id}`}>Podejrzyj mecz</AppLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
