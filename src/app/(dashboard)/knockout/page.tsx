import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { KnockoutBracketScrollArea } from "@/src/features/knockout/components/KnockoutBracketScrollArea";
import { KnockoutHeaderCard } from "@/src/features/knockout/components/KnockoutHeaderCard";
import { KnockoutMatchPreview } from "@/src/features/knockout/types/knockout.types";

export default async function KnockoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("knockout_matches_preview")
    .select("*")
    .order("round_order", { ascending: true })
    .order("match_order", { ascending: true });

  if (error) {
    throw new Error("Could not load knockout bracket.");
  }

  const matches = (data || []) as KnockoutMatchPreview[];

  return (
    <section className="mx-auto max-w-7xl">
      <KnockoutHeaderCard matchesCount={matches.length} />

      {matches.length === 0 ? (
        <div className="mt-6 rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black">Drabinka jeszcze nie gotowa</h2>

          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Na razie nie ma żadnych meczów do pokazania. Ktoś z komitetu
            organizacyjnego pewnie jeszcze szuka Excela.
          </p>
        </div>
      ) : (
        <KnockoutBracketScrollArea matches={matches} />
      )}
    </section>
  );
}
