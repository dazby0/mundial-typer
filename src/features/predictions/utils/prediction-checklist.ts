import {
  MatchListItem,
  MyMatchPrediction,
} from "@/src/features/matches/types/match.types";

export function getPredictionProgress(
  matches: MatchListItem[],
  predictions: MyMatchPrediction[],
) {
  const total = matches.length;
  const predicted = predictions.length;
  const percentage = total === 0 ? 0 : Math.round((predicted / total) * 100);

  return {
    total,
    predicted,
    missing: total - predicted,
    percentage,
  };
}

export function isMatchToday(match: MatchListItem) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const matchDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(match.kickoff_time));

  return today === matchDate;
}

export function isMatchUrgent(match: MatchListItem) {
  const now = Date.now();
  const kickoffTime = new Date(match.kickoff_time).getTime();
  const hoursToKickoff = (kickoffTime - now) / 1000 / 60 / 60;

  return hoursToKickoff > 0 && hoursToKickoff <= 24;
}

export function getUnpredictedOpenMatches(
  matches: MatchListItem[],
  predictionsByMatchId: Map<string, MyMatchPrediction>,
) {
  const now = Date.now();

  return matches.filter((match) => {
    const matchStarted = new Date(match.kickoff_time).getTime() <= now;

    return !matchStarted && !predictionsByMatchId.has(match.id);
  });
}

export function getTodayUnpredictedMatches(
  matches: MatchListItem[],
  predictionsByMatchId: Map<string, MyMatchPrediction>,
) {
  return getUnpredictedOpenMatches(matches, predictionsByMatchId).filter(
    (match) => isMatchToday(match),
  );
}

export function getUrgentUnpredictedMatches(
  matches: MatchListItem[],
  predictionsByMatchId: Map<string, MyMatchPrediction>,
) {
  return getUnpredictedOpenMatches(matches, predictionsByMatchId).filter(
    (match) => isMatchUrgent(match),
  );
}
