import { ClipboardList, Trophy, Users } from "lucide-react";

type AdminTournamentBonusSummaryProps = {
  predictionsCount: number;
  finalized: boolean;
};

export function AdminTournamentBonusSummary({
  predictionsCount,
  finalized,
}: AdminTournamentBonusSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Users className="h-5 w-5" />
        </div>

        <p className="mt-5 font-heading text-4xl">{predictionsCount}</p>

        <p className="mt-1 text-sm text-muted-foreground">
          zapisanych typów turniejowych
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Trophy className="h-5 w-5" />
        </div>

        <p className="mt-5 font-heading text-4xl">
          {finalized ? "TAK" : "NIE"}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          czy bonusy są finalnie rozliczone
        </p>
      </div>

      <div className="rounded-[2rem] bg-foreground p-5 text-background shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-foreground">
          <ClipboardList className="h-5 w-5" />
        </div>

        <p className="mt-5 text-xl font-black">Draft nie liczy punktów</p>

        <p className="mt-1 text-sm text-background/70">
          Punkty wpadają dopiero po kliknięciu finalizacji.
        </p>
      </div>
    </div>
  );
}
