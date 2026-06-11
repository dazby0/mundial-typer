import { TournamentPredictionPayload } from "@/src/features/tournament-predictions/types/tournament-prediction.types";

export async function saveTournamentPrediction(
  payload: TournamentPredictionPayload,
) {
  const response = await fetch("/api/tournament-predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not save tournament prediction.");
  }

  return data;
}
