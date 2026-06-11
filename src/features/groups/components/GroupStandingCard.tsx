import { Badge } from "@/src/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GroupStandingRow } from "@/src/features/groups/components/GroupStandingRow";
import { GroupStandingItem } from "@/src/features/groups/types/group-standing.types";
import { getGroupDisplayName } from "@/src/features/groups/utils/group-standings";
import { GroupMatchItem } from "../types/group-match.types";
import { GroupMatchesPanel } from "./GroupMatchesPanel";

type GroupStandingCardProps = {
  groupName: string;
  teams: GroupStandingItem[];
  matches: GroupMatchItem[];
};

export function GroupStandingCard({
  groupName,
  teams,
  matches,
}: GroupStandingCardProps) {
  const sortedTeams = [...teams].sort(
    (a, b) => a.group_position - b.group_position,
  );

  const totalPoints = teams.reduce((sum, team) => sum + team.points, 0);

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <Badge className="mb-2 rounded-full">
            {getGroupDisplayName(groupName)}
          </Badge>

          <h2 className="text-2xl font-black">Tabela grupy</h2>
        </div>

        <div className="rounded-2xl bg-background px-4 py-3 text-right">
          <p className="font-heading text-2xl">{totalPoints}</p>
          <p className="text-xs text-muted-foreground">pkt w grupie</p>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-[32px_1fr_38px_38px] md:grid-cols-[36px_1fr_42px_42px_42px_42px_52px] gap-3 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <p>#</p>
        <p>Drużyna</p>
        <p className="text-center">M</p>
        <p className="hidden text-center md:block">W</p>
        <p className="hidden text-center md:block">R</p>
        <p className="hidden text-center md:block">P</p>
        <p className="text-center">Pkt</p>
      </div>

      <div className="space-y-2">
        {sortedTeams.map((team) => (
          <GroupStandingRow key={team.team_id} team={team} />
        ))}
      </div>

      <Accordion type="single" collapsible defaultValue="">
        <AccordionItem value="details" className="border-0 pt-4">
          <AccordionTrigger className="px-0 hover:no-underline">
            <span className="text-sm font-semibold">Więcej informacji</span>
          </AccordionTrigger>

          <AccordionContent className="pt-4 px-0 space-y-4">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
