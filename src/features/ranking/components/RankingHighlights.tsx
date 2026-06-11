import { Crosshair, Flame, ListChecks } from "lucide-react";
import { RankingItem } from "@/src/features/ranking/types/ranking.types";
import { getRankingHighlights } from "@/src/features/ranking/utils/ranking-helpers";

type RankingHighlightsProps = {
  ranking: RankingItem[];
};

export function RankingHighlights({ ranking }: RankingHighlightsProps) {
  if (ranking.length === 0) {
    return null;
  }

  const { mostExact, mostWrong, mostPredictions } =
    getRankingHighlights(ranking);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Crosshair className="h-5 w-5" />
          </div>

          <div>
            <p className="font-bold">Snajper kolejki</p>
            <p className="text-sm text-muted-foreground">Najwięcej idealnych</p>
          </div>
        </div>

        <p className="mt-5 text-2xl font-black">{mostExact?.username || "-"}</p>

        <p className="mt-1 text-sm text-muted-foreground">
          {mostExact?.exact_scores_count || 0} dokładnych wyników. Albo talent,
          albo podejrzane kontakty z przyszłością.
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Flame className="h-5 w-5" />
          </div>

          <div>
            <p className="font-bold">Pudlarz turnieju</p>
            <p className="text-sm text-muted-foreground">Najwięcej zer</p>
          </div>
        </div>

        <p className="mt-5 text-2xl font-black">{mostWrong?.username || "-"}</p>

        <p className="mt-1 text-sm text-muted-foreground">
          {mostWrong?.wrong_predictions_count || 0} pudeł. Piłka nożna bywa
          bezlitosna, ale aż tak?
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ListChecks className="h-5 w-5" />
          </div>

          <div>
            <p className="font-bold">Najbardziej aktywny</p>
            <p className="text-sm text-muted-foreground">Najwięcej typów</p>
          </div>
        </div>

        <p className="mt-5 text-2xl font-black">
          {mostPredictions?.username || "-"}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {mostPredictions?.predictions_count || 0} zapisanych typów. Ilość
          jest, teraz tylko przekonać jakość.
        </p>
      </div>
    </div>
  );
}
