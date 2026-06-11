import { TeamFlag } from "@/src/features/teams/components/TeamFlag";

type TournamentPredictionTeamPillProps = {
  name: string;
  code: string;
  flagCode: string | null;
  flagEmoji: string | null;
};

export function TournamentPredictionTeamPill({
  name,
  code,
  flagCode,
  flagEmoji,
}: TournamentPredictionTeamPillProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2 text-sm">
      <TeamFlag
        name={name}
        flagCode={flagCode}
        flagEmoji={flagEmoji}
        className="h-6 w-6 bg-white"
      />

      <span className="font-bold">{name}</span>

      <span className="text-xs text-muted-foreground">{code}</span>
    </div>
  );
}
