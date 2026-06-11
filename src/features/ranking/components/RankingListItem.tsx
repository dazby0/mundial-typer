import { Beer, Medal, Target, Trophy, XCircle } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { RankingItem } from "@/src/features/ranking/types/ranking.types";
import {
  getPointsToLeader,
  getRankingBadgeDescription,
  getRankingTitle,
} from "@/src/features/ranking/utils/ranking-helpers";

type RankingListItemProps = {
  item: RankingItem;
  position: number;
  leader: RankingItem | null;
};

function getPositionIcon(position: number) {
  if (position <= 3) {
    return <Medal className="h-5 w-5" />;
  }

  return <Target className="h-5 w-5" />;
}

export function RankingListItem({
  item,
  position,
  leader,
}: RankingListItemProps) {
  const isPodium = position <= 3;
  const pointsToLeader = getPointsToLeader(item, leader);

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={
              isPodium
                ? "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
                : "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background text-foreground"
            }
          >
            <span className="font-heading text-2xl">{position}</span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-2xl font-black">{item.username}</h2>

              <Badge variant="secondary" className="rounded-full">
                {getRankingTitle(item, position)}
              </Badge>

              {item.role === "admin" ? (
                <Badge variant="outline" className="rounded-full bg-white">
                  admin od piwa
                </Badge>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                {getPositionIcon(position)}
                {getRankingBadgeDescription(item, position)}
              </span>

              {pointsToLeader > 0 ? (
                <span className="rounded-full bg-background px-3 py-1">
                  brakuje {pointsToLeader} piw do lidera
                </span>
              ) : (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  lider patrzy z góry
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-3 lg:min-w-155 lg:grid-cols-5">
          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              Punkty
            </div>
            <p className="mt-1 font-heading text-3xl">{item.total_points}</p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Beer className="h-4 w-4" />
              Piwa
            </div>
            <p className="mt-1 font-heading text-3xl">{item.total_points}</p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-sm text-muted-foreground">Typy</p>
            <p className="mt-1 font-heading text-3xl">
              {item.predictions_count}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-sm text-muted-foreground">Idealne</p>
            <p className="mt-1 font-heading text-3xl">
              {item.exact_scores_count}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4" />
              Pudła
            </div>
            <p className="mt-1 font-heading text-3xl">
              {item.wrong_predictions_count}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
