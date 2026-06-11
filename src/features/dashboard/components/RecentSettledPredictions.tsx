import Link from "next/link";
import { Trophy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MyMatchPrediction } from "@/src/features/matches/types/match.types";

type RecentSettledPredictionsProps = {
  predictions: MyMatchPrediction[];
};

function getSettledLabel(points: number | null) {
  if (points === 3) {
    return "Idealnie. Podejrzanie dobrze.";
  }

  if (points === 1) {
    return "Rezultat złapany, wynik uciekł.";
  }

  return "Piłka nożna powiedziała: nie.";
}

export function RecentSettledPredictions({
  predictions,
}: RecentSettledPredictionsProps) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Ostatnie rozliczenia</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Mini forma: czy jesteś prorokiem, czy tylko klikasz z nadzieją.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-full bg-white">
          <Link href="/results">Wyniki</Link>
        </Button>
      </div>

      {predictions.length === 0 ? (
        <div className="rounded-3xl bg-background p-5">
          <p className="font-bold">Jeszcze nic nie rozliczone</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Brak danych do chwalenia się albo do wyparcia z pamięci.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              className="flex items-center justify-between rounded-2xl bg-background px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={
                    prediction.points && prediction.points > 0
                      ? "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                      : "flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
                  }
                >
                  {prediction.points && prediction.points > 0 ? (
                    <Trophy className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <p className="font-semibold">
                    Typ {prediction.predicted_home_score}:
                    {prediction.predicted_away_score}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {getSettledLabel(prediction.points)}
                  </p>
                </div>
              </div>

              <p className="font-heading text-2xl">
                {prediction.points ?? 0} pkt
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
