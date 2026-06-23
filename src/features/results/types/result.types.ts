import { MatchStatus } from "@/src/features/matches/types/match.types";
import {
  KnockoutResolutionMethod,
  MatchStage,
} from "@/src/features/knockout/types/knockout-rules.types";

export type ResultMatchItem = {
  id: string;
  match_number: number | null;
  kickoff_time: string;
  stage: MatchStage;
  group_name: string | null;
  round_key: string | null;
  round_label: string | null;
  matchday: number | null;
  venue_city_pl: string | null;
  home_score: number;
  away_score: number;
  status: MatchStatus;

  home_team_id: string;
  home_team_code: string;
  home_team_name_pl: string | null;
  home_team_flag_code: string | null;
  home_team_flag_emoji: string | null;

  away_team_id: string;
  away_team_code: string;
  away_team_name_pl: string | null;
  away_team_flag_code: string | null;
  away_team_flag_emoji: string | null;

  winner_team_id: string | null;
  winner_team_code: string | null;
  winner_team_name_pl: string | null;
  winner_team_flag_code: string | null;
  winner_team_flag_emoji: string | null;

  resolution_method: KnockoutResolutionMethod | null;
  home_penalty_score: number | null;
  away_penalty_score: number | null;

  predictions_count: number;
  exact_scores_count: number;
  correct_results_count: number;
  wrong_predictions_count: number;
  total_points_awarded: number;

  knockout_perfect_predictions_count: number;
  knockout_method_predictions_count: number;
};
