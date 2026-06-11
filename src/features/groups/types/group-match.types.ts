import { MatchStatus } from "@/src/features/matches/types/match.types";

export type GroupMatchItem = {
  id: string;
  match_number: number;
  kickoff_time: string;
  group_name: string;
  matchday: number;
  venue_city_pl: string | null;
  home_score: number | null;
  away_score: number | null;
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
};
