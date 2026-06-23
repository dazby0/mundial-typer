import { AdminMatchItem } from "@/src/features/admin/types/admin-match.types";
import {
  MATCH_STAGE_FILTERS,
  MatchStageFilter,
} from "@/src/features/matches/utils/match-filters";

export type AdminMatchStatusFilter = "all" | "missing" | "finished";
export type AdminMatchStageFilter = MatchStageFilter;

export function getValidAdminStatusFilter(
  status?: string,
): AdminMatchStatusFilter {
  if (status === "missing" || status === "finished") {
    return status;
  }

  return "all";
}

export function getValidAdminStageFilter(
  stage?: string,
): AdminMatchStageFilter {
  const validStage = MATCH_STAGE_FILTERS.find(
    (stageFilter) => stageFilter.value === stage,
  );

  return validStage?.value || "all";
}

export function getValidAdminGroupFilter(group?: string) {
  if (!group || group === "all") {
    return "all";
  }

  return group;
}

export function filterAdminMatchesByStatus(
  matches: AdminMatchItem[],
  statusFilter: AdminMatchStatusFilter,
) {
  if (statusFilter === "missing") {
    return matches.filter((match) => match.status !== "finished");
  }

  if (statusFilter === "finished") {
    return matches.filter((match) => match.status === "finished");
  }

  return matches;
}

export function filterAdminMatchesByStage(
  matches: AdminMatchItem[],
  stageFilter: AdminMatchStageFilter,
) {
  if (stageFilter === "all") {
    return matches;
  }

  return matches.filter((match) => match.stage === stageFilter);
}

export function filterAdminMatchesByGroup(
  matches: AdminMatchItem[],
  groupFilter: string,
) {
  if (groupFilter === "all") {
    return matches;
  }

  return matches.filter((match) => match.group_name === groupFilter);
}

export function getAvailableAdminGroups(matches: AdminMatchItem[]) {
  return Array.from(
    new Set(
      matches
        .map((match) => match.group_name)
        .filter((groupName): groupName is string => Boolean(groupName)),
    ),
  ).sort();
}

export function createAdminMatchesUrl(
  status: AdminMatchStatusFilter,
  group: string,
  stage: AdminMatchStageFilter = "all",
) {
  const params = new URLSearchParams();

  if (status !== "all") {
    params.set("status", status);
  }

  if (stage !== "all") {
    params.set("stage", stage);
  }

  if (group !== "all") {
    params.set("group", group);
  }

  const query = params.toString();

  return query ? `/admin?${query}` : "/admin";
}
