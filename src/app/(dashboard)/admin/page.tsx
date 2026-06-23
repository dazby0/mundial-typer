import { redirect } from "next/navigation";
import { GitBranch, ShieldCheck, Trophy, Users } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { createClient } from "@/src/lib/supabase/server";
import { AdminMatchResultCard } from "@/src/features/admin/components/AdminMatchResultCard";
import { AdminMatchFilters } from "@/src/features/admin/components/AdminMatchFilters";
import { AdminMatchItem } from "@/src/features/admin/types/admin-match.types";
import {
  filterAdminMatchesByGroup,
  filterAdminMatchesByStatus,
  getAvailableAdminGroups,
  getValidAdminGroupFilter,
  getValidAdminStatusFilter,
} from "@/src/features/admin/utils/admin-match-filters";
import {
  formatMatchDate,
  groupMatchesByDate,
} from "@/src/features/matches/utils/match-formatters";
import { getTargetDateKey } from "@/src/features/matches/utils/match-filters";
import { AdminTodayMatchesFloatingButton } from "@/src/features/admin/components/AdminTodayMatchesFloatingButton";
import { Button } from "@/src/components/ui/button";
import { AppLink } from "@/src/components/navigation/AppLink";

type AdminPageProps = {
  searchParams: Promise<{
    status?: string;
    group?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { status, group } = await searchParams;

  const activeStatus = getValidAdminStatusFilter(status);
  const activeGroup = getValidAdminGroupFilter(group);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data, error } = await supabase
    .from("admin_matches_overview_view")
    .select("*")
    .order("match_number", { ascending: true });

  if (error) {
    throw new Error("Could not load matches.");
  }

  const matches = (data || []) as AdminMatchItem[];

  const availableGroups = getAvailableAdminGroups(matches);
  const groupFilteredMatches = filterAdminMatchesByGroup(matches, activeGroup);

  const missingMatches = groupFilteredMatches.filter(
    (match) => match.status !== "finished",
  );
  const finishedMatches = groupFilteredMatches.filter(
    (match) => match.status === "finished",
  );

  const filteredMatches = filterAdminMatchesByStatus(
    groupFilteredMatches,
    activeStatus,
  );

  const groupedMatches = groupMatchesByDate(filteredMatches);
  const dates = Object.keys(groupedMatches).sort();
  const targetDateKey = getTargetDateKey(dates);

  return (
    <section className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 rounded-full">Panel admina</Badge>

            <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
              Wpisywanie wyników
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Tutaj admin wpisuje wyniki meczów. Po zapisie system przelicza
              punkty, aktualizuje ranking i odpala piwną księgowość.
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-white"
              >
                <AppLink href="/admin/tournament-bonuses">
                  <Trophy className="h-4 w-4" />
                  Rozlicz bonusy turniejowe
                </AppLink>
              </Button>

              <Button asChild className="rounded-full">
                <AppLink href="/admin/knockout">
                  <GitBranch className="h-4 w-4" />
                  Zatwierdź drabinkę
                </AppLink>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-140">
            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">Admin</p>
                  <p className="text-xs text-muted-foreground">tryb VAR</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">
                    {finishedMatches.length}
                  </p>
                  <p className="text-xs text-muted-foreground">rozliczone</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">
                    {missingMatches.length}
                  </p>
                  <p className="text-xs text-muted-foreground">do wpisania</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AdminMatchFilters
          activeStatus={activeStatus}
          activeGroup={activeGroup}
          groups={availableGroups}
          allCount={groupFilteredMatches.length}
          missingCount={missingMatches.length}
          finishedCount={finishedMatches.length}
        />

        <div className="mt-6 rounded-3xl bg-foreground p-5 text-background">
          <p className="text-sm uppercase tracking-[0.2em] text-background/60">
            Uwaga, tu się dzieje magia
          </p>

          <p className="mt-1 text-xl font-black">
            Zapis wyniku od razu rozlicza typy użytkowników.
          </p>

          <p className="mt-2 text-sm text-background/70">
            Jeśli nadpiszesz gotowy wynik, system zapyta jeszcze raz, czy
            naprawdę chcesz odpalić piłkarski chaos w rankingu.
          </p>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="mt-6 rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black">Tu chwilowo nie ma roboty</h2>

          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Filtry wyczyściły boisko. Albo admin wszystko ogarnął, albo system
            próbuje być miły.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-10">
          {dates.map((date) => {
            const dayMatches = groupedMatches[date];

            return (
              <section
                key={date}
                id={`admin-match-day-${date}`}
                className="scroll-mt-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <h2 className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold uppercase text-background">
                    {formatMatchDate(dayMatches[0].kickoff_time)}
                  </h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-4">
                  {dayMatches.map((match) => (
                    <AdminMatchResultCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <AdminTodayMatchesFloatingButton targetDateKey={targetDateKey} />
    </section>
  );
}
