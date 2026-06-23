import { Lock, MapPin, MousePointer2, Trophy } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/lib/utils";
import { KnockoutMatchPreview } from "../types/knockout.types";
import {
  formatKnockoutDateTime,
  formatKnockoutMatchCode,
} from "../utils/knockout-formatters";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { AppLink } from "@/src/components/navigation/AppLink";
import { getResolutionMethodLabel } from "@/src/features/knockout/utils/knockout-rules";

type KnockoutBracketNodeProps = {
  match: KnockoutMatchPreview;
};

type TeamLineProps = {
  name: string;
  code: string | null;
  flagCode: string | null;
  flagEmoji: string | null;
  score: number | null;
  isWinner: boolean;
  isFinal: boolean;
  title: string;
};

function getNodeCopy(match: KnockoutMatchPreview) {
  if (match.match_id && match.prediction_status === "open") {
    return {
      badge: match.status === "finished" ? "Wynik" : "Typuj",
      footer: match.status === "finished" ? "Rozliczone" : "Otwarty mecz",
    };
  }

  if (match.round_key === "final") {
    return {
      badge: "Finał",
      footer: "Legenda czeka",
    };
  }

  if (match.round_key === "third_place") {
    return {
      badge: "Podium",
      footer: "Ostatni taniec",
    };
  }

  return {
    badge: "Locked",
    footer: "Czekamy",
  };
}

function getHomeTeamName(match: KnockoutMatchPreview) {
  return (
    match.home_team_name_pl ||
    match.home_team_name_en ||
    match.home_team_code ||
    match.home_slot_label
  );
}

function getAwayTeamName(match: KnockoutMatchPreview) {
  return (
    match.away_team_name_pl ||
    match.away_team_name_en ||
    match.away_team_code ||
    match.away_slot_label
  );
}

function TeamLine({
  name,
  code,
  flagCode,
  flagEmoji,
  score,
  isWinner,
  isFinal,
  title,
}: TeamLineProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold",
        isFinal ? "bg-background/10" : "bg-background",
        isWinner && !isFinal ? "bg-primary/10 ring-1 ring-primary/30" : "",
        isWinner && isFinal ? "ring-1 ring-background/60" : "",
      )}
      title={title}
    >
      <div className="flex min-w-0 items-center gap-2">
        {flagCode || flagEmoji ? (
          <TeamFlag
            name={name}
            flagCode={flagCode}
            flagEmoji={flagEmoji}
            className="h-5 w-5 shrink-0"
          />
        ) : null}

        <span className="truncate">{name}</span>

        {code ? (
          <span
            className={cn(
              "shrink-0 text-[0.62rem]",
              isFinal ? "text-background/50" : "text-muted-foreground",
            )}
          >
            {code}
          </span>
        ) : null}
      </div>

      {score !== null ? (
        <span className="shrink-0 font-heading text-base">{score}</span>
      ) : null}
    </div>
  );
}

function KnockoutBracketNodeContent({ match }: KnockoutBracketNodeProps) {
  const copy = getNodeCopy(match);
  const isFinal = match.round_key === "final";
  const isThirdPlace = match.round_key === "third_place";
  const isClickable = Boolean(match.match_id);
  const isFinished = match.status === "finished";

  const homeTeamName = getHomeTeamName(match);
  const awayTeamName = getAwayTeamName(match);

  const homeIsWinner =
    isFinished &&
    Boolean(match.winner_team_id) &&
    match.winner_team_id === match.home_team_id;

  const awayIsWinner =
    isFinished &&
    Boolean(match.winner_team_id) &&
    match.winner_team_id === match.away_team_id;

  const hasPenaltyResult =
    match.resolution_method === "penalties" &&
    match.home_penalty_score !== null &&
    match.away_penalty_score !== null;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border p-3 shadow-sm transition",
        isClickable ? "hover:-translate-y-0.5 hover:shadow-md" : "",
        isFinal
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-white",
        isThirdPlace ? "border-dashed bg-background" : "",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-[0.68rem] font-semibold uppercase tracking-[0.14em]",
              isFinal ? "text-background/70" : "text-muted-foreground",
            )}
          >
            {formatKnockoutMatchCode(match.match_code)}
          </p>

          <p
            className={cn(
              "mt-1 truncate text-xs font-medium",
              isFinal ? "text-background/80" : "text-primary",
            )}
          >
            {formatKnockoutDateTime(match.kickoff_time)}
          </p>
        </div>

        <Badge
          variant={isFinal ? "secondary" : "outline"}
          className={cn(
            "h-6 shrink-0 rounded-full px-2 text-[0.65rem]",
            isFinal ? "border-0 bg-background text-foreground" : "",
          )}
        >
          {copy.badge}
        </Badge>
      </div>

      <div className="mt-3 space-y-1.5">
        <TeamLine
          name={homeTeamName}
          code={match.home_team_code}
          flagCode={match.home_team_flag_code}
          flagEmoji={match.home_team_flag_emoji}
          score={match.home_score}
          isWinner={homeIsWinner}
          isFinal={isFinal}
          title={match.home_slot_label}
        />

        <TeamLine
          name={awayTeamName}
          code={match.away_team_code}
          flagCode={match.away_team_flag_code}
          flagEmoji={match.away_team_flag_emoji}
          score={match.away_score}
          isWinner={awayIsWinner}
          isFinal={isFinal}
          title={match.away_slot_label}
        />
      </div>

      {hasPenaltyResult ? (
        <div
          className={cn(
            "mt-2 rounded-full px-2 py-1 text-center text-[0.65rem]",
            isFinal ? "bg-background/10 text-background/70" : "bg-background",
          )}
        >
          karne {match.home_penalty_score}:{match.away_penalty_score}
        </div>
      ) : null}

      <div
        className={cn(
          "mt-auto flex items-center justify-between gap-2 pt-3 text-[0.7rem]",
          isFinal ? "text-background/70" : "text-muted-foreground",
        )}
      >
        <span className="flex min-w-0 items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate" title={match.venue_label}>
            {match.venue_label}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1">
          {isClickable ? (
            <MousePointer2 className="h-3 w-3" />
          ) : isFinished ? (
            <Trophy className="h-3 w-3" />
          ) : (
            <Lock className="h-3 w-3" />
          )}

          {copy.footer}
        </span>
      </div>

      {match.resolution_method && isFinished ? (
        <div
          className={cn(
            "mt-1 text-right text-[0.65rem]",
            isFinal ? "text-background/60" : "text-muted-foreground",
          )}
        >
          {getResolutionMethodLabel(match.resolution_method)}
        </div>
      ) : null}
    </div>
  );
}

export function KnockoutBracketNode({ match }: KnockoutBracketNodeProps) {
  if (match.match_id) {
    return (
      <AppLink href={`/matches/${match.match_id}`} className="block h-full">
        <KnockoutBracketNodeContent match={match} />
      </AppLink>
    );
  }

  return <KnockoutBracketNodeContent match={match} />;
}
