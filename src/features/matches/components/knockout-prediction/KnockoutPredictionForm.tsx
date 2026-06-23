"use client";

import { useMemo, useState, useTransition } from "react";
import { Dumbbell, Goal, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  KnockoutPredictionPayload,
  MatchListItem,
  MyMatchPrediction,
} from "@/src/features/matches/types/match.types";
import { KnockoutResolutionMethod } from "@/src/features/knockout/types/knockout-rules.types";
import {
  getResolutionMethodDescription,
  validateKnockoutPrediction,
} from "@/src/features/knockout/utils/knockout-rules";
import { KnockoutPredictionRulesCard } from "./KnockoutPredictionRulesCard";
import { KnockoutResolutionMethodButton } from "./KnockoutResolutionMethodButton";
import { KnockoutTeamChoiceButton } from "./KnockoutTeamChoiceButton";

type KnockoutPredictionSubmitResult = {
  success: boolean;
  message: string;
};

type KnockoutPredictionFormProps = {
  match: MatchListItem;
  prediction?: MyMatchPrediction | null;
  disabled?: boolean;
  onSubmit: (
    payload: KnockoutPredictionPayload,
  ) => Promise<KnockoutPredictionSubmitResult>;
};

function getInitialScoreValue(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function parseScoreValue(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

export function KnockoutPredictionForm({
  match,
  prediction,
  disabled = false,
  onSubmit,
}: KnockoutPredictionFormProps) {
  const [isPending, startTransition] = useTransition();

  const [predictedWinnerTeamId, setPredictedWinnerTeamId] = useState(
    prediction?.predicted_winner_team_id || "",
  );

  const [predictedResolutionMethod, setPredictedResolutionMethod] =
    useState<KnockoutResolutionMethod>(
      prediction?.predicted_resolution_method || "in_match",
    );

  const [predictedHomeScore, setPredictedHomeScore] = useState(
    getInitialScoreValue(prediction?.predicted_home_score),
  );

  const [predictedAwayScore, setPredictedAwayScore] = useState(
    getInitialScoreValue(prediction?.predicted_away_score),
  );

  const homeTeamName =
    match.home_team_name_pl || match.home_team_name_en || match.home_team_code;

  const awayTeamName =
    match.away_team_name_pl || match.away_team_name_en || match.away_team_code;

  const validation = useMemo(() => {
    const homeScore = parseScoreValue(predictedHomeScore);
    const awayScore = parseScoreValue(predictedAwayScore);

    const errors: string[] = [];

    if (!predictedWinnerTeamId) {
      errors.push("Wybierz drużynę, która awansuje.");
    }

    if (homeScore === null) {
      errors.push("Wpisz poprawny wynik gospodarzy.");
    }

    if (awayScore === null) {
      errors.push("Wpisz poprawny wynik gości.");
    }

    if (homeScore !== null && awayScore !== null && predictedWinnerTeamId) {
      const knockoutValidation = validateKnockoutPrediction({
        homeTeamId: match.home_team_id,
        awayTeamId: match.away_team_id,
        homeScore,
        awayScore,
        predictedWinnerTeamId,
        predictedResolutionMethod,
      });

      errors.push(...knockoutValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [
    match.away_team_id,
    match.home_team_id,
    predictedAwayScore,
    predictedHomeScore,
    predictedResolutionMethod,
    predictedWinnerTeamId,
  ]);

  const handleSubmit = () => {
    const homeScore = parseScoreValue(predictedHomeScore);
    const awayScore = parseScoreValue(predictedAwayScore);

    if (!validation.isValid || homeScore === null || awayScore === null) {
      toast.error("Nie można zapisać typu", {
        description: validation.errors[0] || "Sprawdź formularz.",
      });

      return;
    }

    startTransition(async () => {
      const result = await onSubmit({
        matchId: match.id,
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
        predictedWinnerTeamId,
        predictedResolutionMethod,
      });

      if (!result.success) {
        toast.error("Nie udało się zapisać typu", {
          description: result.message,
        });

        return;
      }

      toast.success("Typ zapisany", {
        description: result.message,
      });
    });
  };

  const isSubmitDisabled = disabled || isPending || !validation.isValid;

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge className="mb-3 rounded-full">Faza pucharowa</Badge>

            <h2 className="text-3xl font-black uppercase tracking-tight">
              Twój typ awansu
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              W fazie pucharowej typujesz nie tylko wynik, ale też drużynę,
              która przejdzie dalej. Piłkarski chaos, ale w wersji
              kontrolowanej.
            </p>
          </div>

          {prediction && (
            <Badge variant="outline" className="rounded-full bg-background">
              Edycja zapisanego typu
            </Badge>
          )}
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <div className="mb-3">
              <p className="font-heading text-xl">1. Kto awansuje?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Wybierz drużynę, która przejdzie do kolejnej rundy.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <KnockoutTeamChoiceButton
                teamId={match.home_team_id}
                teamName={homeTeamName}
                teamCode={match.home_team_code}
                flagCode={match.home_team_flag_code}
                isSelected={predictedWinnerTeamId === match.home_team_id}
                disabled={disabled || isPending}
                onClick={setPredictedWinnerTeamId}
              />

              <KnockoutTeamChoiceButton
                teamId={match.away_team_id}
                teamName={awayTeamName}
                teamCode={match.away_team_code}
                flagCode={match.away_team_flag_code}
                isSelected={predictedWinnerTeamId === match.away_team_id}
                disabled={disabled || isPending}
                onClick={setPredictedWinnerTeamId}
              />
            </div>
          </section>

          <section>
            <div className="mb-3">
              <p className="font-heading text-xl">2. Jak awansuje?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nie rozdzielamy 90 minut i dogrywki. Liczy się tylko to, czy
                były karne.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <KnockoutResolutionMethodButton
                value="in_match"
                selectedValue={predictedResolutionMethod}
                title="W meczu"
                description={getResolutionMethodDescription("in_match")}
                icon={Dumbbell}
                disabled={disabled || isPending}
                onClick={setPredictedResolutionMethod}
              />

              <KnockoutResolutionMethodButton
                value="penalties"
                selectedValue={predictedResolutionMethod}
                title="Po karnych"
                description={getResolutionMethodDescription("penalties")}
                icon={Goal}
                disabled={disabled || isPending}
                onClick={setPredictedResolutionMethod}
              />
            </div>
          </section>

          <section>
            <div className="mb-3">
              <p className="font-heading text-xl">3. Wynik</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {predictedResolutionMethod === "penalties"
                  ? "Wpisz wynik po 120 minutach. Musi być remisowy — karnych nie typujesz."
                  : "Wpisz wynik meczu bez serii karnych. Nie może być remisowy."}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-3xl border bg-background/50 p-4">
                <p className="truncate text-sm font-semibold text-muted-foreground">
                  {homeTeamName}
                </p>

                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  disabled={disabled || isPending}
                  value={predictedHomeScore}
                  onChange={(event) =>
                    setPredictedHomeScore(event.target.value)
                  }
                  className="mt-3 w-full rounded-2xl border bg-white px-4 py-3 text-center font-heading text-3xl outline-none transition focus:border-primary"
                />
              </div>

              <div className="flex justify-center">
                <div className="rounded-full bg-foreground px-5 py-2 font-heading text-sm text-background">
                  VS
                </div>
              </div>

              <div className="rounded-3xl border bg-background/50 p-4">
                <p className="truncate text-sm font-semibold text-muted-foreground">
                  {awayTeamName}
                </p>

                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  disabled={disabled || isPending}
                  value={predictedAwayScore}
                  onChange={(event) =>
                    setPredictedAwayScore(event.target.value)
                  }
                  className="mt-3 w-full rounded-2xl border bg-white px-4 py-3 text-center font-heading text-3xl outline-none transition focus:border-primary"
                />
              </div>
            </div>
          </section>

          {validation.errors.length > 0 && (
            <div className="rounded-3xl bg-destructive/10 p-4 text-sm text-destructive">
              {validation.errors[0]}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
              className="rounded-full"
            >
              {isPending ? (
                "Zapisywanie..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Zapisz typ
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <KnockoutPredictionRulesCard />
    </div>
  );
}
