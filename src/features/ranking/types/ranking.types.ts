export type RankingItem = {
  profile_id: string;
  username: string;
  role: "user" | "admin";
  match_points: number;
  tournament_bonus_points: number;
  total_points: number;
  predictions_count: number;
  exact_scores_count: number;
  correct_results_count: number;
  wrong_predictions_count: number;
};
