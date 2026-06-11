import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/server";
import {
  MatchListItem,
  MatchPrediction,
} from "@/src/features/matches/types/match.types";
import {
  formatGroupName,
  formatMatchDate,
  formatMatchTime,
  getMatchStatusLabel,
} from "@/src/features/matches/utils/match-formatters";
import { PredictionsList } from "@/src/features/predictions/components/PredictionsList";
import { PredictionForm } from "@/src/features/predictions/components/PredicitionForm";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { MatchPredictionStats } from "@/src/features/predictions/components/MatchPredictionStats";

type MatchDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MatchDetailsPage({
  params,
}: MatchDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: matchData, error: matchError } = await supabase
    .from("matches_view")
    .select("*")
    .eq("id", id)
    .single();

  if (matchError || !matchData) {
    notFound();
  }

  const match = matchData as MatchListItem;
  // eslint-disable-next-line react-hooks/purity
  const matchStarted = new Date(match.kickoff_time).getTime() <= Date.now();
  const isClosed = matchStarted || match.status !== "scheduled";

  let predictionsQuery = supabase
    .from("predictions")
    .select(
      `
      id,
      user_id,
      match_id,
      predicted_home_score,
      predicted_away_score,
      points,
      created_at,
      updated_at,
      profiles (
        username
      )
    `,
    )
    .eq("match_id", id)
    .order("created_at", { ascending: true });

  if (!matchStarted) {
    predictionsQuery = predictionsQuery.eq("user_id", user.id);
  }

  const { data: predictionsData } = await predictionsQuery;
  const predictions = (predictionsData || []) as unknown as MatchPrediction[];

  const myPrediction =
    predictions.find((prediction) => prediction.user_id === user.id) || null;

  return (
    <section className="mx-auto max-w-6xl">
      <Button asChild variant="ghost" className="mb-5 rounded-full">
        <Link href="/matches">
          <ArrowLeft className="h-4 w-4" />
          Wróć do meczów
        </Link>
      </Button>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge className="mb-4 rounded-full">
                    {formatGroupName(match.group_name)} • Mecz #
                    {match.match_number}
                  </Badge>

                  <CardTitle className="text-4xl font-black uppercase tracking-tight md:text-5xl">
                    {match.home_team_name_pl} vs {match.away_team_name_pl}
                  </CardTitle>

                  <p className="mt-3 text-muted-foreground">
                    {formatMatchDate(match.kickoff_time)}, godz.{" "}
                    {formatMatchTime(match.kickoff_time)}
                  </p>
                </div>

                <Badge variant="secondary" className="rounded-full">
                  {getMatchStatusLabel(match.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="rounded-[2rem] bg-foreground p-6 text-background">
                <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
                  <div className="text-center md:text-left">
                    <div className="flex justify-center md:justify-start">
                      <TeamFlag
                        name={match.home_team_name_pl}
                        flagCode={match.home_team_flag_code}
                        flagEmoji={match.home_team_flag_emoji}
                        className="h-20 w-20"
                      />
                    </div>

                    <p className="mt-4 text-2xl font-black">
                      {match.home_team_name_pl}
                    </p>

                    <p className="text-sm text-background/60">
                      {match.home_team_code}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="font-heading text-6xl">
                      {match.home_score === null ? "-" : match.home_score}
                      <span className="mx-3 text-background/40">:</span>
                      {match.away_score === null ? "-" : match.away_score}
                    </p>

                    <p className="mt-2 text-sm text-background/60">
                      Aktualny wynik
                    </p>
                  </div>

                  <div className="text-center md:text-right">
                    <div className="flex justify-center md:justify-end">
                      <TeamFlag
                        name={match.away_team_name_pl}
                        flagCode={match.away_team_flag_code}
                        flagEmoji={match.away_team_flag_emoji}
                        className="h-20 w-20"
                      />
                    </div>

                    <p className="mt-4 text-2xl font-black">
                      {match.away_team_name_pl}
                    </p>

                    <p className="text-sm text-background/60">
                      {match.away_team_code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="rounded-full bg-background px-4 py-2">
                  Kolejka {match.matchday}
                </span>

                {match.venue_city_pl ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
                    <MapPin className="h-4 w-4" />
                    {match.venue_city_pl}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Twój typ</CardTitle>
            </CardHeader>

            <CardContent>
              <PredictionForm
                matchId={match.id}
                initialHomeScore={myPrediction?.predicted_home_score ?? null}
                initialAwayScore={myPrediction?.predicted_away_score ?? null}
                hasPrediction={Boolean(myPrediction)}
                isClosed={isClosed}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Statystyki typów</CardTitle>
            </CardHeader>

            <CardContent>
              <MatchPredictionStats
                predictions={predictions}
                myPrediction={myPrediction}
                matchStarted={matchStarted}
                matchFinished={match.status === "finished"}
                homeTeamName={match.home_team_name_pl}
                awayTeamName={match.away_team_name_pl}
              />
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Typy znajomych</CardTitle>
            </CardHeader>

            <CardContent>
              <PredictionsList
                predictions={predictions}
                predictionsVisible={matchStarted}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
