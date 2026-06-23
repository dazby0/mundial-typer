"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { confirmRoundOf32BracketAction } from "@/src/features/admin/actions/confirm-round-of-32-bracket";
import {
  AdminKnockoutProposalMatch,
  AdminKnockoutReadiness,
  AdminKnockoutThirdPlaceOption,
  ThirdPlaceSelectionPayload,
} from "@/src/features/admin/types/admin-knockout.types";
import { getSelectionKey, OptionsBySlot } from "./admin-knockout-ui-helpers";
import { AdminKnockoutStatusCard } from "./AdminKnockoutStatusCard";
import { AdminKnockoutMatchesList } from "./AdminKnockoutMatchesList";

type AdminKnockoutConfirmationFormProps = {
  readiness: AdminKnockoutReadiness;
  matches: AdminKnockoutProposalMatch[];
  thirdPlaceOptions: AdminKnockoutThirdPlaceOption[];
};

export function AdminKnockoutConfirmationForm({
  readiness,
  matches,
  thirdPlaceOptions,
}: AdminKnockoutConfirmationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selections, setSelections] = useState<Record<string, string>>({});

  const optionsBySlot = useMemo(() => {
    return thirdPlaceOptions.reduce<OptionsBySlot>((acc, option) => {
      const key = getSelectionKey(option.match_code, option.slot_side);

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(option);

      return acc;
    }, {});
  }, [thirdPlaceOptions]);

  const requiredSelectionKeys = useMemo(() => {
    return Object.keys(optionsBySlot);
  }, [optionsBySlot]);

  const selectedCount = requiredSelectionKeys.filter((key) =>
    Boolean(selections[key]),
  ).length;

  const areSelectionsComplete =
    requiredSelectionKeys.length > 0 &&
    selectedCount === requiredSelectionKeys.length;

  const isSubmitDisabled =
    isPending || !readiness.can_confirm_round_of_32 || !areSelectionsComplete;

  const handleSelectionChange = (
    matchCode: string,
    slotSide: "home" | "away",
    teamId: string,
  ) => {
    const key = getSelectionKey(matchCode, slotSide);

    setSelections((current) => ({
      ...current,
      [key]: teamId,
    }));
  };

  const handleSubmit = () => {
    const payload: ThirdPlaceSelectionPayload[] = Object.entries(selections)
      .filter(([, teamId]) => Boolean(teamId))
      .map(([key, teamId]) => {
        const [matchCode, slotSide] = key.split(":");

        return {
          match_code: matchCode,
          slot_side: slotSide as "home" | "away",
          team_id: teamId,
        };
      });

    startTransition(async () => {
      const result = await confirmRoundOf32BracketAction(payload);

      if (!result.success) {
        toast.error("Nie udało się zatwierdzić drabinki", {
          description: result.message,
        });

        return;
      }

      toast.success("Drabinka zatwierdzona", {
        description: result.message,
      });

      router.refresh();
    });
  };

  return (
    <div className="mt-6 space-y-6">
      <AdminKnockoutStatusCard
        readiness={readiness}
        selectedCount={selectedCount}
        requiredCount={requiredSelectionKeys.length}
      />

      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-3 rounded-full">1/16 finału</Badge>

            <h2 className="text-3xl font-black uppercase tracking-tight">
              Sloty do zatwierdzenia
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Automatyczne miejsca są podstawione z tabel grupowych. Admin
              wybiera tylko drużyny z trzecich miejsc tam, gdzie FIFA robi swoje
              małe matematyczne sudoku.
            </p>
          </div>

          <Button
            type="button"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
            className="rounded-full"
          >
            {isPending ? (
              "Zatwierdzanie..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Zatwierdź 1/16 finału
              </>
            )}
          </Button>
        </div>

        {!readiness.can_confirm_round_of_32 && (
          <div className="mt-5 rounded-3xl bg-amber-50 p-5 text-amber-950">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-semibold">Tryb podglądu</p>
                <p className="mt-1 text-sm opacity-80">
                  Możesz sprawdzić aktualną propozycję, ale zatwierdzenie będzie
                  możliwe dopiero po zakończeniu fazy grupowej.
                </p>
              </div>
            </div>
          </div>
        )}

        <AdminKnockoutMatchesList
          matches={matches}
          selections={selections}
          optionsBySlot={optionsBySlot}
          onSelectionChange={handleSelectionChange}
        />

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
            className="rounded-full"
          >
            {isPending ? (
              "Zatwierdzanie..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Zatwierdź 1/16 finału
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
