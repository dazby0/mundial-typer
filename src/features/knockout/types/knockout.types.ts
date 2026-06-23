export type KnockoutRoundKey =
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

export type KnockoutPredictionStatus = "locked" | "open";

export type KnockoutMatchStatus = "scheduled" | "live" | "finished";

export type KnockoutResolutionMethod = "in_match" | "penalties";

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

  home_team_id: string | null;
  away_team_id: string | null;
  match_id: string | null;
  is_confirmed: boolean;
  confirmed_at: string | null;
  confirmed_by: string | null;
  created_at: string;
  updated_at: string;

  home_team_code: string | null;
  home_team_name_pl: string | null;
  home_team_name_en: string | null;
  home_team_flag_code: string | null;
  home_team_flag_emoji: string | null;

  away_team_code: string | null;
  away_team_name_pl: string | null;
  away_team_name_en: string | null;
  away_team_flag_code: string | null;
  away_team_flag_emoji: string | null;

  match_number: number | null;
  status: KnockoutMatchStatus | null;
  home_score: number | null;
  away_score: number | null;
  winner_team_id: string | null;
  resolution_method: KnockoutResolutionMethod | null;
  home_penalty_score: number | null;
  away_penalty_score: number | null;

  winner_team_code: string | null;
  winner_team_name_pl: string | null;
  winner_team_name_en: string | null;
  winner_team_flag_code: string | null;
  winner_team_flag_emoji: string | null;
};

export type KnockoutRoundGroup = {
  roundKey: KnockoutRoundKey;
  roundLabel: string;
  roundOrder: number;
  matches: KnockoutMatchPreview[];
};
