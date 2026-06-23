import {
  KnockoutResolutionMethod,
  MatchStage,
} from "@/src/features/knockout/types/knockout-rules.types";

export type MatchStatus = "scheduled" | "finished" | "live";

export type MatchBaseFields = {
  id: string;
  match_number: number | null;
  kickoff_time: string;
  stage: MatchStage;
  group_name: string | null;
  matchday: number | null;
  venue_city_en: string | null;
  venue_city_pl: string | null;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
};

export type MatchTeamFields = {
  home_team_id: string;
  home_team_code: string;
  home_team_name_en: string;
  home_team_name_pl: string | null;
  home_team_flag_code: string | null;
  home_team_flag_emoji: string | null;

  away_team_id: string;
  away_team_code: string;
  away_team_name_en: string;
  away_team_name_pl: string | null;
  away_team_flag_code: string | null;
  away_team_flag_emoji: string | null;
};

export type MatchKnockoutFields = {
  match_code: string | null;
  round_key: string | null;
  round_label: string | null;

  winner_team_id: string | null;
  winner_team_code: string | null;
  winner_team_name_en: string | null;
  winner_team_name_pl: string | null;
  winner_team_flag_code: string | null;
  winner_team_flag_emoji: string | null;

  resolution_method: KnockoutResolutionMethod | null;
  home_penalty_score: number | null;
  away_penalty_score: number | null;
};

export type MatchViewItem = MatchBaseFields &
  MatchTeamFields &
  MatchKnockoutFields;
