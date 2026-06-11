import { RankingItem } from "@/src/features/ranking/types/ranking.types";

export function getRankingTitle(item: RankingItem, position: number) {
  if (position === 1) {
    return "Król kapsla";
  }

  if (position === 2) {
    return "Wicemistrz lodówki";
  }

  if (position === 3) {
    return "Brązowy selekcjoner";
  }

  if (item.exact_scores_count >= 3) {
    return "Snajper wyników";
  }

  if (item.wrong_predictions_count >= 5) {
    return "Futbol go nie lubi";
  }

  if (item.predictions_count >= 20 && item.total_points === 0) {
    return "Statystyczny dramat";
  }

  if (item.correct_results_count >= 5) {
    return "Czuł rezultat";
  }

  return "Walka o honor";
}

export function getRankingBadgeDescription(
  item: RankingItem,
  position: number,
) {
  if (position === 1) {
    return "Aktualnie siedzi na tronie i liczy butelki.";
  }

  if (position === 2) {
    return "Niby wysoko, ale lider dalej pije spokojniej.";
  }

  if (position === 3) {
    return "Podium jest, presja też.";
  }

  if (item.exact_scores_count >= 3) {
    return "Dokładne wyniki nie są przypadkiem. Chyba.";
  }

  if (item.wrong_predictions_count >= 5) {
    return "Dużo odwagi, mało punktów.";
  }

  if (item.predictions_count >= 20 && item.total_points === 0) {
    return "Typował dużo. Piłka miała inne zdanie.";
  }

  if (item.correct_results_count >= 5) {
    return "Wyniku nie trafił, ale kierunek czuł.";
  }

  return "Jeszcze może odpalić. Albo nie.";
}

export function getPointsToLeader(
  item: RankingItem,
  leader: RankingItem | null,
) {
  if (!leader) {
    return 0;
  }

  return Math.max(leader.total_points - item.total_points, 0);
}

export function getRankingHighlights(ranking: RankingItem[]) {
  const mostExact = [...ranking].sort((a, b) => {
    if (b.exact_scores_count !== a.exact_scores_count) {
      return b.exact_scores_count - a.exact_scores_count;
    }

    return b.total_points - a.total_points;
  })[0];

  const mostWrong = [...ranking].sort((a, b) => {
    if (b.wrong_predictions_count !== a.wrong_predictions_count) {
      return b.wrong_predictions_count - a.wrong_predictions_count;
    }

    return b.predictions_count - a.predictions_count;
  })[0];

  const mostPredictions = [...ranking].sort((a, b) => {
    if (b.predictions_count !== a.predictions_count) {
      return b.predictions_count - a.predictions_count;
    }

    return b.total_points - a.total_points;
  })[0];

  return {
    mostExact,
    mostWrong,
    mostPredictions,
  };
}
