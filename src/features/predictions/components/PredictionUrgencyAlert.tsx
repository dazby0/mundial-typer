import { AlarmClock, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchListItem } from "@/src/features/matches/types/match.types";
import { AppLink } from "@/src/components/navigation/AppLink";

type PredictionUrgencyAlertProps = {
  todayMatches: MatchListItem[];
  urgentMatches: MatchListItem[];
};

export function PredictionUrgencyAlert({
  todayMatches,
  urgentMatches,
}: PredictionUrgencyAlertProps) {
  if (todayMatches.length === 0 && urgentMatches.length === 0) {
    return (
      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <AlarmClock className="h-5 w-5" />
          </div>

          <div>
            <p className="font-bold">Na dziś bez pożaru</p>
            <p className="text-sm text-muted-foreground">
              Nie ma pilnych nieobstawionych meczów. Możesz oddychać, ale nie za
              długo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-foreground p-5 text-background shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background text-foreground">
            <Siren className="h-5 w-5" />
          </div>

          <div>
            <p className="font-black">Tryb paniki gotowy do odpalenia</p>

            <p className="mt-1 text-sm text-background/70">
              {todayMatches.length > 0
                ? `Masz dziś ${todayMatches.length} nieobstawione mecze. Brzmi jak deadline, nie jak sugestia.`
                : `Masz ${urgentMatches.length} pilne mecze bez typu. Zegar tyka, reputacja też.`}
            </p>
          </div>
        </div>

        <Button
          asChild
          className="rounded-full bg-background text-foreground hover:bg-background/90"
        >
          <AppLink href="/predictions?mode=panic">Pokaż tryb paniki</AppLink>
        </Button>
      </div>
    </div>
  );
}
