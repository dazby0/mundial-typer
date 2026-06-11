import { MatchPrediction } from "@/src/features/matches/types/match.types";

type PredictionsListProps = {
  predictions: MatchPrediction[];
  predictionsVisible: boolean;
};

export function PredictionsList({
  predictions,
  predictionsVisible,
}: PredictionsListProps) {
  if (!predictionsVisible) {
    return (
      <div className="rounded-3xl bg-background p-5">
        <p className="font-semibold">Typy znajomych są jeszcze ukryte</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Odkryjemy je po rozpoczęciu meczu. Zero podglądania, zero kopiowania,
          zero cwaniakowania.
        </p>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="rounded-3xl bg-background p-5">
        <p className="font-semibold">Nikt jeszcze nie typował</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Albo wszyscy zapomnieli, albo udają, że mają życie poza Mundialem.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {predictions.map((prediction) => (
        <div
          key={prediction.id}
          className="flex items-center justify-between rounded-2xl bg-background px-4 py-3"
        >
          <div>
            <p className="font-semibold">
              {prediction.profiles?.username || "Nieznany typer"}
            </p>
            <p className="text-xs text-muted-foreground">
              Typ zapisany. Dowody zostają w systemie.
            </p>
          </div>

          <div className="text-right">
            <p className="font-heading text-2xl">
              {prediction.predicted_home_score}:
              {prediction.predicted_away_score}
            </p>
            <p className="text-xs text-muted-foreground">
              {prediction.points === null
                ? "pkt: ?"
                : `${prediction.points} pkt`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
