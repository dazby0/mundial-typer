import {
  MatchListItem,
  MyMatchPrediction,
} from "@/src/features/matches/types/match.types";
import {
  isMatchToday,
  getUnpredictedOpenMatches,
} from "@/src/features/predictions/utils/prediction-checklist";

export function getUpcomingMatches(matches: MatchListItem[], limit = 4) {
  const now = Date.now();

  return matches
    .filter((match) => new Date(match.kickoff_time).getTime() > now)
    .slice(0, limit);
}

export function getMissingPredictionsCount(
  matches: MatchListItem[],
  predictionsByMatchId: Map<string, MyMatchPrediction>,
) {
  return getUnpredictedOpenMatches(matches, predictionsByMatchId).length;
}

export function getPredictedMatchesCount(predictions: MyMatchPrediction[]) {
  return predictions.length;
}

export function getTotalPoints(predictions: MyMatchPrediction[]) {
  return predictions.reduce(
    (sum, prediction) => sum + (prediction.points ?? 0),
    0,
  );
}

export function getNextMissingPredictionMatch(
  matches: MatchListItem[],
  predictionsByMatchId: Map<string, MyMatchPrediction>,
) {
  const missingMatches = getUnpredictedOpenMatches(
    matches,
    predictionsByMatchId,
  );

  return missingMatches[0] || null;
}

export function getTodayMissingPredictionMatches(
  matches: MatchListItem[],
  predictionsByMatchId: Map<string, MyMatchPrediction>,
) {
  return getUnpredictedOpenMatches(matches, predictionsByMatchId).filter(
    (match) => isMatchToday(match),
  );
}

export function getPredictionProgressPercentage(
  matches: MatchListItem[],
  predictions: MyMatchPrediction[],
) {
  if (matches.length === 0) {
    return 0;
  }

  return Math.round((predictions.length / matches.length) * 100);
}

export function getRecentlySettledPredictions(
  predictions: MyMatchPrediction[],
  limit = 5,
) {
  return predictions
    .filter((prediction) => prediction.points !== null)
    .slice(0, limit);
}
