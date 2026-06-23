import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFlagUrl } from "../../utils/flag-url";

type KnockoutTeamChoiceButtonProps = {
  teamId: string;
  teamName: string;
  teamCode: string;
  flagCode: string | null;
  isSelected: boolean;
  disabled?: boolean;
  onClick: (teamId: string) => void;
};

export function KnockoutTeamChoiceButton({
  teamId,
  teamName,
  teamCode,
  flagCode,
  isSelected,
  disabled = false,
  onClick,
}: KnockoutTeamChoiceButtonProps) {
  const flagUrl = getFlagUrl(flagCode);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(teamId)}
      className={cn(
        "flex items-center justify-between gap-4 rounded-3xl border bg-white p-4 text-left shadow-sm transition",
        "hover:border-primary hover:bg-primary/5",
        isSelected && "border-primary bg-primary/10 ring-2 ring-primary/10",
        disabled &&
          "cursor-not-allowed opacity-60 hover:border-border hover:bg-white",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {flagUrl ? (
          <img
            src={flagUrl}
            alt={teamName}
            className="h-9 w-12 rounded-xl border border-border object-cover shadow-sm"
            loading="lazy"
          />
        ) : (
          <div className="flex h-9 w-12 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">
            --
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate font-heading text-xl leading-none">
            {teamName}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
            {teamCode}
          </p>
        </div>
      </div>

      {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />}
    </button>
  );
}
