"use client";

import { AlertTriangle, Save, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { TournamentTeamSelect } from "@/src/features/tournament-predictions/components/TournamentTeamSelect";
import { useTournamentBonusResultsForm } from "@/src/features/tournament-predictions/hooks/useTournamentBonusResultsForm";
import {
  TournamentBonusResult,
  TournamentTeamOption,
} from "@/src/features/tournament-predictions/types/tournament-prediction.types";

type AdminTournamentBonusResultsFormProps = {
  teams: TournamentTeamOption[];
  initialResult: Partial<TournamentBonusResult> | null;
  predictionsCount: number;
};

export function AdminTournamentBonusResultsForm({
  teams,
  initialResult,
  predictionsCount,
}: AdminTournamentBonusResultsFormProps) {
  const {
    values,
    error,
    isSaving,
    isConfirmOpen,
    setIsConfirmOpen,
    updateValue,
    handleDraftSubmit,
    handleFinalizeClick,
    handleConfirmFinalize,
  } = useTournamentBonusResultsForm({
    initialResult,
  });

  return (
    <>
      <form
        onSubmit={handleDraftSubmit}
        className="rounded-[2rem] bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Admin bonusów
            </p>

            <h2 className="mt-1 text-3xl font-black">
              Oficjalne rozstrzygnięcia
            </h2>

            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Wpisz końcowe rozstrzygnięcia Mundialu. Zapis jako draft niczego
              nie przelicza. Finalizacja przeliczy punkty wszystkim graczom.
            </p>
          </div>

          <div
            className={
              values.is_finalized
                ? "rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
                : "rounded-full bg-background px-4 py-2 text-sm font-bold text-muted-foreground"
            }
          >
            {values.is_finalized ? "Rozliczone" : "Draft"}
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-background p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

            <div>
              <p className="font-bold">
                Finalizacja przeliczy {predictionsCount} typów turniejowych
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Możesz ponownie zfinalizować wyniki, jeśli poprawisz dane.
                Ranking zostanie przeliczony na podstawie aktualnych wartości.
              </p>
            </div>
          </div>
        </div>

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
            Wybierz cztery drużyny, które faktycznie znalazły się w najlepszej
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
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            disabled={isSaving}
            variant="outline"
            className="h-12 rounded-full bg-white"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Zapisywanie..." : "Zapisz jako draft"}
          </Button>

          <Button
            type="button"
            disabled={isSaving}
            onClick={handleFinalizeClick}
            className="h-12 rounded-full"
          >
            <Trophy className="h-4 w-4" />
            Finalizuj i przelicz punkty
          </Button>
        </div>
      </form>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Na pewno finalizować bonusy?</DialogTitle>

            <DialogDescription>
              System zapisze oficjalne rozstrzygnięcia i przeliczy punkty
              bonusowe dla wszystkich użytkowników. Ranking od razu uwzględni
              nowe punkty.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSaving}
              className="rounded-full"
            >
              Anuluj
            </Button>

            <Button
              type="button"
              onClick={handleConfirmFinalize}
              disabled={isSaving}
              className="rounded-full"
            >
              {isSaving ? "Przeliczanie..." : "Tak, przelicz punkty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
