import { Info, Trophy } from "lucide-react";

export function KnockoutPredictionRulesCard() {
  return (
    <div className="rounded-3xl bg-foreground p-5 text-background">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background/10">
          <Trophy className="h-5 w-5" />
        </div>

        <div>
          <p className="font-heading text-xl">Punktacja fazy pucharowej</p>

          <div className="mt-3 grid gap-2 text-sm text-background/75 sm:grid-cols-2">
            <div className="rounded-2xl bg-background/10 px-4 py-3">
              <span className="font-semibold text-background">1 pkt</span> —
              trafiona drużyna awansująca
            </div>

            <div className="rounded-2xl bg-background/10 px-4 py-3">
              <span className="font-semibold text-background">2 pkt</span> —
              drużyna + sposób awansu
            </div>

            <div className="rounded-2xl bg-background/10 px-4 py-3 sm:col-span-2">
              <span className="font-semibold text-background">4 pkt</span> —
              drużyna + sposób awansu + dokładny wynik
            </div>
          </div>

          <div className="mt-4 flex gap-2 rounded-2xl bg-background/10 px-4 py-3 text-sm text-background/75">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Przy opcji „W meczu” wynik nie może być remisowy. Przy opcji „Po
              karnych” wpisujesz wynik po 120 minutach — musi być remisowy.
              Wyniku serii karnych nie typujesz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
