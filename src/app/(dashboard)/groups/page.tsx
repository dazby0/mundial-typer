import { redirect } from "next/navigation";
import { Table2, Trophy, Users } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { createClient } from "@/src/lib/supabase/server";
import { GroupStandingCard } from "@/src/features/groups/components/GroupStandingCard";
import { GroupStandingItem } from "@/src/features/groups/types/group-standing.types";
import {
  groupStandingsByGroup,
  sortGroupNames,
} from "@/src/features/groups/utils/group-standings";
import { GroupMatchItem } from "@/src/features/groups/types/group-match.types";
import { groupMatchesByGroup } from "@/src/features/groups/utils/group-matches";
import { ThirdPlaceAccordionSection } from "@/src/features/groups/components/ThirdPlaceAccordionSection";

export default async function GroupsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("group_qualification_view")
    .select("*")
    .order("group_name", { ascending: true })
    .order("group_position", { ascending: true });

  if (error) {
    throw new Error("Could not load group standings.");
  }

  const { data: matchesData, error: matchesError } = await supabase
    .from("matches_view")
    .select("*")
    .order("match_number", { ascending: true });

  if (matchesError) {
    throw new Error("Could not load group matches.");
  }

  const standings = (data || []) as GroupStandingItem[];
  const matches = (matchesData || []) as GroupMatchItem[];

  const groupedStandings = groupStandingsByGroup(standings);
  const groupedMatches = groupMatchesByGroup(matches);
  const groupNames = sortGroupNames(Object.keys(groupedStandings));

  const playedMatches =
    standings.reduce((sum, team) => sum + team.played, 0) / 2;
  const totalGoals = standings.reduce((sum, team) => sum + team.goals_for, 0);

  return (
    <section className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 rounded-full">Faza grupowa</Badge>

            <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
              Tabele grup
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Tu widać, kto idzie po chwałę, kto jeszcze kalkuluje, a kto już
              powoli sprawdza loty powrotne. Tabele aktualizują się po wpisaniu
              wyników przez admina.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-140">
            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Table2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">{groupNames.length}</p>
                  <p className="text-xs text-muted-foreground">grup</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">{standings.length}</p>
                  <p className="text-xs text-muted-foreground">drużyn</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">{totalGoals}</p>
                  <p className="text-xs text-muted-foreground">goli</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-foreground p-5 text-background">
          <p className="text-sm uppercase tracking-[0.2em] text-background/60">
            Szybka zasada
          </p>

          <p className="mt-1 text-xl font-black">
            Tabele liczymy po punktach, bilansie bramek i golach strzelonych.
          </p>

          <p className="mt-2 text-sm text-background/70">
            Czyli klasycznie: 3 pkt za zwycięstwo, 1 pkt za remis, 0 pkt za
            piłkarskie nieszczęście. Pełne FIFA tie-breakery ogarniemy później,
            jak już aplikacja zacznie wyglądać jak VAR dla znajomych.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {groupNames.map((groupName) => (
          <GroupStandingCard
            key={groupName}
            groupName={groupName}
            teams={groupedStandings[groupName]}
            matches={groupedMatches[groupName] || []}
          />
        ))}
      </div>

      <div className="mt-6">
        <Accordion type="multiple" defaultValue={[]} className="space-y-5">
          <ThirdPlaceAccordionSection teams={standings} />
        </Accordion>
      </div>

      <div className="mt-6 rounded-[2rem] bg-white p-5 text-sm text-muted-foreground shadow-sm">
        Rozegrane mecze:{" "}
        <span className="font-bold text-foreground">{playedMatches}</span>.
        Jeśli wszędzie jest zero, to spokojnie — Mundial jeszcze nie odpalił
        albo admin jeszcze nie wpisał wyników.
      </div>
    </section>
  );
}
