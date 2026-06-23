"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  createMatchesUrl,
  MatchFilter,
  MatchStageFilter,
} from "@/src/features/matches/utils/match-filters";
import { useState } from "react";

type MatchSearchProps = {
  activeSearch: string;
  activeFilter: MatchFilter;
  activeGroup: string;
  activeStage: MatchStageFilter;
};

export function MatchSearch({
  activeSearch,
  activeFilter,
  activeGroup,
  activeStage,
}: MatchSearchProps) {
  const router = useRouter();
  const [search, setSearch] = useState(activeSearch);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(
      createMatchesUrl(activeFilter, activeGroup, search, activeStage),
    );
  }

  function handleClear() {
    setSearch("");
    router.push(createMatchesUrl(activeFilter, activeGroup, "", activeStage));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-[2rem] bg-background p-4"
    >
      <div className="mb-3">
        <p className="font-bold">Szukaj drużyny</p>
        <p className="text-sm text-muted-foreground">
          Wpisz np. Brazylia, Portugal, ENG, finał albo miasto. Skauting po
          znajomości, ale działa.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj meczu, drużyny, kodu, rundy..."
            className="h-12 rounded-full bg-white pl-11"
          />
        </div>

        <Button type="submit" className="h-12 rounded-full">
          Szukaj
        </Button>

        {activeSearch ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="h-12 rounded-full bg-white"
          >
            <X className="h-4 w-4" />
            Wyczyść
          </Button>
        ) : null}
      </div>
    </form>
  );
}
