import { CalendarClock, GitBranch, Lock, MoveHorizontal } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";

type KnockoutHeaderCardProps = {
  matchesCount: number;
};

export function KnockoutHeaderCard({ matchesCount }: KnockoutHeaderCardProps) {
  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="mb-4 rounded-full">
            Faza pucharowa • podgląd drabinki
          </Badge>

          <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
            Drabinka turniejowa
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Na razie pokazujemy układ fazy pucharowej z placeholderami miejsc w
            grupach. Typowanie odblokujemy po zakończeniu fazy grupowej, kiedy
            kurz opadnie i skończą się kalkulatory.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-3xl bg-background px-5 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GitBranch className="h-5 w-5" />
          </div>

          <div>
            <p className="font-heading text-2xl">{matchesCount}</p>
            <p className="text-xs text-muted-foreground">mecze w drabince</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-background p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold">Typowanie jeszcze zablokowane</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Przyciski są już na miejscu, ale na razie tylko udają, że coś
                można kliknąć. Pełna zabawa ruszy po fazie grupowej.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-background p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold">Sloty zostaną uzupełnione później</p>
              <p className="mt-1 text-sm text-muted-foreground">
                A1, B2 i reszta tej tajemnej algebry zamienią się w konkretne
                drużyny po zakończeniu wszystkich grup.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-3xl bg-background p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MoveHorizontal className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold">
              Drabinka jest szeroka jak ambicje przed pierwszym meczem
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Przesuń poziomo, żeby zobaczyć całą drogę do finału. Na telefonie
              złap planszę palcem i jedź w bok.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
