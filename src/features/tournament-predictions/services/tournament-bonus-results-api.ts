import { TournamentBonusResult } from "@/src/features/tournament-predictions/types/tournament-prediction.types";

export async function saveTournamentBonusResults(
  payload: TournamentBonusResult,
) {
  const response = await fetch("/api/admin/tournament-bonus-results", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not save tournament bonus results.");
  }

  return data;
}
