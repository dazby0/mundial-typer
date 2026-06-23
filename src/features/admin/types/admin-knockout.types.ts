export type KnockoutReadinessStatus =
  | "group_stage_in_progress"
  | "invalid_round_of_32_preview_count"
  | "round_of_32_already_confirmed"
  | "knockout_matches_already_created"
  | "invalid_proposal_count"
  | "ready";

export type AdminKnockoutReadiness = {
  total_group_matches: number;
  finished_group_matches: number;
  unfinished_group_matches: number;
  is_group_stage_finished: boolean;
  total_round_of_32_matches: number;
  confirmed_round_of_32_matches: number;
  round_of_32_matches_with_teams: number;
  round_of_32_matches_with_match_id: number;
  created_knockout_matches: number;
  proposal_matches_count: number;
  resolved_home_auto_slots: number;
  resolved_away_auto_slots: number;
  third_place_dropdown_slots: number;
  can_confirm_round_of_32: boolean;
  readiness_status: KnockoutReadinessStatus;
};

export type AdminKnockoutProposalMatch = {
  id: string;
  match_code: string;
  round_key: string;
  round_label: string;
  round_order: number;
  match_order: number;
  kickoff_time: string | null;
  venue_city: string;
  venue_label: string;
  home_slot_label: string;
  away_slot_label: string;
  prediction_status: string;
  match_id: string | null;
  is_confirmed: boolean;
  confirmed_at: string | null;
  confirmed_by: string | null;

  home_slot_type: "auto_top_two" | "third_place_dropdown" | "placeholder";
  home_auto_group_name: string | null;
  home_auto_group_position: number | null;
  home_auto_team_id: string | null;
  home_auto_team_code: string | null;
  home_auto_team_name_pl: string | null;
  home_auto_team_name_en: string | null;
  home_auto_team_flag_code: string | null;
  home_auto_team_flag_emoji: string | null;
  home_auto_team_points: number | null;
  home_auto_team_goal_difference: number | null;

  away_slot_type: "auto_top_two" | "third_place_dropdown" | "placeholder";
  away_auto_group_name: string | null;
  away_auto_group_position: number | null;
  away_auto_team_id: string | null;
  away_auto_team_code: string | null;
  away_auto_team_name_pl: string | null;
  away_auto_team_name_en: string | null;
  away_auto_team_flag_code: string | null;
  away_auto_team_flag_emoji: string | null;
  away_auto_team_points: number | null;
  away_auto_team_goal_difference: number | null;

  confirmed_home_team_id: string | null;
  confirmed_home_team_code: string | null;
  confirmed_home_team_name_pl: string | null;
  confirmed_home_team_name_en: string | null;
  confirmed_home_team_flag_code: string | null;
  confirmed_home_team_flag_emoji: string | null;

  confirmed_away_team_id: string | null;
  confirmed_away_team_code: string | null;
  confirmed_away_team_name_pl: string | null;
  confirmed_away_team_name_en: string | null;
  confirmed_away_team_flag_code: string | null;
  confirmed_away_team_flag_emoji: string | null;
};

export type AdminKnockoutThirdPlaceOption = {
  match_code: string;
  slot_side: "home" | "away";
  slot_label: string;
  allowed_group_letter: string;
  allowed_group_name: string;
  team_id: string;
  group_name: string;
  code: string;
  name_pl: string | null;
  name_en: string;
  flag_code: string | null;
  flag_emoji: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  group_position: number;
  third_place_rank: number | null;
  qualification_status: string;
};

export type ThirdPlaceSelectionPayload = {
  match_code: string;
  slot_side: "home" | "away";
  team_id: string;
};
