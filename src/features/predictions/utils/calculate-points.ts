type CalculatePointsParams = {
  predictedHomeScore: number;
  predictedAwayScore: number;
  homeScore: number;
  awayScore: number;
};

function getResult(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) {
    return "home";
  }

  if (homeScore < awayScore) {
    return "away";
  }

  return "draw";
}

export function calculatePredictionPoints({
  predictedHomeScore,
  predictedAwayScore,
  homeScore,
  awayScore,
}: CalculatePointsParams) {
  if (predictedHomeScore === homeScore && predictedAwayScore === awayScore) {
    return 3;
  }

  const predictedResult = getResult(predictedHomeScore, predictedAwayScore);
  const actualResult = getResult(homeScore, awayScore);

  if (predictedResult === actualResult) {
    return 1;
  }

  return 0;
}
