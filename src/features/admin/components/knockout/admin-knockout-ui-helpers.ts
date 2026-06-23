import {
  AdminKnockoutProposalMatch,
  AdminKnockoutReadiness,
  AdminKnockoutThirdPlaceOption,
} from "@/src/features/admin/types/admin-knockout.types";

export type TeamDisplay = {
  id: string | null;
  code: string | null;
  name: string | null;
  flagCode: string | null;
};

export type OptionsBySlot = Record<string, AdminKnockoutThirdPlaceOption[]>;

export function getSelectionKey(matchCode: string, slotSide: "home" | "away") {
  return `${matchCode}:${slotSide}`;
}

export function getReadinessMessage(readiness: AdminKnockoutReadiness) {
  if (readiness.readiness_status === "ready") {
    return "Wszystko gotowe. Możesz zatwierdzić 1/16 finału.";
  }

  if (readiness.readiness_status === "group_stage_in_progress") {
    return `Faza grupowa jeszcze trwa. Do zakończenia zostało ${readiness.unfinished_group_matches} meczów.`;
  }

  if (readiness.readiness_status === "round_of_32_already_confirmed") {
    return "Drabinka 1/16 finału została już zatwierdzona.";
  }

  if (readiness.readiness_status === "knockout_matches_already_created") {
    return "Mecze pucharowe istnieją już w tabeli matches.";
  }

  return "Drabinka nie jest jeszcze gotowa do zatwierdzenia.";
}

export function getHomeTeam(match: AdminKnockoutProposalMatch): TeamDisplay {
  if (match.confirmed_home_team_id) {
    return {
      id: match.confirmed_home_team_id,
      code: match.confirmed_home_team_code,
      name: match.confirmed_home_team_name_pl,
      flagCode: match.confirmed_home_team_flag_code,
    };
  }

  return {
    id: match.home_auto_team_id,
    code: match.home_auto_team_code,
    name: match.home_auto_team_name_pl,
    flagCode: match.home_auto_team_flag_code,
  };
}

export function getAwayTeam(
  match: AdminKnockoutProposalMatch,
  selectedOption: AdminKnockoutThirdPlaceOption | null,
): TeamDisplay {
  if (match.confirmed_away_team_id) {
    return {
      id: match.confirmed_away_team_id,
      code: match.confirmed_away_team_code,
      name: match.confirmed_away_team_name_pl,
      flagCode: match.confirmed_away_team_flag_code,
    };
  }

  if (match.away_slot_type === "third_place_dropdown") {
    return {
      id: selectedOption?.team_id || null,
      code: selectedOption?.code || null,
      name: selectedOption?.name_pl || selectedOption?.name_en || null,
      flagCode: selectedOption?.flag_code || null,
    };
  }

  return {
    id: match.away_auto_team_id,
    code: match.away_auto_team_code,
    name: match.away_auto_team_name_pl,
    flagCode: match.away_auto_team_flag_code,
  };
}
