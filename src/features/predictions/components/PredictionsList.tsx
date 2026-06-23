import {
  MatchListItem,
  MatchPrediction,
} from "@/src/features/matches/types/match.types";
import {
  getResolutionMethodLabel,
  isKnockoutStage,
} from "@/src/features/knockout/utils/knockout-rules";

type PredictionsListProps = {
  match: MatchListItem;
  predictions: MatchPrediction[];
  predictionsVisible: boolean;
};

function getTeamNameById(match: MatchListItem, teamId: string | null) {
  const homeTeamName =
    match.home_team_name_pl || match.home_team_name_en || match.home_team_code;

  const awayTeamName =
    match.away_team_name_pl || match.away_team_name_en || match.away_team_code;

  if (teamId === match.home_team_id) {
    return homeTeamName;
  }

  if (teamId === match.away_team_id) {
    return awayTeamName;
  }

  return "Nie wskazano";
}

export function PredictionsList({
  match,
  predictions,
  predictionsVisible,
}: PredictionsListProps) {
  const isKnockoutMatch = isKnockoutStage(match.stage);

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
      {predictions.map((prediction) => {
        const predictedWinnerName = getTeamNameById(
          match,
          prediction.predicted_winner_team_id,
        );

        return (
          <div
            key={prediction.id}
            className="rounded-2xl bg-background px-4 py-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {prediction.profiles?.username || "Nieznany typer"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Typ zapisany. Dowody zostają w systemie.
                </p>
              </div>

              <div className="shrink-0 text-right">
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

            {isKnockoutMatch ? (
              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-3 py-2">
                  <span className="font-semibold text-foreground">Awans:</span>{" "}
                  {predictedWinnerName}
                </div>

                <div className="rounded-2xl bg-white px-3 py-2">
                  <span className="font-semibold text-foreground">Sposób:</span>{" "}
                  {getResolutionMethodLabel(
                    prediction.predicted_resolution_method,
                  )}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
