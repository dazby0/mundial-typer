import { cn } from "@/lib/utils";
import { TeamDisplay } from "./admin-knockout-ui-helpers";
import { getFlagUrl } from "@/src/features/matches/utils/flag-url";

type AdminKnockoutTeamCardProps = {
  slotLabel: string;
  team: TeamDisplay;
  variant?: "default" | "empty";
};

type AdminKnockoutTeamFlagProps = {
  flagCode: string | null;
  name: string;
};

export function AdminKnockoutTeamFlag({
  flagCode,
  name,
}: AdminKnockoutTeamFlagProps) {
  const flagUrl = getFlagUrl(flagCode);

  if (!flagUrl) {
    return (
      <div className="flex h-9 w-12 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">
        --
      </div>
    );
  }

  return (
    <img
      src={flagUrl}
      alt={name}
      className="h-9 w-12 rounded-xl object-cover"
      loading="lazy"
    />
  );
}

export function AdminKnockoutTeamCard({
  slotLabel,
  team,
  variant = "default",
}: AdminKnockoutTeamCardProps) {
  const teamName = team.name || team.code || "Jeszcze nieustalone";

  return (
    <div
      className={cn(
        "rounded-3xl border bg-white p-4 shadow-sm transition",
        variant === "empty" && "border-dashed bg-muted/40",
      )}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {slotLabel}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <AdminKnockoutTeamFlag flagCode={team.flagCode} name={teamName} />

        <div className="min-w-0">
          <p className="truncate font-heading text-xl leading-none">
            {teamName}
          </p>

          {team.code && (
            <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
              {team.code}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
