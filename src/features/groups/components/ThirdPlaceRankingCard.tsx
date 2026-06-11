import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { GroupStandingItem } from "@/src/features/groups/types/group-standing.types";
import { getThirdPlaceRowClass } from "@/src/features/groups/utils/qualification-style";
import { formatGroupName } from "@/src/features/matches/utils/match-formatters";

type ThirdPlaceRankingCardProps = {
  teams: GroupStandingItem[];
};

export function ThirdPlaceRankingCard({ teams }: ThirdPlaceRankingCardProps) {
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
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Mundial 2026
          </p>

          <h2 className="mt-1 text-3xl font-black">Ranking trzecich miejsc</h2>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Z 12 drużyn z trzecich miejsc awansuje 8 najlepszych. Liczymy:
            punkty, bilans bramkowy, gole strzelone.
          </p>
        </div>

        <div className="rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">TOP 8</span> gra dalej
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {thirdPlacedTeams.map((team) => (
          <div
            key={team.team_id}
            className={`grid grid-cols-[44px_1fr_54px_54px_54px_54px] items-center gap-2 rounded-2xl px-3 py-3 text-sm ${getThirdPlaceRowClass(
              team.third_place_rank,
            )}`}
          >
            <div className="font-heading text-xl">{team.third_place_rank}</div>

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
    </div>
  );
}
