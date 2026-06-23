"use client";

import { CheckCircle2, Lock, MapPin } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import {
  AdminKnockoutProposalMatch,
  AdminKnockoutThirdPlaceOption,
} from "@/src/features/admin/types/admin-knockout.types";
import { getAwayTeam, getHomeTeam } from "./admin-knockout-ui-helpers";
import { AdminKnockoutTeamCard } from "./AdminKnockoutTeamCard";
import { AdminKnockoutThirdPlaceSelect } from "./AdminKnockoutThirdPlaceSelect";

type AdminKnockoutMatchCardProps = {
  match: AdminKnockoutProposalMatch;
  selectedTeamId: string;
  awayOptions: AdminKnockoutThirdPlaceOption[];
  selectedAwayOption: AdminKnockoutThirdPlaceOption | null;
  onSelectionChange: (
    matchCode: string,
    slotSide: "home" | "away",
    teamId: string,
  ) => void;
};

export function AdminKnockoutMatchCard({
  match,
  selectedTeamId,
  awayOptions,
  selectedAwayOption,
  onSelectionChange,
}: AdminKnockoutMatchCardProps) {
  const homeTeam = getHomeTeam(match);
  const awayTeam = getAwayTeam(match, selectedAwayOption);
  const hasDropdown = match.away_slot_type === "third_place_dropdown";

  return (
    <div className="overflow-visible rounded-[2rem] border bg-background/40 p-5 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full bg-white">
              {match.match_code}
            </Badge>

            <Badge variant="outline" className="rounded-full bg-white">
              Mecz #{72 + match.match_order}
            </Badge>

            {match.is_confirmed ? (
              <Badge className="rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Zatwierdzony
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-full bg-white">
                <Lock className="h-3.5 w-3.5" />
                Oczekuje
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{match.venue_label}</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <AdminKnockoutTeamCard
            slotLabel={match.home_slot_label}
            team={homeTeam}
          />

          <div className="flex items-center justify-center">
            <div className="rounded-full bg-foreground px-5 py-2 font-heading text-sm text-background">
              VS
            </div>
          </div>

          {hasDropdown && !match.is_confirmed ? (
            <AdminKnockoutThirdPlaceSelect
              matchCode={match.match_code}
              slotSide="away"
              slotLabel={match.away_slot_label}
              value={selectedTeamId}
              options={awayOptions}
              onChange={onSelectionChange}
            />
          ) : (
            <AdminKnockoutTeamCard
              slotLabel={match.away_slot_label}
              team={awayTeam}
              variant={!awayTeam.id ? "empty" : "default"}
            />
          )}
        </div>

        <div className="rounded-3xl bg-white px-4 py-3">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>
              Po zatwierdzeniu ten mecz pojawi się w typowaniu jako normalny
              mecz pucharowy.
            </span>

            <span className="font-semibold text-foreground">
              {match.round_label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
