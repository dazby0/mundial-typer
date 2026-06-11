import { GroupMatchRow } from "@/src/features/groups/components/GroupMatchRow";
import { GroupMatchItem } from "@/src/features/groups/types/group-match.types";
import {
  getFinishedGroupMatches,
  getUpcomingGroupMatches,
} from "@/src/features/groups/utils/group-matches";

type GroupMatchesPanelProps = {
  matches: GroupMatchItem[];
};

export function GroupMatchesPanel({ matches }: GroupMatchesPanelProps) {
  const finishedMatches = getFinishedGroupMatches(matches);
  const upcomingMatches = getUpcomingGroupMatches(matches);

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-3xl bg-foreground p-4 text-background">
        <p className="text-sm uppercase tracking-[0.18em] text-background/60">
          Sytuacja w grupie
        </p>

        <p className="mt-1 text-lg font-black">
          {finishedMatches.length} rozegrane • {upcomingMatches.length} przed
          nami
        </p>

        <p className="mt-1 text-sm text-background/70">
          Czyli jeszcze wszystko możliwe, chyba że tabela już zaczyna wyglądać
          jak wyrok.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-black">Ostatnie wyniki</h3>

        {finishedMatches.length === 0 ? (
          <div className="rounded-3xl bg-background p-4 text-sm text-muted-foreground">
            Jeszcze nie było wyników w tej grupie. Wszyscy nadal mogą udawać, że
            mają plan na awans.
          </div>
        ) : (
          <div className="space-y-3">
            {finishedMatches.map((match) => (
              <GroupMatchRow key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-lg font-black">Najbliższe mecze</h3>

        {upcomingMatches.length === 0 ? (
          <div className="rounded-3xl bg-background p-4 text-sm text-muted-foreground">
            Brak najbliższych meczów. Grupa chwilowo siedzi cicho albo już
            wszystko zostało policzone.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMatches.slice(0, 3).map((match) => (
              <GroupMatchRow key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
