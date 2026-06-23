"use client";

import {
  AdminKnockoutProposalMatch,
  AdminKnockoutThirdPlaceOption,
} from "@/src/features/admin/types/admin-knockout.types";
import { getSelectionKey, OptionsBySlot } from "./admin-knockout-ui-helpers";
import { AdminKnockoutMatchCard } from "./AdminKnockoutMatchCard";

type AdminKnockoutMatchesListProps = {
  matches: AdminKnockoutProposalMatch[];
  selections: Record<string, string>;
  optionsBySlot: OptionsBySlot;
  onSelectionChange: (
    matchCode: string,
    slotSide: "home" | "away",
    teamId: string,
  ) => void;
};

export function AdminKnockoutMatchesList({
  matches,
  selections,
  optionsBySlot,
  onSelectionChange,
}: AdminKnockoutMatchesListProps) {
  const getSelectedOption = (
    matchCode: string,
    slotSide: "home" | "away",
  ): AdminKnockoutThirdPlaceOption | null => {
    const key = getSelectionKey(matchCode, slotSide);
    const selectedTeamId = selections[key];

    if (!selectedTeamId) {
      return null;
    }

    return (
      optionsBySlot[key]?.find((option) => option.team_id === selectedTeamId) ||
      null
    );
  };

  return (
    <div className="mt-6 grid gap-4">
      {matches.map((match) => {
        const selectionKey = getSelectionKey(match.match_code, "away");
        const awayOptions = optionsBySlot[selectionKey] || [];
        const selectedAwayOption = getSelectedOption(match.match_code, "away");

        return (
          <AdminKnockoutMatchCard
            key={match.id}
            match={match}
            selectedTeamId={selections[selectionKey] || ""}
            awayOptions={awayOptions}
            selectedAwayOption={selectedAwayOption}
            onSelectionChange={onSelectionChange}
          />
        );
      })}
    </div>
  );
}
