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
import { KnockoutResolutionMethod } from "@/src/features/knockout/types/knockout-rules.types";
import {
  getResolutionMethodDescription,
  isKnockoutStage,
  validateKnockoutResult,
} from "@/src/features/knockout/utils/knockout-rules";
import { cn } from "@/lib/utils";

type AdminResultFormProps = {
  match: AdminMatchItem;
};

type ParsedResultValues = {
  homeScore: number;
  awayScore: number;
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
};

function parseScore(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

function getInitialScoreValue(value: number | null) {
  return value === null ? "" : String(value);
}

export function AdminResultForm({ match }: AdminResultFormProps) {
  const router = useRouter();

  const isKnockoutMatch = isKnockoutStage(match.stage);

  const homeTeamName =
    match.home_team_name_pl || match.home_team_name_en || match.home_team_code;

  const awayTeamName =
    match.away_team_name_pl || match.away_team_name_en || match.away_team_code;

  const [homeScore, setHomeScore] = useState(
    getInitialScoreValue(match.home_score),
  );
  const [awayScore, setAwayScore] = useState(
    getInitialScoreValue(match.away_score),
  );

  const [winnerTeamId, setWinnerTeamId] = useState(match.winner_team_id || "");

  const [resolutionMethod, setResolutionMethod] =
    useState<KnockoutResolutionMethod>(match.resolution_method || "in_match");

  const [homePenaltyScore, setHomePenaltyScore] = useState(
    getInitialScoreValue(match.home_penalty_score),
  );

  const [awayPenaltyScore, setAwayPenaltyScore] = useState(
    getInitialScoreValue(match.away_penalty_score),
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const hasExistingResult =
    match.home_score !== null && match.away_score !== null;

  function validateResult(): ParsedResultValues | null {
    const parsedHomeScore = parseScore(homeScore);
    const parsedAwayScore = parseScore(awayScore);

    if (parsedHomeScore === null || parsedAwayScore === null) {
      setError("Podaj oba wyniki. VAR nie przyjmuje pustych protokołów.");
      return null;
    }

    const parsedHomePenaltyScore =
      resolutionMethod === "penalties" ? parseScore(homePenaltyScore) : null;

    const parsedAwayPenaltyScore =
      resolutionMethod === "penalties" ? parseScore(awayPenaltyScore) : null;

    if (isKnockoutMatch) {
      if (!winnerTeamId) {
        setError("Wybierz drużynę, która awansowała.");
        return null;
      }

      const validation = validateKnockoutResult({
        homeTeamId: match.home_team_id,
        awayTeamId: match.away_team_id,
        homeScore: parsedHomeScore,
        awayScore: parsedAwayScore,
        winnerTeamId,
        resolutionMethod,
        homePenaltyScore: parsedHomePenaltyScore,
        awayPenaltyScore: parsedAwayPenaltyScore,
      });

      if (!validation.isValid) {
        setError(validation.errors[0] || "Niepoprawny wynik fazy pucharowej.");
        return null;
      }
    }

    return {
      homeScore: parsedHomeScore,
      awayScore: parsedAwayScore,
      homePenaltyScore: parsedHomePenaltyScore,
      awayPenaltyScore: parsedAwayPenaltyScore,
    };
  }

  async function saveResult() {
    const resultValues = validateResult();

    if (!resultValues) {
      return;
    }

    setIsSubmitting(true);

    const requestBody = isKnockoutMatch
      ? {
          matchId: match.id,
          homeScore: resultValues.homeScore,
          awayScore: resultValues.awayScore,
          winnerTeamId,
          resolutionMethod,
          homePenaltyScore: resultValues.homePenaltyScore,
          awayPenaltyScore: resultValues.awayPenaltyScore,
        }
      : {
          matchId: match.id,
          homeScore: resultValues.homeScore,
          awayScore: resultValues.awayScore,
        };

    const response = await fetch("/api/admin/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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

    const resultValues = validateResult();

    if (!resultValues) {
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
            type="text"
            inputMode="numeric"
            min={0}
            pattern="[0-9]*"
            maxLength={2}
            value={homeScore}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "").slice(0, 2);
              setHomeScore(value);
            }}
            className="h-14 text-center text-xl font-bold placeholder:text-muted-foreground/35"
            placeholder="0"
          />

          <span className="font-heading text-2xl">:</span>

          <Input
            type="text"
            inputMode="numeric"
            min={0}
            pattern="[0-9]*"
            maxLength={2}
            value={awayScore}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "").slice(0, 2);
              setAwayScore(value);
            }}
            className="h-14 text-center text-xl font-bold placeholder:text-muted-foreground/35"
            placeholder="0"
          />
        </div>

        {isKnockoutMatch ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold">Kto awansował?</p>

              <div className="mt-2 grid gap-2">
                <button
                  type="button"
                  onClick={() => setWinnerTeamId(match.home_team_id)}
                  className={cn(
                    "rounded-2xl border bg-white px-4 py-3 text-left text-sm font-semibold transition hover:border-primary",
                    winnerTeamId === match.home_team_id &&
                      "border-primary bg-primary/10 text-primary",
                  )}
                >
                  {homeTeamName}
                </button>

                <button
                  type="button"
                  onClick={() => setWinnerTeamId(match.away_team_id)}
                  className={cn(
                    "rounded-2xl border bg-white px-4 py-3 text-left text-sm font-semibold transition hover:border-primary",
                    winnerTeamId === match.away_team_id &&
                      "border-primary bg-primary/10 text-primary",
                  )}
                >
                  {awayTeamName}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">Sposób awansu</p>

              <div className="mt-2 grid gap-2">
                <button
                  type="button"
                  onClick={() => setResolutionMethod("in_match")}
                  className={cn(
                    "rounded-2xl border bg-white px-4 py-3 text-left transition hover:border-primary",
                    resolutionMethod === "in_match" &&
                      "border-primary bg-primary/10 text-primary",
                  )}
                >
                  <span className="block text-sm font-semibold">W meczu</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {getResolutionMethodDescription("in_match")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setResolutionMethod("penalties")}
                  className={cn(
                    "rounded-2xl border bg-white px-4 py-3 text-left transition hover:border-primary",
                    resolutionMethod === "penalties" &&
                      "border-primary bg-primary/10 text-primary",
                  )}
                >
                  <span className="block text-sm font-semibold">
                    Po karnych
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {getResolutionMethodDescription("penalties")}
                  </span>
                </button>
              </div>
            </div>

            {resolutionMethod === "penalties" ? (
              <div>
                <p className="text-sm font-semibold">Wynik karnych</p>

                <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <Input
                    type="text"
                    inputMode="numeric"
                    min={0}
                    pattern="[0-9]*"
                    maxLength={2}
                    value={homePenaltyScore}
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 2);
                      setHomePenaltyScore(value);
                    }}
                    className="h-12 text-center text-lg font-bold placeholder:text-muted-foreground/35"
                    placeholder="0"
                  />

                  <span className="font-heading text-xl">:</span>

                  <Input
                    type="text"
                    inputMode="numeric"
                    min={0}
                    pattern="[0-9]*"
                    maxLength={2}
                    value={awayPenaltyScore}
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 2);
                      setAwayPenaltyScore(value);
                    }}
                    className="h-12 text-center text-lg font-bold placeholder:text-muted-foreground/35"
                    placeholder="0"
                  />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Karne wpisuje tylko admin. Userzy typowali wyłącznie wynik po
                  120 minutach.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

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
