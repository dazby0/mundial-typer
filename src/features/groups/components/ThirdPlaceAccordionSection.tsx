import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GroupStandingItem } from "@/src/features/groups/types/group-standing.types";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { getThirdPlaceRowClass } from "@/src/features/groups/utils/qualification-style";
import { formatGroupName } from "@/src/features/matches/utils/match-formatters";

type ThirdPlaceAccordionSectionProps = {
  teams: GroupStandingItem[];
};

export function ThirdPlaceAccordionSection({
  teams,
}: ThirdPlaceAccordionSectionProps) {
  const thirdPlacedTeams = teams
    .filter((team) => team.group_position === 3)
    .sort((a, b) => {
      if ((a.third_place_rank ?? 99) !== (b.third_place_rank ?? 99)) {
        return (a.third_place_rank ?? 99) - (b.third_place_rank ?? 99);
      }

      return a.name_pl.localeCompare(b.name_pl);
    });

  if (thirdPlacedTeams.length === 0) {
    return null;
  }

  return (
    <AccordionItem
      value="third-place"
      className="overflow-hidden rounded-[2rem] border-0 bg-white px-6 shadow-sm"
    >
      <AccordionTrigger className="py-6 text-left hover:no-underline">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black">Ranking trzecich miejsc</h2>

            <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold">
              {thirdPlacedTeams.length}
            </span>
          </div>

          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Z 12 drużyn z trzecich miejsc awansuje 8 najlepszych. Liczymy:
            punkty, bilans bramkowy, gole strzelone.
          </p>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-6">
        <div className="space-y-2">
          {thirdPlacedTeams.map((team) => (
            <div
              key={team.team_id}
              className={`grid grid-cols-[44px_1fr_54px_54px_54px_54px] items-center gap-2 rounded-2xl px-3 py-3 text-sm ${getThirdPlaceRowClass(
                team.third_place_rank,
              )}`}
            >
              <div className="font-heading text-xl">
                {team.third_place_rank}
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <TeamFlag
                  name={team.name_pl}
                  flagCode={team.flag_code}
                  flagEmoji={team.flag_emoji}
                  className="h-8 w-8 bg-white"
                />

                <div className="min-w-0">
                  <p className="truncate font-bold">{team.name_pl}</p>

                  <p className="text-xs text-muted-foreground">
                    {formatGroupName(team.group_name)}
                  </p>
                </div>
              </div>

              <div className="text-center font-bold">{team.points}</div>

              <div className="text-center">
                {team.goal_difference > 0
                  ? `+${team.goal_difference}`
                  : team.goal_difference}
              </div>

              <div className="text-center">{team.goals_for}</div>

              <div className="text-center">{team.played}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[44px_1fr_54px_54px_54px_54px] gap-2 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <div>#</div>
          <div>Drużyna</div>
          <div className="text-center">Pkt</div>
          <div className="text-center">Bramki</div>
          <div className="text-center">GF</div>
          <div className="text-center">M</div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
