import { Beer, Crown, Crosshair, Goal, Trophy, Users } from "lucide-react";

const rules = [
  {
    title: "Mistrz świata",
    points: "20 pkt",
    description: "Trafiasz zwycięzcę całego Mundialu.",
    icon: Crown,
  },
  {
    title: "Finaliści",
    points: "8 pkt / drużyna",
    description: "Każdy poprawny finalista daje punkty.",
    icon: Trophy,
  },
  {
    title: "Bonus za obu finalistów",
    points: "+4 pkt",
    description: "Jeżeli trafisz komplet finalistów.",
    icon: Users,
  },
  {
    title: "TOP 4",
    points: "5 pkt / drużyna",
    description: "Każdy poprawny półfinalista daje punkty.",
    icon: Goal,
  },
  {
    title: "Król strzelców",
    points: "15 pkt",
    description: "Wpisujesz zawodnika tekstowo.",
    icon: Crosshair,
  },
  {
    title: "Najwięcej goli drużynowo",
    points: "10 pkt",
    description: "Reprezentacja z największą liczbą bramek.",
    icon: Beer,
  },
];

export function TournamentBonusRulesCard() {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Punktacja
      </p>

      <h2 className="mt-1 text-3xl font-black">Ile można ugrać?</h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Bonusy turniejowe mogą mocno namieszać w rankingu. Jeden dobry prorok
        potrafi przeskoczyć pół tabeli.
      </p>

      <div className="mt-5 space-y-3">
        {rules.map((rule) => {
          const Icon = rule.icon;

          return (
            <div
              key={rule.title}
              className="flex items-start gap-3 rounded-2xl bg-background p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{rule.title}</p>
                  <p className="shrink-0 font-heading text-lg">{rule.points}</p>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {rule.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
