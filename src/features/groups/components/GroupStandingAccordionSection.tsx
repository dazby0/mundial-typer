import { Badge } from "@/src/components/ui/badge";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GroupStandingRow } from "@/src/features/groups/components/GroupStandingRow";
import { GroupStandingItem } from "@/src/features/groups/types/group-standing.types";
import { getGroupDisplayName } from "@/src/features/groups/utils/group-standings";
import { GroupMatchItem } from "../types/group-match.types";
import { GroupMatchesPanel } from "./GroupMatchesPanel";

type GroupStandingAccordionSectionProps = {
  groupName: string;
  teams: GroupStandingItem[];
  matches: GroupMatchItem[];
};

export function GroupStandingAccordionSection({
  groupName,
  teams,
  matches,
}: GroupStandingAccordionSectionProps) {
  const sortedTeams = [...teams].sort(
    (a, b) => a.group_position - b.group_position,
  );

  const totalPoints = teams.reduce((sum, team) => sum + team.points, 0);

  return (
    <AccordionItem
      value={groupName}
      className="overflow-hidden rounded-[2rem] border-0 bg-white shadow-sm"
    >
      <AccordionTrigger className="px-6 py-6 text-left hover:no-underline">
        <div className="w-full">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <Badge className="mb-2 rounded-full">
                  {getGroupDisplayName(groupName)}
                </Badge>

                <h2 className="text-2xl font-black">Tabela grupy</h2>
              </div>
            </div>

            <div className="rounded-2xl bg-background px-4 py-3 text-right">
              <p className="font-heading text-2xl">{totalPoints}</p>
              <p className="text-xs text-muted-foreground">pkt w grupie</p>
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-6 pb-6 pt-0">
        <div className="space-y-4">
          <div>
            <div className="mb-2 grid grid-cols-[36px_1fr_42px_42px_42px_42px_52px] gap-3 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <p>#</p>
              <p>Drużyna</p>
              <p className="text-center">M</p>
              <p className="text-center">W</p>
              <p className="text-center">R</p>
              <p className="text-center">P</p>
              <p className="text-center">Pkt</p>
            </div>

            <div className="space-y-2">
              {sortedTeams.map((team) => (
                <GroupStandingRow key={team.team_id} team={team} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-sm font-bold">Kolory awansu</p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary/40" />
                Awans z 1–2 miejsca
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-300" />
                Aktualny awans z 3. miejsca
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-white ring-1 ring-border" />
                Poza awansem
              </div>
            </div>
          </div>

          <GroupMatchesPanel matches={matches} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
