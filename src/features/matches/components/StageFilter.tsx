import { Button } from "@/components/ui/button";
import { AppLink } from "@/src/components/navigation/AppLink";
import {
  createMatchesUrl,
  MatchFilter,
  MATCH_STAGE_FILTERS,
  MatchStageFilter,
} from "@/src/features/matches/utils/match-filters";

type StageFilterProps = {
  activeStage: MatchStageFilter;
  activeFilter: MatchFilter;
  activeGroup: string;
  activeSearch: string;
};

export function StageFilter({
  activeStage,
  activeFilter,
  activeGroup,
  activeSearch,
}: StageFilterProps) {
  return (
    <div className="mt-4 rounded-[2rem] bg-background p-4">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-bold">Filtr etapu</p>
          <p className="text-sm text-muted-foreground">
            Od grupowej rozgrzewki po pucharową maszynkę do niszczenia kuponów.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {MATCH_STAGE_FILTERS.map((stageFilter) => {
          const isActive = activeStage === stageFilter.value;
          const nextGroup =
            stageFilter.value === "group_stage" || stageFilter.value === "all"
              ? activeGroup
              : "all";

          return (
            <Button
              key={stageFilter.value}
              asChild
              variant={isActive ? "default" : "outline"}
              className={
                isActive
                  ? "h-auto shrink-0 rounded-2xl px-4 py-3"
                  : "h-auto shrink-0 rounded-2xl bg-white px-4 py-3"
              }
            >
              <AppLink
                href={createMatchesUrl(
                  activeFilter,
                  nextGroup,
                  activeSearch,
                  stageFilter.value,
                )}
              >
                <span className="text-left">
                  <span className="block font-bold">{stageFilter.label}</span>
                  <span className="block text-xs opacity-70">
                    {stageFilter.description}
                  </span>
                </span>
              </AppLink>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
