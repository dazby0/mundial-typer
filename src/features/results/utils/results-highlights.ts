import { ResultMatchItem } from "@/src/features/results/types/result.types";

export function getResultsHighlights(results: ResultMatchItem[]) {
  if (results.length === 0) {
    return {
      expertMatch: null,
      shameMatch: null,
      pointsMineMatch: null,
    };
  }

  const expertMatch = [...results].sort((a, b) => {
    if (b.exact_scores_count !== a.exact_scores_count) {
      return b.exact_scores_count - a.exact_scores_count;
    }

    return b.predictions_count - a.predictions_count;
  })[0];

  const shameMatch = [...results].sort((a, b) => {
    if (b.wrong_predictions_count !== a.wrong_predictions_count) {
      return b.wrong_predictions_count - a.wrong_predictions_count;
    }

    return b.predictions_count - a.predictions_count;
  })[0];

  const pointsMineMatch = [...results].sort((a, b) => {
    if (b.total_points_awarded !== a.total_points_awarded) {
      return b.total_points_awarded - a.total_points_awarded;
    }

    return b.predictions_count - a.predictions_count;
  })[0];

  return {
    expertMatch,
    shameMatch,
    pointsMineMatch,
  };
}

export function formatResultMatchName(match: ResultMatchItem) {
  return `${match.home_team_name_pl} ${match.home_score}:${match.away_score} ${match.away_team_name_pl}`;
}
