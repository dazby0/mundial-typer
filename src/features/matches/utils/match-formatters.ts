import { MatchListItem } from "../types/match.types";

const APP_TIME_ZONE = "Europe/Warsaw";

export function formatMatchDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(date));
}

export function formatMatchTime(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(date));
}

export function formatGroupName(groupName: string) {
  return groupName.replace("Group", "Grupa");
}

export function groupMatchesByDate<T extends { kickoff_time: string }>(
  matches: T[],
) {
  return matches.reduce<Record<string, T[]>>((acc, match) => {
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: APP_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(match.kickoff_time));

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(match);

    return acc;
  }, {});
}

export function getMatchStatusLabel(status: MatchListItem["status"]) {
  if (status === "finished") {
    return "Zakończony";
  }

  if (status === "live") {
    return "Na żywo";
  }

  return "Do typowania";
}

export function getMatchResult(match: MatchListItem) {
  if (match.home_score === null || match.away_score === null) {
    return null;
  }

  return `${match.home_score}:${match.away_score}`;
}
