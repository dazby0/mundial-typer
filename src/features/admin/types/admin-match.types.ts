import { MatchListItem } from "@/src/features/matches/types/match.types";

export type AdminMatchItem = MatchListItem & {
  predictions_count: number;
};
