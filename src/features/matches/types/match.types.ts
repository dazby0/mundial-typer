export type MatchStatus = "scheduled" | "live" | "finished";

export type MatchListItem = {
  id: string;
  match_number: number;
  kickoff_time: string;
  stage: string;
  group_name: string;
  matchday: number;
  venue_city_pl: string | null;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  home_team_id: string;
  home_team_code: string;
  home_team_name_pl: string;
  home_team_name_en: string;
  home_team_flag_code: string | null;
  home_team_flag_emoji: string | null;
  away_team_id: string;
  away_team_code: string;
  away_team_name_pl: string;
  away_team_name_en: string;
  away_team_flag_code: string | null;
  away_team_flag_emoji: string | null;
};

export type MatchPrediction = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points: number | null;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
  } | null;
};

export type MyMatchPrediction = {
  id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points: number | null;
};
