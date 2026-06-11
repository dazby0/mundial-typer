import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { GroupStandingItem } from "@/src/features/groups/types/group-standing.types";
import { getQualificationRowClass } from "@/src/features/groups/utils/qualification-style";

type GroupStandingRowProps = {
  team: GroupStandingItem;
};

export function GroupStandingRow({ team }: GroupStandingRowProps) {
  return (
    <div
      className={`grid grid-cols-[32px_1fr_38px_38px] md:grid-cols-[42px_1fr_42px_42px_42px_42px_42px] items-center gap-2 rounded-2xl px-3 py-3 text-sm transition ${getQualificationRowClass(
        team.qualification_status,
      )}`}
    >
      <div className="font-heading text-xl">{team.group_position}</div>

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
            {team.code}
            {team.third_place_rank
              ? ` • 3. miejsca: #${team.third_place_rank}`
              : ""}
          </p>
        </div>
      </div>

      <div className="text-center font-bold">{team.played}</div>

      <div className="hidden text-center md:block">
        {team.goal_difference > 0
          ? `+${team.goal_difference}`
          : team.goal_difference}
      </div>

      <div className="hidden text-center md:block">{team.goals_for}</div>

      <div className="hidden text-center md:block">{team.goals_against}</div>

      <div className="text-center font-heading text-xl">{team.points}</div>
    </div>
  );
}
