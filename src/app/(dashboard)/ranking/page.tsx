import Link from "next/link";
import { redirect } from "next/navigation";
import { Beer, Crown, Trophy } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/src/lib/supabase/server";
import { RankingListItem } from "@/src/features/ranking/components/RankingListItem";
import { RankingPodium } from "@/src/features/ranking/components/RankingPodium";
import { RankingHighlights } from "@/src/features/ranking/components/RankingHighlights";
import { RankingItem } from "@/src/features/ranking/types/ranking.types";

export default async function RankingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("ranking_view")
    .select("*")
    .order("total_points", { ascending: false })
    .order("exact_scores_count", { ascending: false })
    .order("correct_results_count", { ascending: false })
    .order("username", { ascending: true });

  if (error) {
    throw new Error("Could not load ranking.");
  }

  const ranking = (data || []) as RankingItem[];
  const leader = ranking[0] || null;
  const totalPredictions = ranking.reduce(
    (sum, item) => sum + item.predictions_count,
    0,
  );
  const totalPoints = ranking.reduce((sum, item) => sum + item.total_points, 0);

  return (
    <section className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 rounded-full">Liga piwna Mundial 2026</Badge>

            <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
              Ranking typerów
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Tu kończą się wymówki, a zaczyna matematyka. Każdy punkt to jedna
              butelka piwa dla zwycięzcy, więc walka jest poważna mimo że nikt
              nie wygląda poważnie.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-140">
            <div className="rounded-3xl bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Crown className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-heading text-2xl">
                    {leader?.username || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    aktualny lider
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
                  <p className="font-heading text-2xl">{totalPoints}</p>
                  <p className="text-xs text-muted-foreground">
                    punktów łącznie
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
                  <p className="font-heading text-2xl">
                    {leader?.total_points || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    piw dla lidera
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="mt-6 rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black">Ranking jeszcze śpi</h2>

          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Nikt jeszcze nie typował, więc chwilowo wszyscy są równie genialni.
            To się szybko popsuje.
          </p>

          <Button asChild className="mt-6 rounded-full">
            <Link href="/matches">Idź obstawiać</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <RankingPodium ranking={ranking} />

          <RankingHighlights ranking={ranking} />

          <div className="rounded-[2rem] bg-foreground p-6 text-background shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-background/60">
                  Zasada rozliczenia
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  1 punkt = 1 butelka piwa
                </h2>
              </div>

              <p className="max-w-xl text-sm text-background/70">
                Na końcu Mundialu zwycięzca dostaje tyle butelek, ile punktów
                uzbierał. Czy to rozsądne? Nie. Czy to piękne? Oczywiście.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Tabela generalna</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {ranking.length} graczy • {totalPredictions} zapisanych typów
                </p>
              </div>

              <Button
                asChild
                variant="outline"
                className="rounded-full bg-white"
              >
                <Link href="/predictions">Sprawdź swoje typy</Link>
              </Button>
            </div>
          </div>

          {ranking.map((item, index) => (
            <RankingListItem
              key={item.profile_id}
              item={item}
              position={index + 1}
              leader={leader}
            />
          ))}
        </div>
      )}
    </section>
  );
}
