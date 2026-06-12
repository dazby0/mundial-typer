"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  TournamentBonusResult,
  TournamentPredictionPayload,
} from "@/src/features/tournament-predictions/types/tournament-prediction.types";
import { tournamentBonusResultSchema } from "@/src/features/tournament-predictions/schemas/tournament-prediction.schema";

type UseTournamentBonusResultsFormParams = {
  initialResult: Partial<TournamentBonusResult> | null;
};

export function useTournamentBonusResultsForm({
  initialResult,
}: UseTournamentBonusResultsFormParams) {
  const router = useRouter();

  const [values, setValues] = useState<TournamentBonusResult>({
    champion_team_id: initialResult?.champion_team_id || "",
    finalist_team_1_id: initialResult?.finalist_team_1_id || "",
    finalist_team_2_id: initialResult?.finalist_team_2_id || "",
    semifinalist_team_1_id: initialResult?.semifinalist_team_1_id || "",
    semifinalist_team_2_id: initialResult?.semifinalist_team_2_id || "",
    semifinalist_team_3_id: initialResult?.semifinalist_team_3_id || "",
    semifinalist_team_4_id: initialResult?.semifinalist_team_4_id || "",
    top_scorer_name: initialResult?.top_scorer_name || "",
    top_scoring_team_id: initialResult?.top_scoring_team_id || "",
    is_finalized: Boolean(initialResult?.is_finalized),
  });

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function updateValue(
    field: keyof TournamentPredictionPayload,
    value: string,
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function save(isFinalized: boolean) {
    setError(null);

    const payload = {
      ...values,
      is_finalized: isFinalized,
    };

    const parsed = tournamentBonusResultSchema.safeParse(payload);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Sprawdź formularz.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/admin/tournament-bonus-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Nie udało się zapisać rozstrzygnięć.",
        );
      }

      if (isFinalized) {
        toast.success(
          `Bonusy rozliczone. Przeliczono ${
            result.predictions_count || 0
          } typów.`,
        );
      } else {
        toast.success("Rozstrzygnięcia zapisane jako draft.");
      }

      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Nie udało się zapisać rozstrzygnięć.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
      setIsConfirmOpen(false);
    }
  }

  function handleDraftSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(false);
  }

  function handleFinalizeClick() {
    setIsConfirmOpen(true);
  }

  function handleConfirmFinalize() {
    void save(true);
  }

  return {
    values,
    error,
    isSaving,
    isConfirmOpen,
    setIsConfirmOpen,
    updateValue,
    handleDraftSubmit,
    handleFinalizeClick,
    handleConfirmFinalize,
  };
}
