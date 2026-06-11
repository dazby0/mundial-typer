import {
  MatchListItem,
  MyMatchPrediction,
} from "@/src/features/matches/types/match.types";

export type MatchFilter = "all" | "missing" | "confirmed";

export function getValidMatchFilter(filter?: string): MatchFilter {
  if (filter === "missing" || filter === "confirmed") {
    return filter;
  }

  return "all";
}

export function getValidGroupFilter(group?: string) {
  if (!group || group === "all") {
    return "all";
  }

  return group;
}

export function getValidSearchFilter(search?: string) {
  if (!search) {
    return "";
  }

  return search.trim();
}

export function filterMatchesByPredictionStatus(
  matches: MatchListItem[],
  predictionsByMatchId: Map<string, MyMatchPrediction>,
  filter: MatchFilter,
) {
  const now = Date.now();

  if (filter === "missing") {
    return matches.filter((match) => {
      const matchStarted = new Date(match.kickoff_time).getTime() <= now;

      return !matchStarted && !predictionsByMatchId.has(match.id);
    });
  }

  if (filter === "confirmed") {
    return matches.filter((match) => predictionsByMatchId.has(match.id));
  }

  return matches;
}

export function filterMatchesByGroup(
  matches: MatchListItem[],
  groupFilter: string,
) {
  if (groupFilter === "all") {
    return matches;
  }

  return matches.filter((match) => match.group_name === groupFilter);
}

export function filterMatchesBySearch(
  matches: MatchListItem[],
  search: string,
) {
  if (!search) {
    return matches;
  }

  const normalizedSearch = search.toLowerCase();

  return matches.filter((match) => {
    const searchableText = [
      match.home_team_name_pl,
      match.home_team_name_en,
      match.home_team_code,
      match.away_team_name_pl,
      match.away_team_name_en,
      match.away_team_code,
      match.venue_city_pl,
      match.group_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
}

export function getAvailableGroups(matches: MatchListItem[]) {
  return Array.from(new Set(matches.map((match) => match.group_name))).sort(
    (a, b) => {
      const letterA = a.replace("Group ", "");
      const letterB = b.replace("Group ", "");

      return letterA.localeCompare(letterB);
    },
  );
}

export function createMatchesUrl(
  filter: MatchFilter,
  group: string,
  search = "",
) {
  const params = new URLSearchParams();

  if (filter !== "all") {
    params.set("filter", filter);
  }

  if (group !== "all") {
    params.set("group", group);
  }

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();

  return query ? `/matches?${query}` : "/matches";
}

export function getTodayDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getMatchDateKey(match: MatchListItem) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(match.kickoff_time));
}

export function isMatchToday(match: MatchListItem) {
  return getMatchDateKey(match) === getTodayDateKey();
}

export function getHoursToKickoff(match: MatchListItem) {
  const now = Date.now();
  const kickoffTime = new Date(match.kickoff_time).getTime();

  return Math.ceil((kickoffTime - now) / 1000 / 60 / 60);
}

export function isLastCallMatch(match: MatchListItem) {
  const hoursToKickoff = getHoursToKickoff(match);

  return hoursToKickoff > 0 && hoursToKickoff <= 6;
}

export function isStartingSoon(match: MatchListItem) {
  const hoursToKickoff = getHoursToKickoff(match);

  return hoursToKickoff > 0 && hoursToKickoff <= 24;
}

export function getTargetDateKey(dates: string[]) {
  const today = getTodayDateKey();

  if (dates.includes(today)) {
    return today;
  }

  const nextDate = dates.find((date) => date > today);

  return nextDate || dates[0] || null;
}
