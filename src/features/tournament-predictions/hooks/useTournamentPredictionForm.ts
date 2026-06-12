"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  TournamentPrediction,
  TournamentPredictionPayload,
} from "@/src/features/tournament-predictions/types/tournament-prediction.types";
import { tournamentPredictionSchema } from "@/src/features/tournament-predictions/schemas/tournament-prediction.schema";

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

function getInitialValues(
  initialPrediction: TournamentPrediction | null,
): TournamentPredictionPayload {
  if (!initialPrediction) {
    return emptyForm;
  }

  return {
    champion_team_id: initialPrediction.champion_team_id,
    finalist_team_1_id: initialPrediction.finalist_team_1_id,
    finalist_team_2_id: initialPrediction.finalist_team_2_id,
    semifinalist_team_1_id: initialPrediction.semifinalist_team_1_id,
    semifinalist_team_2_id: initialPrediction.semifinalist_team_2_id,
    semifinalist_team_3_id: initialPrediction.semifinalist_team_3_id,
    semifinalist_team_4_id: initialPrediction.semifinalist_team_4_id,
    top_scorer_name: initialPrediction.top_scorer_name,
    top_scoring_team_id: initialPrediction.top_scoring_team_id,
  };
}

function normalizeValues(values: TournamentPredictionPayload) {
  return {
    ...values,
    top_scorer_name: values.top_scorer_name.trim(),
  };
}

export function useTournamentPredictionForm({
  initialPrediction,
}: UseTournamentPredictionFormParams) {
  const router = useRouter();

  const initialValues = useMemo(
    () => getInitialValues(initialPrediction),
    [initialPrediction],
  );

  const [values, setValues] =
    useState<TournamentPredictionPayload>(initialValues);

  const [savedValues, setSavedValues] =
    useState<TournamentPredictionPayload>(initialValues);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(() => {
    return (
      JSON.stringify(normalizeValues(values)) !==
      JSON.stringify(normalizeValues(savedValues))
    );
  }, [values, savedValues]);

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

    if (!isDirty) {
      return;
    }

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

      const response = await fetch("/api/tournament-predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Nie udało się zapisać typów turniejowych.",
        );
      }

      setSavedValues(parsed.data);
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
    isDirty,
    updateValue,
    handleSubmit,
  };
}
