import { KnockoutMatchPreview } from "../types/knockout.types";
import { KnockoutBracketNode } from "./KnockoutBracketNode";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 172;
const COLUMN_GAP = 72;
const ROW_GAP = 176;
const BOARD_PADDING_X = 24;
const BOARD_TOP = 48;

const ROUND_LABELS = [
  {
    key: "round_of_32",
    label: "1/16 finału",
  },
  {
    key: "round_of_16",
    label: "1/8 finału",
  },
  {
    key: "quarter_final",
    label: "Ćwierćfinały",
  },
  {
    key: "semi_final",
    label: "Półfinały",
  },
  {
    key: "final",
    label: "Finał",
  },
] as const;

export const KNOCKOUT_BRACKET_BOARD_WIDTH =
  BOARD_PADDING_X * 2 +
  ROUND_LABELS.length * CARD_WIDTH +
  (ROUND_LABELS.length - 1) * COLUMN_GAP;

const ROUND_COLUMNS = {
  round_of_32: 0,
  round_of_16: 1,
  quarter_final: 2,
  semi_final: 3,
  final: 4,
} as const;

const BRACKET_STRUCTURE = {
  roundOf32: [
    "R32_03",
    "R32_06",
    "R32_01",
    "R32_04",
    "R32_12",
    "R32_11",
    "R32_10",
    "R32_09",
    "R32_02",
    "R32_05",
    "R32_07",
    "R32_08",
    "R32_15",
    "R32_14",
    "R32_13",
    "R32_16",
  ],
  roundOf16: [
    "R16_02",
    "R16_01",
    "R16_05",
    "R16_06",
    "R16_03",
    "R16_04",
    "R16_07",
    "R16_08",
  ],
  quarterFinals: ["QF_01", "QF_02", "QF_03", "QF_04"],
  semiFinals: ["SF_01", "SF_02"],
  final: ["FINAL"],
};

const CONNECTIONS = [
  ["R32_03", "R16_02"],
  ["R32_06", "R16_02"],
  ["R32_01", "R16_01"],
  ["R32_04", "R16_01"],
  ["R32_12", "R16_05"],
  ["R32_11", "R16_05"],
  ["R32_10", "R16_06"],
  ["R32_09", "R16_06"],
  ["R32_02", "R16_03"],
  ["R32_05", "R16_03"],
  ["R32_07", "R16_04"],
  ["R32_08", "R16_04"],
  ["R32_15", "R16_07"],
  ["R32_14", "R16_07"],
  ["R32_13", "R16_08"],
  ["R32_16", "R16_08"],

  ["R16_02", "QF_01"],
  ["R16_01", "QF_01"],
  ["R16_05", "QF_02"],
  ["R16_06", "QF_02"],
  ["R16_03", "QF_03"],
  ["R16_04", "QF_03"],
  ["R16_07", "QF_04"],
  ["R16_08", "QF_04"],

  ["QF_01", "SF_01"],
  ["QF_02", "SF_01"],
  ["QF_03", "SF_02"],
  ["QF_04", "SF_02"],

  ["SF_01", "FINAL"],
  ["SF_02", "FINAL"],
] as const;

type NodePosition = {
  x: number;
  y: number;
};

type PositionedMatch = {
  match: KnockoutMatchPreview;
  position: NodePosition;
};

type KnockoutBracketBoardProps = {
  matches: KnockoutMatchPreview[];
};

function getColumnX(column: number) {
  return BOARD_PADDING_X + column * (CARD_WIDTH + COLUMN_GAP);
}

function getNodeCenterY(position: NodePosition) {
  return position.y + CARD_HEIGHT / 2;
}

function getMatchPositionByCode(
  positions: Record<string, NodePosition>,
  matchCode: string,
) {
  return positions[matchCode];
}

