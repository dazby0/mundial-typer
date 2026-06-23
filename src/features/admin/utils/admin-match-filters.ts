import { AdminMatchItem } from "@/src/features/admin/types/admin-match.types";

export type AdminMatchStatusFilter = "all" | "missing" | "finished";

export function getValidAdminStatusFilter(
  status?: string,
): AdminMatchStatusFilter {
  if (status === "missing" || status === "finished") {
    return status;
  }

  return "all";
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
) {
  const params = new URLSearchParams();

  if (status !== "all") {
    params.set("status", status);
  }

  if (group !== "all") {
    params.set("group", group);
  }

  const query = params.toString();

  return query ? `/admin?${query}` : "/admin";
}
