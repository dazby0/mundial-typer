import Link from "next/link";
import { Brain, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultMatchItem } from "@/src/features/results/types/result.types";
import {
  formatResultMatchName,
  getResultsHighlights,
} from "@/src/features/results/utils/results-highlights";

type ResultsHighlightsProps = {
  results: ResultMatchItem[];
};

type HighlightCardProps = {
  title: string;
  label: string;
  description: string;
  value: string;
  icon: React.ElementType;
  match: ResultMatchItem | null;
};

function HighlightCard({
  title,
  label,
  description,
  value,
  icon: Icon,
  match,
}: HighlightCardProps) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
          {label}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>

        <h2 className="mt-2 text-2xl font-black">
          {match ? formatResultMatchName(match) : "Brak danych"}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <p className="mt-4 font-heading text-4xl">{value}</p>
      </div>

      {match ? (
        <Button
          asChild
          variant="outline"
          className="mt-5 w-full rounded-full bg-white"
        >
          <Link href={`/matches/${match.id}`}>Zobacz mecz</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function ResultsHighlights({ results }: ResultsHighlightsProps) {
  const { expertMatch, shameMatch, pointsMineMatch } =
    getResultsHighlights(results);

  if (!expertMatch && !shameMatch && !pointsMineMatch) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <HighlightCard
        title="Mecz ekspertów"
        label="najwięcej 3-punktowców"
        description={
          expertMatch && expertMatch.exact_scores_count > 0
            ? "Tutaj grupa wyglądała jak sztab analityków. Albo jakby ktoś miał przeciek z przyszłości."
            : "Jeszcze nikt nie trafił idealnie. Futbol dalej trzyma wszystkich za twarz."
        }
        value={`${expertMatch?.exact_scores_count ?? 0} idealnych`}
        icon={Brain}
        match={expertMatch}
      />

      <HighlightCard
        title="Mecz kompromitacji"
        label="najwięcej pudeł"
        description={
          shameMatch && shameMatch.wrong_predictions_count > 0
            ? "Tu piłka nożna zrobiła grupie kontrolę trzeźwości. Wynik bolał bardziej niż poniedziałek."
            : "Na razie bez dużej kompromitacji. Podejrzane, ale poczekajmy."
        }
        value={`${shameMatch?.wrong_predictions_count ?? 0} pudeł`}
        icon={Flame}
        match={shameMatch}
      />

      <HighlightCard
        title="Punktowa kopalnia"
        label="najwięcej rozdanych punktów"
        description={
          pointsMineMatch && pointsMineMatch.total_points_awarded > 0
            ? "Ten mecz hojnie sypnął punktami. Piwny budżet organizatora zaczyna płakać."
            : "Jeszcze nikt tu nie zarobił konkretów. Punktowa susza trwa."
        }
        value={`${pointsMineMatch?.total_points_awarded ?? 0} pkt`}
        icon={Trophy}
        match={pointsMineMatch}
      />
    </div>
  );
}