function createBracketPositions(
  matchesByCode: Map<string, KnockoutMatchPreview>,
) {
  const positions: Record<string, NodePosition> = {};

  BRACKET_STRUCTURE.roundOf32.forEach((matchCode, index) => {
    if (!matchesByCode.has(matchCode)) {
      return;
    }

    positions[matchCode] = {
      x: getColumnX(ROUND_COLUMNS.round_of_32),
      y: BOARD_TOP + index * ROW_GAP,
    };
  });

  BRACKET_STRUCTURE.roundOf16.forEach((matchCode, index) => {
    const firstChild = BRACKET_STRUCTURE.roundOf32[index * 2];
    const secondChild = BRACKET_STRUCTURE.roundOf32[index * 2 + 1];
    const firstPosition = positions[firstChild];
    const secondPosition = positions[secondChild];

    if (!matchesByCode.has(matchCode) || !firstPosition || !secondPosition) {
      return;
    }

    const centerY =
      (getNodeCenterY(firstPosition) + getNodeCenterY(secondPosition)) / 2;

    positions[matchCode] = {
      x: getColumnX(ROUND_COLUMNS.round_of_16),
      y: centerY - CARD_HEIGHT / 2,
    };
  });

  BRACKET_STRUCTURE.quarterFinals.forEach((matchCode, index) => {
    const firstChild = BRACKET_STRUCTURE.roundOf16[index * 2];
    const secondChild = BRACKET_STRUCTURE.roundOf16[index * 2 + 1];
    const firstPosition = positions[firstChild];
    const secondPosition = positions[secondChild];

    if (!matchesByCode.has(matchCode) || !firstPosition || !secondPosition) {
      return;
    }

    const centerY =
      (getNodeCenterY(firstPosition) + getNodeCenterY(secondPosition)) / 2;

    positions[matchCode] = {
      x: getColumnX(ROUND_COLUMNS.quarter_final),
      y: centerY - CARD_HEIGHT / 2,
    };
  });

  BRACKET_STRUCTURE.semiFinals.forEach((matchCode, index) => {
    const firstChild = BRACKET_STRUCTURE.quarterFinals[index * 2];
    const secondChild = BRACKET_STRUCTURE.quarterFinals[index * 2 + 1];
    const firstPosition = positions[firstChild];
    const secondPosition = positions[secondChild];

    if (!matchesByCode.has(matchCode) || !firstPosition || !secondPosition) {
      return;
    }

    const centerY =
      (getNodeCenterY(firstPosition) + getNodeCenterY(secondPosition)) / 2;

    positions[matchCode] = {
      x: getColumnX(ROUND_COLUMNS.semi_final),
      y: centerY - CARD_HEIGHT / 2,
    };
  });

  const finalMatchCode = BRACKET_STRUCTURE.final[0];
  const firstSemiFinal = positions.SF_01;
  const secondSemiFinal = positions.SF_02;

  if (matchesByCode.has(finalMatchCode) && firstSemiFinal && secondSemiFinal) {
    const centerY =
      (getNodeCenterY(firstSemiFinal) + getNodeCenterY(secondSemiFinal)) / 2;

    positions[finalMatchCode] = {
      x: getColumnX(ROUND_COLUMNS.final),
      y: centerY - CARD_HEIGHT / 2,
    };
  }

  if (matchesByCode.has("THIRD_PLACE") && positions.FINAL) {
    positions.THIRD_PLACE = {
      x: getColumnX(ROUND_COLUMNS.final),
      y: positions.FINAL.y + CARD_HEIGHT + 56,
    };
  }

  return positions;
}

function getBoardSize(positions: Record<string, NodePosition>) {
  const positionedNodes = Object.values(positions);

  const maxY = Math.max(
    ...positionedNodes.map((position) => position.y + CARD_HEIGHT),
  );

  return {
    width:
      BOARD_PADDING_X * 2 +
      ROUND_LABELS.length * CARD_WIDTH +
      (ROUND_LABELS.length - 1) * COLUMN_GAP,
    height: maxY + 48,
  };
}

function getPositionedMatches(
  matchesByCode: Map<string, KnockoutMatchPreview>,
  positions: Record<string, NodePosition>,
): PositionedMatch[] {
  return Object.entries(positions)
    .map(([matchCode, position]) => {
      const match = matchesByCode.get(matchCode);

      if (!match) {
        return null;
      }

      return {
        match,
        position,
      };
    })
    .filter(Boolean) as PositionedMatch[];
}

export function KnockoutBracketBoard({ matches }: KnockoutBracketBoardProps) {
  const matchesByCode = new Map(
    matches.map((match) => [match.match_code, match]),
  );

  const positions = createBracketPositions(matchesByCode);
  const positionedMatches = getPositionedMatches(matchesByCode, positions);
  const boardSize = getBoardSize(positions);

  return (
    <div
      className="relative"
      style={{
        width: boardSize.width,
        height: boardSize.height,
      }}
    >
      {ROUND_LABELS.map((round) => (
        <div
          key={round.key}
          className="absolute top-0"
          style={{
            left: getColumnX(ROUND_COLUMNS[round.key]),
            width: CARD_WIDTH,
          }}
        >
          <div className="rounded-full bg-foreground px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-background">
            {round.label}
          </div>
        </div>
      ))}

      <svg
        className="pointer-events-none absolute inset-0 z-10"
        width={boardSize.width}
        height={boardSize.height}
      >
        {CONNECTIONS.map(([fromCode, toCode]) => {
          const fromPosition = getMatchPositionByCode(positions, fromCode);
          const toPosition = getMatchPositionByCode(positions, toCode);

          if (!fromPosition || !toPosition) {
            return null;
          }

          const fromX = fromPosition.x + CARD_WIDTH;
          const fromY = fromPosition.y + CARD_HEIGHT / 2;
          const toX = toPosition.x;
          const toY = toPosition.y + CARD_HEIGHT / 2;
          const middleX = fromX + (toX - fromX) / 2;

          return (
            <g key={`${fromCode}-${toCode}`}>
              <line
                x1={fromX}
                y1={fromY}
                x2={middleX}
                y2={fromY}
                stroke="var(--primary)"
                strokeOpacity="0.35"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <line
                x1={middleX}
                y1={fromY}
                x2={middleX}
                y2={toY}
                stroke="var(--primary)"
                strokeOpacity="0.35"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <line
                x1={middleX}
                y1={toY}
                x2={toX}
                y2={toY}
                stroke="var(--primary)"
                strokeOpacity="0.35"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <circle
                cx={fromX}
                cy={fromY}
                r="4"
                fill="var(--foreground)"
                opacity="0.32"
              />

              <circle
                cx={toX}
                cy={toY}
                r="4"
                fill="var(--foreground)"
                opacity="0.32"
              />
            </g>
          );
        })}
      </svg>

      <div className="relative z-20">
        {positionedMatches.map(({ match, position }) => (
          <div
            key={match.id}
            data-bracket-node="true"
            className="absolute cursor-default"
            style={{
              left: position.x,
              top: position.y,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }}
          >
            <KnockoutBracketNode match={match} />
          </div>
        ))}
      </div>
    </div>
  );
}
