import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Beer,
  CalendarDays,
  ClipboardList,
  Target,
  Trophy,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/server";
import {
  MatchListItem,
  MyMatchPrediction,
} from "@/src/features/matches/types/match.types";
import { RankingItem } from "@/src/features/ranking/types/ranking.types";
import { DashboardStatCard } from "@/src/features/dashboard/components/DashboardStatCard";
import { UpcomingMatchCard } from "@/src/features/dashboard/components/UpcomingMatchCard";
import {
  getMissingPredictionsCount,
  getNextMissingPredictionMatch,
  getPredictedMatchesCount,
  getPredictionProgressPercentage,
  getRecentlySettledPredictions,
  getTodayMissingPredictionMatches,
  getTotalPoints,
  getUpcomingMatches,
} from "@/src/features/dashboard/utils/dashboard-data";
import { NextMissingPredictionCard } from "@/src/features/dashboard/components/NextMissingPredictionCard";
import { DashboardPredictionProgress } from "@/src/features/dashboard/components/DashboardPredictionProgress";
import { RecentSettledPredictions } from "@/src/features/dashboard/components/RecentSettledPredictions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: matchesData, error: matchesError } = await supabase
    .from("matches_view")
    .select("*")
    .order("match_number", { ascending: true });

  if (matchesError) {
    throw new Error("Could not load matches.");
  }

  const { data: predictionsData, error: predictionsError } = await supabase
    .from("predictions")
    .select("id, match_id, predicted_home_score, predicted_away_score, points")
    .eq("user_id", user.id);

  if (predictionsError) {
    throw new Error("Could not load predictions.");
  }

  const { data: rankingData } = await supabase
    .from("ranking_view")
    .select("*")
    .order("total_points", { ascending: false })
    .order("exact_scores_count", { ascending: false })
    .order("correct_results_count", { ascending: false })
    .order("username", { ascending: true })
    .limit(3);

  const matches = (matchesData || []) as MatchListItem[];
  const predictions = (predictionsData || []) as MyMatchPrediction[];
  const ranking = (rankingData || []) as RankingItem[];

  const predictionsByMatchId = new Map(
    predictions.map((prediction) => [prediction.match_id, prediction]),
  );

  const upcomingMatches = getUpcomingMatches(matches, 4);
  const predictedCount = getPredictedMatchesCount(predictions);
  const missingCount = getMissingPredictionsCount(
    matches,
    predictionsByMatchId,
  );
  const totalPoints = getTotalPoints(predictions);
  const nextMissingMatch = getNextMissingPredictionMatch(
    matches,
    predictionsByMatchId,
  );

  const todayMissingMatches = getTodayMissingPredictionMatches(
    matches,
    predictionsByMatchId,
  );

  const progressPercentage = getPredictionProgressPercentage(
    matches,
    predictions,
  );
  const recentlySettledPredictions = getRecentlySettledPredictions(predictions);

  return (
    <section className="mx-auto max-w-7xl">
      <div className="overflow-hidden rounded-[2rem] bg-foreground p-8 text-background shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 rounded-full bg-background text-foreground hover:bg-background">
              Mundial Typer 2026
            </Badge>

            <h1 className="max-w-3xl text-4xl font-black uppercase tracking-tight md:text-6xl">
              Siema {profile?.username || "typerze"}, czas udawać eksperta.
            </h1>

            <p className="mt-4 max-w-2xl text-background/70">
              Tu masz szybki podgląd: ile już obstawiłeś, ile jeszcze zostało i
              czy Twoja droga po piwną chwałę w ogóle istnieje.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="rounded-full bg-background text-foreground hover:bg-background/90"
          >
            <Link href="/predictions">Sprawdź braki w typach</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <DashboardPredictionProgress
          predicted={predictedCount}
          total={matches.length}
          percentage={progressPercentage}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <NextMissingPredictionCard
          match={nextMissingMatch}
          todayMissingCount={todayMissingMatches.length}
        />

        <div className="grid gap-4 grid-cols-2">
          <DashboardStatCard
            title="Obstawione"
            value={`${predictedCount}/${matches.length}`}
            description="Tyle meczów ma już zapisany typ. Reszta udaje, że jej nie widzisz."
            icon={ClipboardList}
          />

          <DashboardStatCard
            title="Do kliknięcia"
            value={missingCount}
            description="Tyle meczów nadal czeka na Twoją genialną analizę."
            icon={Target}
          />

          <DashboardStatCard
            title="Punkty"
            value={totalPoints}
            description="Na razie matematyka. Później powód do chwalenia się albo ciszy."
            icon={Trophy}
          />

          <DashboardStatCard
            title="Piwa"
            value={totalPoints}
            description="Przelicznik jest prosty: 1 punkt = 1 butelka. Piękna ekonomia."
            icon={Beer}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black">Najbliższe mecze</h2>

              <p className="mt-1 text-muted-foreground">
                Czyli najbliższe okazje, żeby zdobyć punkty albo zrobić z siebie
                debila.
              </p>
            </div>

            <Button asChild variant="outline" className="rounded-full bg-white">
              <Link href="/matches">Cały terminarz</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <UpcomingMatchCard
                key={match.id}
                match={match}
                prediction={predictionsByMatchId.get(match.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black">Topka ligi</h2>

              <p className="mt-1 text-muted-foreground">
                Aktualna śmietanka piwnej tabeli.
              </p>
            </div>

            <Button asChild variant="outline" className="rounded-full bg-white">
              <Link href="/ranking">Ranking</Link>
            </Button>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            {ranking.length === 0 ? (
              <div className="rounded-3xl bg-background p-5">
                <p className="font-bold">Ranking jeszcze śpi.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nikt nie ma punktów, więc wszyscy mogą jeszcze udawać, że będą
                  dobrzy.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ranking.map((item, index) => (
                  <div
                    key={item.profile_id}
                    className="flex items-center justify-between rounded-2xl bg-background px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-heading">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold">{item.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.predictions_count} typów
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-heading text-2xl">
                        {item.total_points}
                      </p>
                      <p className="text-xs text-muted-foreground">pkt / piw</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold">Przypominajka</p>
                <p className="text-sm text-muted-foreground">
                  Typy można edytować tylko do pierwszego gwizdka. Potem zostaje
                  honor albo screeny z wymówkami.
                </p>
              </div>
            </div>
            <RecentSettledPredictions
              predictions={recentlySettledPredictions}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
