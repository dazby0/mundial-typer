import { Button } from "@/components/ui/button";
import { AppLink } from "@/src/components/navigation/AppLink";
import {
  AdminMatchStageFilter,
  AdminMatchStatusFilter,
  createAdminMatchesUrl,
} from "@/src/features/admin/utils/admin-match-filters";
import { formatGroupName } from "@/src/features/matches/utils/match-formatters";
import { MATCH_STAGE_FILTERS } from "@/src/features/matches/utils/match-filters";

type AdminMatchFiltersProps = {
  activeStatus: AdminMatchStatusFilter;
  activeGroup: string;
  activeStage: AdminMatchStageFilter;
  groups: string[];
  allCount: number;
  missingCount: number;
  finishedCount: number;
};

const statusFilters = [
  {
    label: "Wszystkie",
    value: "all",
    description: "Cała lista VAR-u",
    getCount: (props: AdminMatchFiltersProps) => props.allCount,
  },
  {
    label: "Do wpisania",
    value: "missing",
    description: "Tu admin musi kliknąć",
    getCount: (props: AdminMatchFiltersProps) => props.missingCount,
  },
  {
    label: "Rozliczone",
    value: "finished",
    description: "Ranking już oberwał",
    getCount: (props: AdminMatchFiltersProps) => props.finishedCount,
  },
] as const;

export function AdminMatchFilters(props: AdminMatchFiltersProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {statusFilters.map((filter) => {
          const isActive = props.activeStatus === filter.value;

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
                href={createAdminMatchesUrl(
                  filter.value,
                  props.activeGroup,
                  props.activeStage,
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

      <div className="rounded-[2rem] bg-background p-4">
        <div className="mb-3">
          <p className="font-bold">Filtr etapu</p>
          <p className="text-sm text-muted-foreground">
            Wybierz etap rozgrywek. Admin VAR też zasługuje na porządek w
            papierach.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {MATCH_STAGE_FILTERS.map((stageFilter) => {
            const isActive = props.activeStage === stageFilter.value;

            const nextGroup =
              stageFilter.value === "group_stage" || stageFilter.value === "all"
                ? props.activeGroup
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
                  href={createAdminMatchesUrl(
                    props.activeStatus,
                    nextGroup,
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

      <div className="rounded-[2rem] bg-background p-4">
        <div className="mb-3">
          <p className="font-bold">Filtr grupy</p>
          <p className="text-sm text-muted-foreground">
            Grupy mają sens tylko przed pucharową jatką. Potem zostaje już tylko
            drabinka, pot i protokół meczowy.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            asChild
            variant={props.activeGroup === "all" ? "default" : "outline"}
            className={
              props.activeGroup === "all"
                ? "shrink-0 rounded-full"
                : "shrink-0 rounded-full bg-white"
            }
          >
            <AppLink
              href={createAdminMatchesUrl(
                props.activeStatus,
                "all",
                props.activeStage,
              )}
            >
              Wszystkie grupy
            </AppLink>
          </Button>

          {props.groups.map((group) => {
            const isActive = props.activeGroup === group;

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
                  href={createAdminMatchesUrl(
                    props.activeStatus,
                    group,
                    "group_stage",
                  )}
                >
                  {formatGroupName(group)}
                </AppLink>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
