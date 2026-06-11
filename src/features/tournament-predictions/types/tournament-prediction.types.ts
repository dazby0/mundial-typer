export type TournamentPrediction = {
  id: string;
  user_id: string;
  champion_team_id: string;
  finalist_team_1_id: string;
  finalist_team_2_id: string;
  semifinalist_team_1_id: string;
  semifinalist_team_2_id: string;
  semifinalist_team_3_id: string;
  semifinalist_team_4_id: string;
  top_scorer_name: string;
  top_scoring_team_id: string;
  champion_points: number | null;
  finalist_points: number | null;
  finalist_bonus_points: number | null;
  semifinalist_points: number | null;
  top_scorer_points: number | null;
  top_scoring_team_points: number | null;
  total_points: number;
  created_at: string;
  updated_at: string;
};

export type TournamentPredictionPayload = {
  champion_team_id: string;
  finalist_team_1_id: string;
  finalist_team_2_id: string;
  semifinalist_team_1_id: string;
  semifinalist_team_2_id: string;
  semifinalist_team_3_id: string;
  semifinalist_team_4_id: string;
  top_scorer_name: string;
  top_scoring_team_id: string;
};

export type TournamentBonusResult = TournamentPredictionPayload & {
  is_finalized: boolean;
};

export type TournamentTeamOption = {
  id: string;
  name_pl: string;
  name_en: string;
  code: string;
  group_name: string;
  flag_code: string | null;
  flag_emoji: string | null;
};

export type TournamentPredictionPointsBreakdown = {
  champion_points: number;
  finalist_points: number;
  finalist_bonus_points: number;
  semifinalist_points: number;
  top_scorer_points: number;
  top_scoring_team_points: number;
  total_points: number;
};

export type PublicTournamentPrediction = {
  id: string;
  user_id: string;
  username: string;

  champion_team_id: string;
  champion_team_name_pl: string;
  champion_team_code: string;
  champion_team_flag_code: string | null;
  champion_team_flag_emoji: string | null;

  finalist_team_1_id: string;
  finalist_team_1_name_pl: string;
  finalist_team_1_code: string;
  finalist_team_1_flag_code: string | null;
  finalist_team_1_flag_emoji: string | null;

  finalist_team_2_id: string;
  finalist_team_2_name_pl: string;
  finalist_team_2_code: string;
  finalist_team_2_flag_code: string | null;
  finalist_team_2_flag_emoji: string | null;

  semifinalist_team_1_id: string;
  semifinalist_team_1_name_pl: string;
  semifinalist_team_1_code: string;
  semifinalist_team_1_flag_code: string | null;
  semifinalist_team_1_flag_emoji: string | null;

  semifinalist_team_2_id: string;
  semifinalist_team_2_name_pl: string;
  semifinalist_team_2_code: string;
  semifinalist_team_2_flag_code: string | null;
  semifinalist_team_2_flag_emoji: string | null;

  semifinalist_team_3_id: string;
  semifinalist_team_3_name_pl: string;
  semifinalist_team_3_code: string;
  semifinalist_team_3_flag_code: string | null;
  semifinalist_team_3_flag_emoji: string | null;

  semifinalist_team_4_id: string;
  semifinalist_team_4_name_pl: string;
  semifinalist_team_4_code: string;
  semifinalist_team_4_flag_code: string | null;
  semifinalist_team_4_flag_emoji: string | null;

  top_scorer_name: string;

  top_scoring_team_id: string;
  top_scoring_team_name_pl: string;
  top_scoring_team_code: string;
  top_scoring_team_flag_code: string | null;
  top_scoring_team_flag_emoji: string | null;

  champion_points: number | null;
  finalist_points: number | null;
  finalist_bonus_points: number | null;
  semifinalist_points: number | null;
  top_scorer_points: number | null;
  top_scoring_team_points: number | null;
  total_points: number;
  created_at: string;
  updated_at: string;
};

export type TournamentPredictionTeamSummary = {
  teamId: string;
  name: string;
  code: string;
  flagCode: string | null;
  flagEmoji: string | null;
  count: number;
};
