"use client";

import { AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { TournamentTeamSelect } from "@/src/features/tournament-predictions/components/TournamentTeamSelect";
import { useTournamentPredictionForm } from "@/src/features/tournament-predictions/hooks/useTournamentPredictionForm";
import {
  TournamentPrediction,
  TournamentTeamOption,
} from "@/src/features/tournament-predictions/types/tournament-prediction.types";
import { TournamentPredictionSummary } from "./TournamentPredictionSummary";
import { Badge } from "@/src/components/ui/badge";

type TournamentPredictionFormProps = {
  teams: TournamentTeamOption[];
  initialPrediction: TournamentPrediction | null;
  isLocked: boolean;
};

export function TournamentPredictionForm({
  teams,
  initialPrediction,
  isLocked,
}: TournamentPredictionFormProps) {
  const { values, error, isSaving, isDirty, updateValue, handleSubmit } =
    useTournamentPredictionForm({
      initialPrediction,
    });

  if (isLocked && initialPrediction) {
    return (
      <TournamentPredictionSummary
        prediction={initialPrediction}
        teams={teams}
      />
    );
  }

  if (isLocked && !initialPrediction) {
    return (
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <Badge className="mb-4 rounded-full">Typy zablokowane</Badge>

        <h2 className="text-3xl font-black">Brak typów turniejowych</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Mundial wystartował, więc formularz jest już zamknięty. Tym razem
          proroctwa nie zostały zapisane — komisja piwna przyjęła to z
          mieszanymi uczuciami.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Formularz proroctwa
          </p>

          <h2 className="mt-1 text-3xl font-black">Twoje typy turniejowe</h2>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Wypełnij raz przed startem Mundialu. Potem zostaje już tylko udawać,
            że od początku miałeś rację.
          </p>
        </div>

        {initialPrediction ? (
          <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            Zapisane
          </div>
        ) : (
          <div className="rounded-full bg-background px-4 py-2 text-sm font-bold text-muted-foreground">
            Jeszcze pusto
          </div>
        )}
      </div>

      {isLocked ? (
        <div className="mt-5 rounded-3xl bg-foreground p-4 text-background">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Typy turniejowe są już zamknięte</p>
              <p className="mt-1 text-sm text-background/70">
                Mundial wystartował, więc nie ma już edycji wielkich proroctw.
                Teraz tylko cierpienie, punkty i screeny na grupie.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-3xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <TournamentTeamSelect
          label="Mistrz świata"
          value={values.champion_team_id}
          teams={teams}
          onChange={(value) => updateValue("champion_team_id", value)}
        />

        <TournamentTeamSelect
          label="Drużyna z największą liczbą goli"
          value={values.top_scoring_team_id}
          teams={teams}
          onChange={(value) => updateValue("top_scoring_team_id", value)}
        />

        <TournamentTeamSelect
          label="Finalista 1"
          value={values.finalist_team_1_id}
          teams={teams}
          onChange={(value) => updateValue("finalist_team_1_id", value)}
        />

        <TournamentTeamSelect
          label="Finalista 2"
          value={values.finalist_team_2_id}
          teams={teams}
          onChange={(value) => updateValue("finalist_team_2_id", value)}
        />
      </div>

      <div className="mt-8 rounded-[2rem] bg-background p-5">
        <h3 className="text-xl font-black">TOP 4 / półfinaliści</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Wybierz cztery drużyny, które według Ciebie znajdą się w najlepszej
          czwórce turnieju. Finaliści muszą być częścią TOP 4.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TournamentTeamSelect
            label="TOP 4 — drużyna 1"
            value={values.semifinalist_team_1_id}
            teams={teams}
            onChange={(value) => updateValue("semifinalist_team_1_id", value)}
          />

          <TournamentTeamSelect
            label="TOP 4 — drużyna 2"
            value={values.semifinalist_team_2_id}
            teams={teams}
            onChange={(value) => updateValue("semifinalist_team_2_id", value)}
          />

          <TournamentTeamSelect
            label="TOP 4 — drużyna 3"
            value={values.semifinalist_team_3_id}
            teams={teams}
            onChange={(value) => updateValue("semifinalist_team_3_id", value)}
          />

          <TournamentTeamSelect
            label="TOP 4 — drużyna 4"
            value={values.semifinalist_team_4_id}
            teams={teams}
            onChange={(value) => updateValue("semifinalist_team_4_id", value)}
          />
        </div>
      </div>

      <div className="mt-8">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Król strzelców</span>

          <Input
            value={values.top_scorer_name}
            onChange={(event) =>
              updateValue("top_scorer_name", event.target.value)
            }
            placeholder="Np. Kylian Mbappé"
            className="h-12 rounded-full bg-white"
          />
        </label>

        <p className="mt-2 text-xs text-muted-foreground">
          Wpis tekstowy. Przy rozliczaniu ignorujemy wielkość liter i polskie
          znaki, ale nazwisko lepiej wpisać normalnie, żeby nie było dramatu.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSaving || isLocked || !isDirty}
        className="mt-8 h-12 w-full rounded-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {isSaving
          ? "Zapisywanie..."
          : isDirty
            ? "Zapisz typy turniejowe"
            : "Brak zmian do zapisania"}
      </Button>
    </form>
  );
}
