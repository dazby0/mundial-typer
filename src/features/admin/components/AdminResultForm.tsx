"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminMatchItem } from "@/src/features/admin/types/admin-match.types";

type AdminResultFormProps = {
  match: AdminMatchItem;
};

export function AdminResultForm({ match }: AdminResultFormProps) {
  const router = useRouter();

  const [homeScore, setHomeScore] = useState(
    match.home_score === null ? "" : String(match.home_score),
  );
  const [awayScore, setAwayScore] = useState(
    match.away_score === null ? "" : String(match.away_score),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const hasExistingResult =
    match.home_score !== null && match.away_score !== null;

  function validateScores() {
    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);

    if (
      homeScore === "" ||
      awayScore === "" ||
      Number.isNaN(parsedHomeScore) ||
      Number.isNaN(parsedAwayScore)
    ) {
      setError("Podaj oba wyniki. VAR nie przyjmuje pustych protokołów.");
      return null;
    }

    if (parsedHomeScore < 0 || parsedAwayScore < 0) {
      setError("Wynik nie może być ujemny. Nawet FIFA tak nie liczy.");
      return null;
    }

    return {
      homeScore: parsedHomeScore,
      awayScore: parsedAwayScore,
    };
  }

  async function saveResult() {
    const scores = validateScores();

    if (!scores) {
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/admin/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        matchId: match.id,
        homeScore: scores.homeScore,
        awayScore: scores.awayScore,
      }),
    });

    const result = await response.json();

    setIsSubmitting(false);
    setIsConfirmOpen(false);

    if (!response.ok) {
      setError(result.error || "Nie udało się zapisać wyniku.");
      return;
    }

    toast.success(
      hasExistingResult
        ? "Wynik nadpisany. Ranking właśnie dostał deja vu."
        : "Wynik zapisany. Piwny kalkulator odpalił silnik.",
    );

    router.refresh();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const scores = validateScores();

    if (!scores) {
      return;
    }

    if (hasExistingResult) {
      setIsConfirmOpen(true);
      return;
    }

    void saveResult();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="rounded-3xl bg-background p-4">
        {hasExistingResult ? (
          <div className="mb-3 rounded-2xl bg-white px-4 py-3 text-sm text-muted-foreground">
            Wynik już istnieje. Zmiana odpali ponowne przeliczenie typów.
          </div>
        ) : null}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Input
            type="number"
            min={0}
            value={homeScore}
            onChange={(event) => setHomeScore(event.target.value)}
            className="h-12 text-center text-lg font-bold"
            placeholder="0"
          />

          <span className="font-heading text-2xl">:</span>

          <Input
            type="number"
            min={0}
            value={awayScore}
            onChange={(event) => setAwayScore(event.target.value)}
            className="h-12 text-center text-lg font-bold"
            placeholder="0"
          />
        </div>

        {error ? (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full rounded-full"
          variant={hasExistingResult ? "secondary" : "default"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {hasExistingResult ? "Nadpisz wynik" : "Zapisz wynik"}
            </>
          )}
        </Button>
      </form>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <TriangleAlert className="h-5 w-5" />
            </div>

            <DialogTitle>Nadpisać istniejący wynik?</DialogTitle>

            <DialogDescription>
              Ten mecz ma już wpisany wynik {match.home_score}:
              {match.away_score}. Jeśli zapiszesz nowy wynik, system ponownie
              przeliczy {match.predictions_count} typów. Ranking może dostać
              piłkarskiej choroby lokomocyjnej.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Anuluj, VAR jeszcze sprawdza
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={() => void saveResult()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Nadpisywanie...
                </>
              ) : (
                "Tak, odpal chaos"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
