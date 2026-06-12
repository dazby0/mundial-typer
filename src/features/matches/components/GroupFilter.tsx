import { Button } from "@/components/ui/button";
import { AppLink } from "@/src/components/navigation/AppLink";
import {
  createMatchesUrl,
  MatchFilter,
} from "@/src/features/matches/utils/match-filters";
import { formatGroupName } from "@/src/features/matches/utils/match-formatters";

type GroupFilterProps = {
  groups: string[];
  activeGroup: string;
  activeFilter: MatchFilter;
  activeSearch: string;
};

export function GroupFilter({
  groups,
  activeGroup,
  activeFilter,
  activeSearch,
}: GroupFilterProps) {
  return (
    <div className="mt-4 rounded-[2rem] bg-background p-4">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-bold">Filtr grupy</p>
          <p className="text-sm text-muted-foreground">
            Wybierz grupę i udawaj, że masz rozpisaną całą drabinkę w głowie.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button
          asChild
          variant={activeGroup === "all" ? "default" : "outline"}
          className={
            activeGroup === "all"
              ? "shrink-0 rounded-full"
              : "shrink-0 rounded-full bg-white"
          }
        >
          <AppLink href={createMatchesUrl(activeFilter, "all", activeSearch)}>
            Wszystkie grupy
          </AppLink>
        </Button>

        {groups.map((group) => {
          const isActive = activeGroup === group;

          return (
            <Button
              key={group}
              asChild
              variant={isActive ? "default" : "outline"}
              className={
                isActive
                  ? "shrink-0 rounded-full"
                  : "shrink-0 rounded-full bg-white"
              }
            >
              <AppLink
                href={createMatchesUrl(activeFilter, group, activeSearch)}
              >
                {formatGroupName(group)}
              </AppLink>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
