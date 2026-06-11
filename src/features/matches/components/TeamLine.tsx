import { TeamFlag } from "../../teams/components/TeamFlag";

type TeamLineProps = {
  name: string;
  code: string;
  flagCode: string | null;
  flagEmoji: string | null;
  score: number | null;
};

export function TeamLine({
  name,
  code,
  flagCode,
  flagEmoji,
  score,
}: TeamLineProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-lg">
          <TeamFlag
            name={name}
            flagCode={flagCode}
            flagEmoji={flagEmoji}
            className="w-9 h-9"
          />
        </span>

        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{code}</p>
        </div>
      </div>

      <span className="font-heading text-2xl">
        {score === null ? "-" : score}
      </span>
    </div>
  );
}
