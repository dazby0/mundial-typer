import { redirect } from "next/navigation";
import { Beer, ClipboardList, Trophy, XCircle } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/server";
import { ResultMatchCard } from "@/src/features/results/components/ResultMatchCard";
import { ResultMatchItem } from "@/src/features/results/types/result.types";
import { ResultsHighlights } from "@/src/features/results/components/ResultsHighlights";
import { AppLink } from "@/src/components/navigation/AppLink";

export default async function ResultsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("match_results_summary_view")
    .select("*")
    .order("match_number", { ascending: true });

  if (error) {
    throw new Error("Could not load results.");
  }

  const results = (data || []) as ResultMatchItem[];

  const totalPredictions = results.reduce(
    (sum, match) => sum + match.predictions_count,
    0,
  );

  const totalExactScores = results.reduce(
    (sum, match) => sum + match.exact_scores_count,
    0,
  );

  const totalWrongPredictions = results.reduce(
    (sum, match) => sum + match.wrong_predictions_count,
    0,
  );

  const totalPointsAwarded = results.reduce(
    (sum, match) => sum + match.total_points_awarded,
    0,
  );

  return (
    <section className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 rounded-full">Wyniki i rozliczenia</Badge>

            <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
              Tablica prawdy
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Tutaj nie ma już typowania. Tutaj są paragony za piłkarskie
              decyzje, zimna matematyka i brutalne zderzenie z rzeczywistością.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-130">
            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">{results.length}</p>
                  <p className="text-xs text-muted-foreground">
                    rozliczone mecze
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">{totalExactScores}</p>
                  <p className="text-xs text-muted-foreground">
                    idealne strzały
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                  <XCircle className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">
                    {totalWrongPredictions}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    piłkarskie wtopy
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Beer className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">{totalPointsAwarded}</p>
                  <p className="text-xs text-muted-foreground">
                    punktów rozdanych
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="mt-6 rounded-3xl bg-foreground p-5 text-background">
            <p className="text-sm uppercase tracking-[0.2em] text-background/60">
              Bilans rozliczeń
            </p>

            <p className="mt-1 text-xl font-black">
              {totalPredictions} typów już przeszło przez maszynkę punktową.
            </p>

            <p className="mt-2 text-sm text-background/70">
              Jedni trafili, inni udawali, że to był eksperyment statystyczny.
              System zapamiętał wszystko.
            </p>
          </div>
        ) : null}
      </div>

      {results.length > 0 ? (
        <div className="mt-6">
          <ResultsHighlights results={results} />
        </div>
      ) : null}

      {results.length === 0 ? (
        <div className="mt-6 rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-background text-4xl">
            💤
          </div>

          <h2 className="mt-6 text-3xl font-black">
            Jeszcze nie ma czego rozliczać
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Mundial jeszcze śpi, admin nie wpisał wyników, a typerzy nadal mogą
            chodzić po świecie z przekonaniem, że znają się na piłce.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full">
              <AppLink href="/matches">Idź do terminarza</AppLink>
            </Button>

            <Button asChild variant="outline" className="rounded-full bg-white">
              <AppLink href="/ranking">Sprawdź ranking zer</AppLink>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
          {results.map((match) => (
            <ResultMatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}
