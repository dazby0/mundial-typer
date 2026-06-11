import { GroupMatchItem } from "@/src/features/groups/types/group-match.types";

export function groupMatchesByGroup(matches: GroupMatchItem[]) {
  return matches.reduce<Record<string, GroupMatchItem[]>>((acc, match) => {
    if (!acc[match.group_name]) {
      acc[match.group_name] = [];
    }

    acc[match.group_name].push(match);

    return acc;
  }, {});
}

export function getFinishedGroupMatches(matches: GroupMatchItem[]) {
  return matches.filter((match) => match.status === "finished");
}

export function getUpcomingGroupMatches(matches: GroupMatchItem[]) {
  const now = Date.now();

  return matches.filter((match) => {
    const kickoffTime = new Date(match.kickoff_time).getTime();

    return kickoffTime > now && match.status !== "finished";
  });
}
