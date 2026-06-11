export type QualificationStatus =
  | "qualified_top_two"
  | "qualified_third_place"
  | "eliminated";

export type GroupStandingItem = {
  team_id: string;
  group_name: string;
  code: string;
  name_pl: string;
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
  qualification_status: QualificationStatus;
};
