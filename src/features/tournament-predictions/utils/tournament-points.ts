import {
  TournamentBonusResult,
  TournamentPrediction,
  TournamentPredictionPayload,
  TournamentPredictionPointsBreakdown,
} from "@/src/features/tournament-predictions/types/tournament-prediction.types";

export const TOURNAMENT_BONUS_POINTS = {
  champion: 20,
  finalist: 8,
  bothFinalistsBonus: 4,
  semifinalist: 5,
  topScorer: 15,
  topScoringTeam: 10,
};

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getSemifinalistIds(
  value: TournamentPredictionPayload | TournamentPrediction,
) {
  return [
    value.semifinalist_team_1_id,
    value.semifinalist_team_2_id,
    value.semifinalist_team_3_id,
    value.semifinalist_team_4_id,
  ];
}

function getFinalistIds(
  value: TournamentPredictionPayload | TournamentPrediction,
) {
  return [value.finalist_team_1_id, value.finalist_team_2_id];
}

export function calculateTournamentPredictionPoints(
  prediction: TournamentPrediction,
  result: TournamentBonusResult,
): TournamentPredictionPointsBreakdown {
  const predictedFinalists = getFinalistIds(prediction);
  const actualFinalists = getFinalistIds(result);

  const predictedSemifinalists = getSemifinalistIds(prediction);
  const actualSemifinalists = getSemifinalistIds(result);

  const championPoints =
    prediction.champion_team_id === result.champion_team_id
      ? TOURNAMENT_BONUS_POINTS.champion
      : 0;

  const finalistHits = predictedFinalists.filter((teamId) =>
    actualFinalists.includes(teamId),
  ).length;

  const finalistPoints = finalistHits * TOURNAMENT_BONUS_POINTS.finalist;
  const finalistBonusPoints =
    finalistHits === 2 ? TOURNAMENT_BONUS_POINTS.bothFinalistsBonus : 0;

  const semifinalistHits = predictedSemifinalists.filter((teamId) =>
    actualSemifinalists.includes(teamId),
  ).length;

  const semifinalistPoints =
    semifinalistHits * TOURNAMENT_BONUS_POINTS.semifinalist;

  const topScorerPoints =
    normalizeText(prediction.top_scorer_name) ===
    normalizeText(result.top_scorer_name)
      ? TOURNAMENT_BONUS_POINTS.topScorer
      : 0;

  const topScoringTeamPoints =
    prediction.top_scoring_team_id === result.top_scoring_team_id
      ? TOURNAMENT_BONUS_POINTS.topScoringTeam
      : 0;

  return {
    champion_points: championPoints,
    finalist_points: finalistPoints,
    finalist_bonus_points: finalistBonusPoints,
    semifinalist_points: semifinalistPoints,
    top_scorer_points: topScorerPoints,
    top_scoring_team_points: topScoringTeamPoints,
    total_points:
      championPoints +
      finalistPoints +
      finalistBonusPoints +
      semifinalistPoints +
      topScorerPoints +
      topScoringTeamPoints,
  };
}
