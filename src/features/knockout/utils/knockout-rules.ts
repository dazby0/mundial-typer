import {
  KnockoutPredictionInput,
  KnockoutPredictionPoints,
  KnockoutPredictionPointsInput,
  KnockoutResolutionMethod,
  KnockoutResultInput,
  KnockoutStage,
  MatchStage,
  TeamSide,
} from "../types/knockout-rules.types";

export const KNOCKOUT_STAGES = [
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
] as const satisfies readonly KnockoutStage[];

export const KNOCKOUT_RESOLUTION_METHODS = [
  "in_match",
  "penalties",
] as const satisfies readonly KnockoutResolutionMethod[];

export function isKnockoutStage(
  stage: string | null | undefined,
): stage is KnockoutStage {
  return KNOCKOUT_STAGES.includes(stage as KnockoutStage);
}

export function isGroupStage(stage: string | null | undefined) {
  return stage === "group_stage";
}

export function isPenaltyResolution(
  method: string | null | undefined,
): method is "penalties" {
  return method === "penalties";
}

export function isInMatchResolution(
  method: string | null | undefined,
): method is "in_match" {
  return method === "in_match";
}

export function getResolutionMethodLabel(
  method: KnockoutResolutionMethod | null | undefined,
) {
  if (method === "penalties") {
    return "Po karnych";
  }

  if (method === "in_match") {
    return "W meczu";
  }

  return "Nieustalone";
}

export function getResolutionMethodDescription(
  method: KnockoutResolutionMethod,
) {
  if (method === "penalties") {
    return "Po 120 minutach był remis, a awans rozstrzygnęła seria rzutów karnych.";
  }

  return "Drużyna wygrała bez serii rzutów karnych — po 90 minutach albo po dogrywce.";
}

export function getWinnerSideFromScore(
  homeScore: number,
  awayScore: number,
): TeamSide | null {
  if (homeScore > awayScore) {
    return "home";
  }

  if (awayScore > homeScore) {
    return "away";
  }

  return null;
}

export function getWinnerTeamIdFromScore({
  homeScore,
  awayScore,
  homeTeamId,
  awayTeamId,
}: {
  homeScore: number;
  awayScore: number;
  homeTeamId: string;
  awayTeamId: string;
}) {
  const winnerSide = getWinnerSideFromScore(homeScore, awayScore);

  if (winnerSide === "home") {
    return homeTeamId;
  }

  if (winnerSide === "away") {
    return awayTeamId;
  }

  return null;
}

export function isValidKnockoutWinnerTeam({
  winnerTeamId,
  homeTeamId,
  awayTeamId,
}: {
  winnerTeamId: string | null | undefined;
  homeTeamId: string;
  awayTeamId: string;
}) {
  return winnerTeamId === homeTeamId || winnerTeamId === awayTeamId;
}

export function validateKnockoutPrediction(input: KnockoutPredictionInput) {
  const errors: string[] = [];

  if (
    !isValidKnockoutWinnerTeam({
      winnerTeamId: input.predictedWinnerTeamId,
      homeTeamId: input.homeTeamId,
      awayTeamId: input.awayTeamId,
    })
  ) {
    errors.push("Wybierz drużynę, która bierze udział w tym meczu.");
  }

  if (input.predictedResolutionMethod === "in_match") {
    if (input.homeScore === input.awayScore) {
      errors.push("Przy opcji „W meczu” wynik nie może być remisowy.");
    }

    const scoreWinnerTeamId = getWinnerTeamIdFromScore(input);

    if (
      scoreWinnerTeamId &&
      scoreWinnerTeamId !== input.predictedWinnerTeamId
    ) {
      errors.push("Wybrana drużyna awansująca musi zgadzać się z wynikiem.");
    }
  }

  if (input.predictedResolutionMethod === "penalties") {
    if (input.homeScore !== input.awayScore) {
      errors.push(
        "Przy opcji „Po karnych” wynik po 120 minutach musi być remisowy.",
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateKnockoutResult(input: KnockoutResultInput) {
  const errors: string[] = [];

  if (!isValidKnockoutWinnerTeam(input)) {
    errors.push("Zwycięzca musi być jedną z drużyn tego meczu.");
  }

  if (input.resolutionMethod === "in_match") {
    if (input.homeScore === input.awayScore) {
      errors.push("Przy rozstrzygnięciu w meczu wynik nie może być remisowy.");
    }

    if (
      input.homePenaltyScore !== null &&
      input.homePenaltyScore !== undefined
    ) {
      errors.push("Przy rozstrzygnięciu w meczu nie wpisujemy karnych.");
    }

    if (
      input.awayPenaltyScore !== null &&
      input.awayPenaltyScore !== undefined
    ) {
      errors.push("Przy rozstrzygnięciu w meczu nie wpisujemy karnych.");
    }

    const scoreWinnerTeamId = getWinnerTeamIdFromScore(input);

    if (scoreWinnerTeamId && scoreWinnerTeamId !== input.winnerTeamId) {
      errors.push("Zwycięzca musi zgadzać się z wynikiem meczu.");
    }
  }

  if (input.resolutionMethod === "penalties") {
    if (input.homeScore !== input.awayScore) {
      errors.push("Przy karnych wynik po 120 minutach musi być remisowy.");
    }

    if (
      input.homePenaltyScore === null ||
      input.homePenaltyScore === undefined
    ) {
      errors.push("Wpisz wynik karnych dla gospodarza.");
    }

    if (
      input.awayPenaltyScore === null ||
      input.awayPenaltyScore === undefined
    ) {
      errors.push("Wpisz wynik karnych dla gościa.");
    }

    if (
      input.homePenaltyScore !== null &&
      input.homePenaltyScore !== undefined &&
      input.awayPenaltyScore !== null &&
      input.awayPenaltyScore !== undefined &&
      input.homePenaltyScore === input.awayPenaltyScore
    ) {
      errors.push("Wynik serii karnych nie może być remisowy.");
    }

    if (
      input.homePenaltyScore !== null &&
      input.homePenaltyScore !== undefined &&
      input.awayPenaltyScore !== null &&
      input.awayPenaltyScore !== undefined
    ) {
      const penaltyWinnerTeamId =
        input.homePenaltyScore > input.awayPenaltyScore
          ? input.homeTeamId
          : input.awayTeamId;

      if (penaltyWinnerTeamId !== input.winnerTeamId) {
        errors.push("Zwycięzca musi zgadzać się z wynikiem karnych.");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateKnockoutPredictionPoints({
  predictedWinnerTeamId,
  predictedResolutionMethod,
  predictedHomeScore,
  predictedAwayScore,
  actualWinnerTeamId,
  actualResolutionMethod,
  actualHomeScore,
  actualAwayScore,
}: KnockoutPredictionPointsInput): KnockoutPredictionPoints {
  if (
    !predictedWinnerTeamId ||
    !predictedResolutionMethod ||
    !actualWinnerTeamId ||
    !actualResolutionMethod ||
    actualHomeScore === null ||
    actualAwayScore === null
  ) {
    return 0;
  }

  if (predictedWinnerTeamId !== actualWinnerTeamId) {
    return 0;
  }

  if (predictedResolutionMethod !== actualResolutionMethod) {
    return 1;
  }

  if (
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore
  ) {
    return 4;
  }

  return 2;
}

export function shouldUseKnockoutPredictionForm(stage: MatchStage | string) {
  return isKnockoutStage(stage);
}
