import { RankingItem } from "@/src/features/ranking/types/ranking.types";

type RankingDescriptionContext = "podium" | "list";

const fallbackRankingDescriptions = [
  "Jeszcze może odpalić. Albo przynajmniej udawać, że ma plan.",
  "Na razie spokojnie obserwuje chaos i czeka na swój wielki moment.",
  "Forma jest w budowie. Fundamenty trochę krzywe, ale stoją.",
  "Typuje odważnie, czasem nawet za odważnie.",
  "Jeszcze nie wiadomo, czy to strategia, czy przypadek. Ale coś się dzieje.",
  "Niby środek tabeli, ale ambicje podobno są europejskie.",
  "Czeka na serię zwycięstw jak kibic na doliczony czas.",
  "Na razie bez fajerwerków, ale przynajmniej nie ma paniki. Chyba.",
  "Ma potencjał. Tylko piłka nożna chwilowo tego nie respektuje.",
  "Typerski diesel — może wolno się rozkręca, ale jeszcze pojedzie.",
];

function getStableDescriptionIndex(seed: string, length: number) {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % length;
  }

  return hash;
}

function getFallbackRankingDescription(item: RankingItem) {
  const seed = item.profile_id || item.username;
  const index = getStableDescriptionIndex(
    seed,
    fallbackRankingDescriptions.length,
  );

  return fallbackRankingDescriptions[index];
}

const fallbackRankingTitles = [
  "Typerski romantyk",
  "Ekspert od chaosu",
  "VAR mu nie pomaga",
  "Szaman tabeli",
  "Analityk po fakcie",
  "Kibic excela",
  "Strateg ryzyka",
  "Profesor przypadku",
  "Bukmacher z Żabki",
  "Optymista terminarza",
];

function getFallbackRankingTitle(item: RankingItem) {
  const seed = `${item.profile_id || item.username}-title`;
  const index = getStableDescriptionIndex(seed, fallbackRankingTitles.length);

  return fallbackRankingTitles[index];
}

export function getRankingTitle(
  item: RankingItem,
  position: number,
  totalPlayers?: number,
) {
  if (position === 1) {
    return "Król kapsla";
  }

  if (position === 2) {
    return "Wicemistrz lodówki";
  }

  if (position === 3) {
    return "Brązowy selekcjoner";
  }

  if (position === 4) {
    return "Tuż za podium";
  }

  if (position === 5) {
    return "Piąty Beatle";
  }

  if (totalPlayers && totalPlayers >= 4 && position === totalPlayers) {
    return "Latarnia ligi";
  }

  if (totalPlayers && totalPlayers >= 5 && position === totalPlayers - 1) {
    return "Wicelatarnia";
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

  return getFallbackRankingTitle(item);
}

export function getRankingBadgeDescription(
  item: RankingItem,
  position: number,
  context: RankingDescriptionContext = "list",
) {
  if (context === "podium") {
    if (position === 1) {
      return "Siedzi na tronie, patrzy na tabelę i udaje, że to wszystko było zaplanowane.";
    }

    if (position === 2) {
      return "Jest blisko lidera, czyli dokładnie tam, gdzie zaczyna się nerwowe liczenie punktów.";
    }

    if (position === 3) {
      return "Na podium się wbił, teraz musi tylko nie spaść z krzesełka.";
    }
  }

  if (position === 1) {
    return "Lider tabeli. Reszta ligi chwilowo patrzy z zazdrością.";
  }

  if (position === 2) {
    return "Drugi, czyli pierwszy z tych, którzy muszą jeszcze gonić.";
  }

  if (position === 3) {
    return "Podium jest, ale oddech rywali już czuć na plecach.";
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

  return getFallbackRankingDescription(item);
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
