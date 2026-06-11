import {
  PublicTournamentPrediction,
  TournamentPredictionTeamSummary,
} from "@/src/features/tournament-predictions/types/tournament-prediction.types";

type TeamCounterInput = {
  teamId: string;
  name: string;
  code: string;
  flagCode: string | null;
  flagEmoji: string | null;
};

function getMostPopularTeam(items: TeamCounterInput[]) {
  if (items.length === 0) {
    return null;
  }

  const map = new Map<string, TournamentPredictionTeamSummary>();

  items.forEach((item) => {
    const current = map.get(item.teamId);

    if (current) {
      map.set(item.teamId, {
        ...current,
        count: current.count + 1,
      });
      return;
    }

    map.set(item.teamId, {
      teamId: item.teamId,
      name: item.name,
      code: item.code,
      flagCode: item.flagCode,
      flagEmoji: item.flagEmoji,
      count: 1,
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.name.localeCompare(b.name);
  })[0];
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getMostPopularText(values: string[]) {
  if (values.length === 0) {
    return null;
  }

  const map = new Map<
    string,
    {
      value: string;
      count: number;
    }
  >();

  values.forEach((value) => {
    const normalized = normalizeText(value);
    const current = map.get(normalized);

    if (current) {
      map.set(normalized, {
        ...current,
        count: current.count + 1,
      });
      return;
    }

    map.set(normalized, {
      value,
      count: 1,
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.value.localeCompare(b.value);
  })[0];
}

export function getTournamentCommunityStats(
  predictions: PublicTournamentPrediction[],
) {
  const mostPopularChampion = getMostPopularTeam(
    predictions.map((prediction) => ({
      teamId: prediction.champion_team_id,
      name: prediction.champion_team_name_pl,
      code: prediction.champion_team_code,
      flagCode: prediction.champion_team_flag_code,
      flagEmoji: prediction.champion_team_flag_emoji,
    })),
  );

  const mostPopularTopScoringTeam = getMostPopularTeam(
    predictions.map((prediction) => ({
      teamId: prediction.top_scoring_team_id,
      name: prediction.top_scoring_team_name_pl,
      code: prediction.top_scoring_team_code,
      flagCode: prediction.top_scoring_team_flag_code,
      flagEmoji: prediction.top_scoring_team_flag_emoji,
    })),
  );

  const mostPopularTopScorer = getMostPopularText(
    predictions.map((prediction) => prediction.top_scorer_name),
  );

  const highestBonusPrediction = [...predictions].sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }

    return a.username.localeCompare(b.username);
  })[0];

  return {
    totalPredictions: predictions.length,
    mostPopularChampion,
    mostPopularTopScoringTeam,
    mostPopularTopScorer,
    highestBonusPrediction,
  };
}
