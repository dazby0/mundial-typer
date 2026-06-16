import { KnockoutRoundGroup } from "../types/knockout.types";
import { KnockoutMatchCard } from "./KnockoutMatchCard";

type KnockoutRoundColumnProps = {
  round: KnockoutRoundGroup;
};

export function KnockoutRoundColumn({ round }: KnockoutRoundColumnProps) {
  return (
    <section className="min-w-76 lg:min-w-0">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />

        <h2 className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold uppercase text-background">
          {round.roundLabel}
        </h2>

        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-4">
        {round.matches.map((match) => (
          <KnockoutMatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}
