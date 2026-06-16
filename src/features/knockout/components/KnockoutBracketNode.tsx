import { Lock, MapPin } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/lib/utils";
import { KnockoutMatchPreview } from "../types/knockout.types";
import {
  formatKnockoutDateTime,
  formatKnockoutMatchCode,
} from "../utils/knockout-formatters";

type KnockoutBracketNodeProps = {
  match: KnockoutMatchPreview;
};

function getNodeCopy(match: KnockoutMatchPreview) {
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
    footer: "Po grupach",
  };
}

export function KnockoutBracketNode({ match }: KnockoutBracketNodeProps) {
  const copy = getNodeCopy(match);
  const isFinal = match.round_key === "final";
  const isThirdPlace = match.round_key === "third_place";

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
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
        <div
          className={cn(
            "truncate rounded-xl px-3 py-1.5 text-sm font-semibold",
            isFinal ? "bg-background/10" : "bg-background",
          )}
          title={match.home_slot_label}
        >
          {match.home_slot_label}
        </div>

        <div
          className={cn(
            "truncate rounded-xl px-3 py-1.5 text-sm font-semibold",
            isFinal ? "bg-background/10" : "bg-background",
          )}
          title={match.away_slot_label}
        >
          {match.away_slot_label}
        </div>
      </div>

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
          <Lock className="h-3 w-3" />
          {copy.footer}
        </span>
      </div>
    </div>
  );
}
