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
import {
  getResolutionMethodLabel,
  isKnockoutStage,
} from "@/src/features/knockout/utils/knockout-rules";

type AdminMatchResultCardProps = {
  match: AdminMatchItem;
};

function AdminMatchSummary({ match }: AdminMatchResultCardProps) {
  const hasResult = match.home_score !== null && match.away_score !== null;
  const isKnockoutMatch = isKnockoutStage(match.stage);

  const competitionLabel = isKnockoutMatch
    ? match.round_label || "Faza pucharowa"
    : formatGroupName(match.group_name || "");

  const homeTeamName =
    match.home_team_name_pl || match.home_team_name_en || match.home_team_code;

  const awayTeamName =
    match.away_team_name_pl || match.away_team_name_en || match.away_team_code;

  const hasPenaltyResult =
    match.resolution_method === "penalties" &&
    match.home_penalty_score !== null &&
    match.away_penalty_score !== null;

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-full">
          {competitionLabel}
        </Badge>

        <Badge variant="outline" className="rounded-full bg-white">
          Mecz #{match.match_number ?? "-"}
        </Badge>

        <Badge
          className="rounded-full"
          variant={hasResult ? "default" : "secondary"}
        >
          {hasResult ? "Wynik wpisany" : getMatchStatusLabel(match.status)}
        </Badge>

        {isKnockoutMatch && match.resolution_method ? (
          <Badge variant="outline" className="rounded-full bg-white">
            {getResolutionMethodLabel(match.resolution_method)}
          </Badge>
        ) : null}

        <Badge variant="outline" className="rounded-full bg-white">
          <Users className="mr-1 h-3.5 w-3.5" />
          {match.predictions_count} typów do przeliczenia
        </Badge>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center gap-3">
          <TeamFlag
            name={homeTeamName}
            flagCode={match.home_team_flag_code}
            flagEmoji={match.home_team_flag_emoji}
            className="h-12 w-12"
          />

          <div className="min-w-0">
            <p className="truncate text-lg font-black">{homeTeamName}</p>
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

          {hasPenaltyResult ? (
            <p className="mt-1 text-xs text-background/60">
              karne {match.home_penalty_score}:{match.away_penalty_score}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3 md:justify-end">
          <div className="min-w-0 md:text-right">
            <p className="truncate text-lg font-black">{awayTeamName}</p>
            <p className="text-xs text-muted-foreground">
              {match.away_team_code}
            </p>
          </div>

          <TeamFlag
            name={awayTeamName}
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
  );
}

export function AdminMatchResultCard({ match }: AdminMatchResultCardProps) {
  const isKnockoutMatch = isKnockoutStage(match.stage);

  if (isKnockoutMatch) {
    return (
      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="space-y-5">
          <AdminMatchSummary match={match} />

          <div className="rounded-[2rem] bg-background p-5">
            <div className="mb-4">
              <p className="font-heading text-xl">Wpisz wynik pucharowy</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tutaj admin wybiera zwycięzcę, sposób awansu i ewentualne karne.
                Jedno złe kliknięcie i drabinka zaczyna żyć własnym życiem, więc
                bez paniki, ale też bez fantazji.
              </p>
            </div>

            <AdminResultForm match={match} />
          </div>

          <div className="flex justify-end">
            <Button asChild variant="outline" className="rounded-full bg-white">
              <AppLink href={`/matches/${match.id}`}>Podejrzyj mecz</AppLink>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <AdminMatchSummary match={match} />

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
