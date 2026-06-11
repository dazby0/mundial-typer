import { MatchStatus } from "@/src/features/matches/types/match.types";

export type ResultMatchItem = {
  id: string;
  match_number: number;
  kickoff_time: string;
  stage: string;
  group_name: string;
  matchday: number;
  venue_city_pl: string | null;
  home_score: number;
  away_score: number;
  status: MatchStatus;

  home_team_id: string;
  home_team_code: string;
  home_team_name_pl: string;
  home_team_flag_code: string | null;
  home_team_flag_emoji: string | null;

  away_team_id: string;
  away_team_code: string;
  away_team_name_pl: string;
  away_team_flag_code: string | null;
  away_team_flag_emoji: string | null;

  predictions_count: number;
  exact_scores_count: number;
  correct_results_count: number;
  wrong_predictions_count: number;
  total_points_awarded: number;
};
