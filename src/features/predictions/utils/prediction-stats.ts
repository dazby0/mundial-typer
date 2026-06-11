import { MatchPrediction } from "@/src/features/matches/types/match.types";

export type PredictionOutcome = "home" | "draw" | "away";

export type ScorePopularity = {
  score: string;
  count: number;
};

export function getPredictionOutcome(
  homeScore: number,
  awayScore: number,
): PredictionOutcome {
  if (homeScore > awayScore) {
    return "home";
  }

  if (homeScore < awayScore) {
    return "away";
  }

  return "draw";
}

export function getOutcomeLabel(
  outcome: PredictionOutcome,
  homeTeamName: string,
  awayTeamName: string,
) {
  if (outcome === "home") {
    return `Wygrana: ${homeTeamName}`;
  }

  if (outcome === "away") {
    return `Wygrana: ${awayTeamName}`;
  }

  return "Remis";
}

export function getPredictionStats(predictions: MatchPrediction[]) {
  const homeWins = predictions.filter(
    (prediction) =>
      getPredictionOutcome(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
      ) === "home",
  ).length;

  const draws = predictions.filter(
    (prediction) =>
      getPredictionOutcome(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
      ) === "draw",
  ).length;

  const awayWins = predictions.filter(
    (prediction) =>
      getPredictionOutcome(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
      ) === "away",
  ).length;

  return {
    total: predictions.length,
    homeWins,
    draws,
    awayWins,
  };
}

export function getMostPopularScore(
  predictions: MatchPrediction[],
): ScorePopularity | null {
  if (predictions.length === 0) {
    return null;
  }

  const scoreCounts = predictions.reduce<Record<string, number>>(
    (acc, prediction) => {
      const score = `${prediction.predicted_home_score}:${prediction.predicted_away_score}`;
      acc[score] = (acc[score] || 0) + 1;

      return acc;
    },
    {},
  );

  const [score, count] = Object.entries(scoreCounts).sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return a[0].localeCompare(b[0]);
  })[0];

  return {
    score,
    count,
  };
}

export function getMajorityOutcome(
  predictions: MatchPrediction[],
): PredictionOutcome | null {
  if (predictions.length === 0) {
    return null;
  }

  const stats = getPredictionStats(predictions);

  const outcomes = [
    {
      outcome: "home" as const,
      count: stats.homeWins,
    },
    {
      outcome: "draw" as const,
      count: stats.draws,
    },
    {
      outcome: "away" as const,
      count: stats.awayWins,
    },
  ].sort((a, b) => b.count - a.count);

  if (outcomes[0].count === 0) {
    return null;
  }

  return outcomes[0].outcome;
}

export function getUserAgainstCrowdMessage(
  userPrediction: MatchPrediction | null,
  predictions: MatchPrediction[],
) {
  if (!userPrediction || predictions.length === 0) {
    return null;
  }

  const majorityOutcome = getMajorityOutcome(predictions);

  if (!majorityOutcome) {
    return null;
  }

  const userOutcome = getPredictionOutcome(
    userPrediction.predicted_home_score,
    userPrediction.predicted_away_score,
  );

  if (userOutcome === majorityOutcome) {
    return "Jesteś z większością. Bezpiecznie, zespołowo, trochę jak typowy ekspert w studiu.";
  }

  return "Sam przeciwko światu. Albo geniusz, albo za chwilę screen na grupie.";
}

export function getFinishedPredictionStats(predictions: MatchPrediction[]) {
  return {
    exactScores: predictions.filter((prediction) => prediction.points === 3)
      .length,
    correctResults: predictions.filter((prediction) => prediction.points === 1)
      .length,
    wrongPredictions: predictions.filter(
      (prediction) => prediction.points === 0,
    ).length,
  };
}
