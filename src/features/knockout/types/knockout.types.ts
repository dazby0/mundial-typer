export type KnockoutRoundKey =
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

export type KnockoutPredictionStatus = "locked" | "open";

export type KnockoutMatchPreview = {
  id: string;
  match_code: string;
  round_key: KnockoutRoundKey;
  round_label: string;
  round_order: number;
  match_order: number;
  kickoff_time: string | null;
  venue_city: string;
  venue_label: string;
  home_slot_label: string;
  away_slot_label: string;
  prediction_status: KnockoutPredictionStatus;
};

export type KnockoutRoundGroup = {
  roundKey: KnockoutRoundKey;
  roundLabel: string;
  roundOrder: number;
  matches: KnockoutMatchPreview[];
};
