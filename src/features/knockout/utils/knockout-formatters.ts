import {
  KnockoutMatchPreview,
  KnockoutRoundGroup,
} from "../types/knockout.types";

export function formatKnockoutDateTime(kickoffTime: string | null) {
  if (!kickoffTime) {
    return "Termin do potwierdzenia";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  }).format(new Date(kickoffTime));
}

export function groupKnockoutMatchesByRound(
  matches: KnockoutMatchPreview[],
): KnockoutRoundGroup[] {
  const groupedMatches = matches.reduce<Record<string, KnockoutMatchPreview[]>>(
    (acc, match) => {
      if (!acc[match.round_key]) {
        acc[match.round_key] = [];
      }

      acc[match.round_key].push(match);

      return acc;
    },
    {},
  );

  return Object.values(groupedMatches)
    .map((roundMatches) => {
      const firstMatch = roundMatches[0];

      return {
        roundKey: firstMatch.round_key,
        roundLabel: firstMatch.round_label,
        roundOrder: firstMatch.round_order,
        matches: roundMatches.sort((a, b) => a.match_order - b.match_order),
      };
    })
    .sort((a, b) => a.roundOrder - b.roundOrder);
}

export function formatKnockoutMatchCode(matchCode: string) {
  if (matchCode.startsWith("R32_")) {
    return `1/16 finału #${Number(matchCode.replace("R32_", ""))}`;
  }

  if (matchCode.startsWith("R16_")) {
    return `1/8 finału #${Number(matchCode.replace("R16_", ""))}`;
  }

  if (matchCode.startsWith("QF_")) {
    return `Ćwierćfinał #${Number(matchCode.replace("QF_", ""))}`;
  }

  if (matchCode.startsWith("SF_")) {
    return `Półfinał #${Number(matchCode.replace("SF_", ""))}`;
  }

  if (matchCode === "THIRD_PLACE") {
    return "Mecz o 3. miejsce";
  }

  if (matchCode === "FINAL") {
    return "Finał";
  }

  return matchCode;
}
