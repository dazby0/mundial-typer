import { redirect } from "next/navigation";
import { ClipboardList, Target, Trophy } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { createClient } from "@/src/lib/supabase/server";
import { PredictionAccordionSection } from "@/src/features/predictions/components/PredictionAccordionSection";
import { PredictionProgressCard } from "@/src/features/predictions/components/PredictionProgressCard";
import { PredictionUrgencyAlert } from "@/src/features/predictions/components/PredictionUrgencyAlert";
import {
  MatchListItem,
  MyMatchPrediction,
} from "@/src/features/matches/types/match.types";
import {
  getPredictionProgress,
  getTodayUnpredictedMatches,
  getUrgentUnpredictedMatches,
} from "@/src/features/predictions/utils/prediction-checklist";
import Link from "next/link";

type PredictionsPageProps = {
  searchParams: Promise<{
    mode?: string;
  }>;
};

export default async function PredictionsPage({
  searchParams,
}: PredictionsPageProps) {
  const { mode } = await searchParams;
  const isPanicMode = mode === "panic";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  const matches = (matchesData || []) as MatchListItem[];
  const predictions = (predictionsData || []) as MyMatchPrediction[];

  const predictionsByMatchId = new Map(
    predictions.map((prediction) => [prediction.match_id, prediction]),
  );

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const matchesToPredict = matches.filter((match) => {
    const matchStarted = new Date(match.kickoff_time).getTime() <= now;
    const hasPrediction = predictionsByMatchId.has(match.id);

    return !matchStarted && !hasPrediction;
  });

  const confirmedPredictions = matches.filter((match) => {
    const matchStarted = new Date(match.kickoff_time).getTime() <= now;
    const hasPrediction = predictionsByMatchId.has(match.id);

    return !matchStarted && hasPrediction;
  });

  const closedMatches = matches.filter((match) => {
    const matchStarted = new Date(match.kickoff_time).getTime() <= now;

    return matchStarted;
  });

  const progress = getPredictionProgress(matches, predictions);
  const todayUnpredictedMatches = getTodayUnpredictedMatches(
    matches,
    predictionsByMatchId,
  );
  const urgentUnpredictedMatches = getUrgentUnpredictedMatches(
    matches,
    predictionsByMatchId,
  );

  const panicMatches =
    urgentUnpredictedMatches.length > 0
      ? urgentUnpredictedMatches
      : todayUnpredictedMatches;

  const displayedMatchesToPredict = isPanicMode
    ? panicMatches
    : matchesToPredict;

  const totalPoints = predictions.reduce(
    (sum, prediction) => sum + (prediction.points ?? 0),
    0,
  );

  return (
    <section className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-4 rounded-full">
              Centrum dowodzenia typerem
            </Badge>

            <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
              Twoje typy
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Tu sprawdzasz, czy wszystko obstawione, gdzie jeszcze trzeba
              kliknąć i w których meczach Twoja wiedza piłkarska będzie
              wystawiona na publiczne pośmiewisko.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:min-w-130">
            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">
                    {progress.predicted}/{progress.total}
                  </p>
                  <p className="text-xs text-muted-foreground">obstawione</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">{progress.missing}</p>
                  <p className="text-xs text-muted-foreground">do kliknięcia</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">{totalPoints}</p>
                  <p className="text-xs text-muted-foreground">punktów</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <PredictionProgressCard
          predicted={progress.predicted}
          total={progress.total}
          missing={progress.missing}
          percentage={progress.percentage}
        />

        <PredictionUrgencyAlert
          todayMatches={todayUnpredictedMatches}
          urgentMatches={urgentUnpredictedMatches}
        />

        {isPanicMode ? (
          <div className="rounded-[2rem] bg-destructive p-5 text-destructive-foreground shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black">Tryb paniki aktywny</p>
                <p className="mt-1 text-sm opacity-80">
                  Pokazujemy tylko mecze, które zaraz startują albo są dzisiaj.
                  Zero filozofii, tylko klikanie.
                </p>
              </div>

              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/predictions">Wyjdź z paniki</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Accordion
        type="multiple"
        defaultValue={["to-predict"]}
        className="mt-6 space-y-5"
      >
        <PredictionAccordionSection
          value="to-predict"
          title={isPanicMode ? "Tryb paniki" : "Do obstawienia"}
          description={
            isPanicMode
              ? "Tu są mecze, które nie lubią czekać. Typuj teraz, tłumacz się później."
              : "Tu są mecze, które jeszcze czekają na Twoją wielką analizę. Albo na strzał z biodra."
          }
          emptyTitle={
            isPanicMode ? "Panika odwołana" : "Czysto. Wszystko obstawione."
          }
          emptyDescription={
            isPanicMode
              ? "Nie ma pilnych meczów bez typu. Możesz wrócić do udawania spokoju."
              : "Nie wiemy, czy to profesjonalizm, czy przypadek, ale wygląda dobrze."
          }
          matches={displayedMatchesToPredict}
          predictionsByMatchId={predictionsByMatchId}
        />

        {!isPanicMode ? (
          <>
            <PredictionAccordionSection
              value="confirmed"
              title="Typy zatwierdzone"
              description="Tutaj leżą Twoje zapisane typy. Na razie brzmią mądrze, bo piłka jeszcze ich nie zweryfikowała."
              emptyTitle="Brak zatwierdzonych typów."
              emptyDescription="Trochę pusto. Bukmacher by zapłakał, ale aplikacja cierpliwie czeka."
              matches={confirmedPredictions}
              predictionsByMatchId={predictionsByMatchId}
            />

            <PredictionAccordionSection
              value="closed"
              title="Zamknięte i rozliczone"
              description="Mecze po pierwszym gwizdku. Tutaj kończy się gadanie, a zaczyna brutalna matematyka punktów."
              emptyTitle="Jeszcze nic nie zamknięte."
              emptyDescription="Spokojnie, kompromitacja przyjdzie z czasem. Mundial jest długi."
              matches={closedMatches}
              predictionsByMatchId={predictionsByMatchId}
            />
          </>
        ) : null}
      </Accordion>
    </section>
  );
}
