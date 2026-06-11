import { GroupStandingItem } from "@/src/features/groups/types/group-standing.types";

export function groupStandingsByGroup(standings: GroupStandingItem[]) {
  return standings.reduce<Record<string, GroupStandingItem[]>>((acc, team) => {
    if (!acc[team.group_name]) {
      acc[team.group_name] = [];
    }

    acc[team.group_name].push(team);

    return acc;
  }, {});
}

export function getGroupDisplayName(groupName: string) {
  return groupName.replace("Group", "Grupa");
}

export function sortGroupNames(groupNames: string[]) {
  return groupNames.sort((a, b) => {
    const letterA = a.replace("Group ", "");
    const letterB = b.replace("Group ", "");

    return letterA.localeCompare(letterB);
  });
}
