"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { GroupPredictionPayload } from "@/src/features/matches/types/match.types";

type PredictionFormSubmitResult = {
  success: boolean;
  message: string;
};

type PredictionFormProps = {
  matchId: string;
  initialHomeScore: number | null;
  initialAwayScore: number | null;
  hasPrediction: boolean;
  isClosed: boolean;
  onSubmit: (
    payload: GroupPredictionPayload,
  ) => Promise<PredictionFormSubmitResult>;
};

export function PredictionForm({
  matchId,
  initialHomeScore,
  initialAwayScore,
  hasPrediction,
  isClosed,
  onSubmit,
}: PredictionFormProps) {
  const router = useRouter();

  const [homeScore, setHomeScore] = useState(
    initialHomeScore === null ? "" : String(initialHomeScore),
  );
  const [awayScore, setAwayScore] = useState(
    initialAwayScore === null ? "" : String(initialAwayScore),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);

    if (
      homeScore === "" ||
      awayScore === "" ||
      Number.isNaN(parsedHomeScore) ||
      Number.isNaN(parsedAwayScore)
    ) {
      setError("Podaj oba wyniki, jasnowidzu.");
      return;
    }

    if (parsedHomeScore < 0 || parsedAwayScore < 0) {
      setError("Wynik nie może być ujemny. To nie golf.");
      return;
    }

    setIsSubmitting(true);

    const result = await onSubmit({
      matchId,
      predictedHomeScore: parsedHomeScore,
      predictedAwayScore: parsedAwayScore,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || "Nie udało się zapisać typu.");
      return;
    }

    toast.success(
      hasPrediction
        ? "Typ poprawiony. VAR zaakceptował kombinowanie."
        : "Typ zapisany. Teraz udawaj, że to była analiza taktyczna.",
    );

    router.refresh();
  }

  if (isClosed) {
    return (
      <div className="rounded-3xl bg-muted p-5">
        <p className="font-semibold">Typowanie zamknięte</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pierwszy gwizdek już był. Teraz można tylko żałować albo udawać, że
          taki był plan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-background p-5">
      <div>
        <p className="font-semibold">
          {hasPrediction ? "Edytuj swój typ" : "Dodaj swój typ"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Możesz zmieniać typ do rozpoczęcia meczu.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Input
          type="text"
          inputMode="numeric"
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

        <span className="font-heading text-3xl">:</span>

        <Input
          type="text"
          inputMode="numeric"
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

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full rounded-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Zapisywanie typu...
          </>
        ) : hasPrediction ? (
          "Zapisz poprawkę eksperta"
        ) : (
          "Zapisz typ i udawaj, że był przemyślany"
        )}
      </Button>
    </form>
  );
}
