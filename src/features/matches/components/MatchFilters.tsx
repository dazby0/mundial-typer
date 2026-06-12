import { Button } from "@/components/ui/button";
import { AppLink } from "@/src/components/navigation/AppLink";
import {
  createMatchesUrl,
  MatchFilter,
} from "@/src/features/matches/utils/match-filters";

type MatchFiltersProps = {
  activeFilter: MatchFilter;
  activeGroup: string;
  activeSearch: string;
  allCount: number;
  missingCount: number;
  confirmedCount: number;
};

const filters = [
  {
    label: "Wszystkie",
    value: "all",
    getCount: (props: MatchFiltersProps) => props.allCount,
    description: "Cały terminarz",
  },
  {
    label: "Nie typowano",
    value: "missing",
    getCount: (props: MatchFiltersProps) => props.missingCount,
    description: "Tu są zaległości",
  },
  {
    label: "Typ zatwierdzony",
    value: "confirmed",
    getCount: (props: MatchFiltersProps) => props.confirmedCount,
    description: "Dowody zapisane",
  },
] as const;

export function MatchFilters(props: MatchFiltersProps) {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-3">
      {filters.map((filter) => {
        const isActive = props.activeFilter === filter.value;

        return (
          <Button
            key={filter.value}
            asChild
            variant={isActive ? "default" : "outline"}
            className={
              isActive
                ? "h-auto justify-between rounded-3xl p-4"
                : "h-auto justify-between rounded-3xl bg-white p-4"
            }
          >
            <AppLink
              href={createMatchesUrl(
                filter.value,
                props.activeGroup,
                props.activeSearch,
              )}
            >
              <span className="text-left">
                <span className="block font-bold">{filter.label}</span>
                <span className="block text-xs opacity-70">
                  {filter.description}
                </span>
              </span>

              <span className="font-heading text-2xl">
                {filter.getCount(props)}
              </span>
            </AppLink>
          </Button>
        );
      })}
    </div>
  );
}
