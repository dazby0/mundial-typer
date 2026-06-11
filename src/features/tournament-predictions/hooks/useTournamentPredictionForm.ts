"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  TournamentPrediction,
  TournamentPredictionPayload,
} from "@/src/features/tournament-predictions/types/tournament-prediction.types";
import { tournamentPredictionSchema } from "@/src/features/tournament-predictions/schemas/tournament-prediction.schema";
import { saveTournamentPrediction } from "@/src/features/tournament-predictions/services/tournament-predictions-api";

type UseTournamentPredictionFormParams = {
  initialPrediction: TournamentPrediction | null;
};

const emptyForm: TournamentPredictionPayload = {
  champion_team_id: "",
  finalist_team_1_id: "",
  finalist_team_2_id: "",
  semifinalist_team_1_id: "",
  semifinalist_team_2_id: "",
  semifinalist_team_3_id: "",
  semifinalist_team_4_id: "",
  top_scorer_name: "",
  top_scoring_team_id: "",
};

export function useTournamentPredictionForm({
  initialPrediction,
}: UseTournamentPredictionFormParams) {
  const router = useRouter();
  const [values, setValues] = useState<TournamentPredictionPayload>(
    initialPrediction
      ? {
          champion_team_id: initialPrediction.champion_team_id,
          finalist_team_1_id: initialPrediction.finalist_team_1_id,
          finalist_team_2_id: initialPrediction.finalist_team_2_id,
          semifinalist_team_1_id: initialPrediction.semifinalist_team_1_id,
          semifinalist_team_2_id: initialPrediction.semifinalist_team_2_id,
          semifinalist_team_3_id: initialPrediction.semifinalist_team_3_id,
          semifinalist_team_4_id: initialPrediction.semifinalist_team_4_id,
          top_scorer_name: initialPrediction.top_scorer_name,
          top_scoring_team_id: initialPrediction.top_scoring_team_id,
        }
      : emptyForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateValue(
    field: keyof TournamentPredictionPayload,
    value: string,
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = tournamentPredictionSchema.safeParse(values);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Sprawdź formularz.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setIsSaving(true);
      await saveTournamentPrediction(parsed.data);
      toast.success("Wielkie proroctwa zapisane. Teraz zostaje tylko żałować.");
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Nie udało się zapisać typów turniejowych.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return {
    values,
    error,
    isSaving,
    updateValue,
    handleSubmit,
  };
}
