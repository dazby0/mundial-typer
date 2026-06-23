import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { createClient } from "@/src/lib/supabase/server";
import { MatchCard } from "@/src/features/matches/components/MatchCard";
import { MatchFilters } from "@/src/features/matches/components/MatchFilters";
import { TodayMatchesFloatingButton } from "@/src/features/matches/components/TodayMatchesFloatingButton";
import {
  MatchListItem,
  MyMatchPrediction,
} from "@/src/features/matches/types/match.types";
import {
  formatMatchDate,
  groupMatchesByDate,
} from "@/src/features/matches/utils/match-formatters";
import {
  filterMatchesByGroup,
  filterMatchesByPredictionStatus,
  filterMatchesBySearch,
  filterMatchesByStage,
  getAvailableGroups,
  getTargetDateKey,
  getValidGroupFilter,
  getValidMatchFilter,
  getValidSearchFilter,
  getValidStageFilter,
} from "@/src/features/matches/utils/match-filters";
import { GroupFilter } from "@/src/features/matches/components/GroupFilter";
import { MatchSearch } from "@/src/features/matches/components/MatchSearch";
import { StageFilter } from "@/src/features/matches/components/StageFilter";

type MatchesPageProps = {
  searchParams: Promise<{
    filter?: string;
    group?: string;
    search?: string;
    stage?: string;
  }>;
};

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const { filter, group, search, stage } = await searchParams;
  const activeFilter = getValidMatchFilter(filter);
  const activeStage = getValidStageFilter(stage);
  const activeGroup = getValidGroupFilter(group);
  const activeSearch = getValidSearchFilter(search);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("matches_view")
    .select("*")
    .order("match_number", { ascending: true });

  if (error) {
    throw new Error("Could not load matches.");
  }

  const { data: predictionsData, error: predictionsError } = await supabase
    .from("predictions")
    .select(
      `
        id,
        match_id,
        predicted_home_score,
        predicted_away_score,
        predicted_winner_team_id,
        predicted_resolution_method,
        points
      `,
    )
    .eq("user_id", user.id);

  if (predictionsError) {
    throw new Error("Could not load predictions.");
  }

  const matches = (data || []) as MatchListItem[];
  const myPredictions = (predictionsData || []) as MyMatchPrediction[];

  const predictionsByMatchId = new Map(
    myPredictions.map((prediction) => [prediction.match_id, prediction]),
  );

  const availableGroups = getAvailableGroups(matches);
  const stageFilteredMatches = filterMatchesByStage(matches, activeStage);
  const groupFilteredMatches = filterMatchesByGroup(
    stageFilteredMatches,
    activeGroup,
  );
  const searchedMatches = filterMatchesBySearch(
    groupFilteredMatches,
    activeSearch,
  );

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const missingCount = searchedMatches.filter((match) => {
    const matchStarted = new Date(match.kickoff_time).getTime() <= now;

    return !matchStarted && !predictionsByMatchId.has(match.id);
  }).length;

  const confirmedCount = searchedMatches.filter((match) =>
    predictionsByMatchId.has(match.id),
  ).length;

  const filteredMatches = filterMatchesByPredictionStatus(
    searchedMatches,
    predictionsByMatchId,
    activeFilter,
  );

  const groupedMatches = groupMatchesByDate(filteredMatches);
  const dates = Object.keys(groupedMatches).sort();
  const targetDateKey = getTargetDateKey(dates);

  return (
    <section className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-4 rounded-full">
              Terminarz turnieju • od grup do finału
            </Badge>

            <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
              Mecze do typowania
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Od grupowej rozgrzewki po pucharową rzeźnię. Typuj przed pierwszym
              gwizdkiem, bo potem system zamyka bramkę, chowa klucz i udaje, że
              nic nie słyszy.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-3xl bg-background px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-2xl">{filteredMatches.length}</p>
              <p className="text-xs text-muted-foreground">mecze w widoku</p>
            </div>
          </div>
        </div>

        <MatchFilters
          activeFilter={activeFilter}
          activeGroup={activeGroup}
          activeStage={activeStage}
          activeSearch={activeSearch}
          allCount={matches.length}
          missingCount={missingCount}
          confirmedCount={confirmedCount}
        />

        <Accordion type="multiple" defaultValue={[]} className="mt-3 space-y-5">
          <AccordionItem value="filters">
            <AccordionTrigger className="rounded-2xl bg-background hover:no-underline p-3">
              <span className="text-sm font-semibold">Dodatkowe filtry</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-1">
              <StageFilter
                activeStage={activeStage}
                activeFilter={activeFilter}
                activeGroup={activeGroup}
                activeSearch={activeSearch}
              />

              <GroupFilter
                groups={availableGroups}
                activeGroup={activeGroup}
                activeFilter={activeFilter}
                activeSearch={activeSearch}
                activeStage={activeStage}
              />

              <MatchSearch
                activeSearch={activeSearch}
                activeFilter={activeFilter}
                activeGroup={activeGroup}
                activeStage={activeStage}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {dates.length === 0 ? (
        <div className="mt-6 rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black">Tu chwilowo pusto</h2>

          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Wygląda na to, że filtr wyczyścił boisko. Albo jesteś tak
            zorganizowany, że nie ma zaległości. Podejrzane, ale szanuję.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {dates.map((date) => {
            const dayMatches = groupedMatches[date];

            return (
              <section
                key={date}
                id={`match-day-${date}`}
                className="scroll-mt-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <h2 className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold uppercase text-background">
                    {formatMatchDate(dayMatches[0].kickoff_time)}
                  </h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {dayMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      myPrediction={predictionsByMatchId.get(match.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <TodayMatchesFloatingButton targetDateKey={targetDateKey} />
    </section>
  );
}
