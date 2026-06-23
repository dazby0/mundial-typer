import { MatchViewItem } from "../../matches/types/match-shared.types";
import { KnockoutResolutionMethod } from "@/src/features/knockout/types/knockout-rules.types";

export type AdminMatchItem = MatchViewItem & {
  predictions_count: number;
};

export type AdminGroupMatchResultPayload = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};

export type AdminKnockoutMatchResultPayload = {
  matchId: string;
  homeScore: number;
  awayScore: number;
  winnerTeamId: string;
  resolutionMethod: KnockoutResolutionMethod;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
};
