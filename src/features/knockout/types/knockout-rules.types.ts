export type KnockoutResolutionMethod = "in_match" | "penalties";

export type KnockoutPredictionPoints = 0 | 1 | 2 | 4;

export type KnockoutStage =
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

export type MatchStage = "group_stage" | KnockoutStage | "knockout_stage";

export type TeamSide = "home" | "away";

export type KnockoutTeamIds = {
  homeTeamId: string;
  awayTeamId: string;
};

export type KnockoutScore = {
  homeScore: number;
  awayScore: number;
};

export type KnockoutPredictionInput = KnockoutScore &
  KnockoutTeamIds & {
    predictedWinnerTeamId: string;
    predictedResolutionMethod: KnockoutResolutionMethod;
  };

export type KnockoutResultInput = KnockoutScore &
  KnockoutTeamIds & {
    winnerTeamId: string;
    resolutionMethod: KnockoutResolutionMethod;
    homePenaltyScore?: number | null;
    awayPenaltyScore?: number | null;
  };

export type KnockoutPredictionPointsInput = {
  predictedWinnerTeamId: string | null;
  predictedResolutionMethod: KnockoutResolutionMethod | null;
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualWinnerTeamId: string | null;
  actualResolutionMethod: KnockoutResolutionMethod | null;
  actualHomeScore: number | null;
  actualAwayScore: number | null;
};
