import { Lock } from "lucide-react";

export function TournamentPredictionsLockedCommunityCard() {
  return (
    <div className="rounded-[2rem] bg-foreground p-6 text-background shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background text-foreground">
          <Lock className="h-5 w-5" />
        </div>

        <div>
          <p className="text-2xl font-black">
            Typy znajomych są jeszcze zamknięte
          </p>

          <p className="mt-2 max-w-3xl text-sm text-background/70">
            Oficjalnie typy turniejowe powinny już być zamknięte, ale dla tych,
            którzy przespali start, zgubili kalendarz albo po prostu są
            nieogarnięci, admin przedłużył typowanie do końca dnia.
          </p>
        </div>
      </div>
    </div>
  );
}
