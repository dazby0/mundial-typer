import { Beer, Crown, Medal, Target, Trophy } from "lucide-react";
import { RankingItem } from "@/src/features/ranking/types/ranking.types";
import {
  getRankingBadgeDescription,
  getRankingTitle,
} from "@/src/features/ranking/utils/ranking-helpers";

type RankingPodiumProps = {
  ranking: RankingItem[];
};

function getPodiumItemClass(position: number) {
  if (position === 1) {
    return "bg-foreground text-background";
  }

  return "bg-white text-foreground";
}

function getPodiumIcon(position: number) {
  if (position === 1) {
    return <Crown className="h-6 w-6" />;
  }

  if (position === 2) {
    return <Trophy className="h-6 w-6" />;
  }

  return <Medal className="h-6 w-6" />;
}

export function RankingPodium({ ranking }: RankingPodiumProps) {
  const podium = ranking.slice(0, 3);

  if (podium.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {podium.map((item, index) => {
        const position = index + 1;
        const isLeader = position === 1;

        return (
          <div
            key={item.profile_id}
            className={`rounded-[2rem] p-6 shadow-sm ${getPodiumItemClass(position)}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className={
                  isLeader
                    ? "flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-foreground"
                    : "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                }
              >
                {getPodiumIcon(position)}
              </div>

              <div
                className={
                  isLeader
                    ? "rounded-full bg-background px-4 py-2 text-sm font-bold text-foreground"
                    : "rounded-full bg-background px-4 py-2 text-sm font-bold text-foreground"
                }
              >
                #{position}
              </div>
            </div>

            <div className="mt-6">
              <p
                className={
                  isLeader ? "text-background/60" : "text-muted-foreground"
                }
              >
                {getRankingTitle(item, position)}
              </p>

              <h2 className="mt-1 truncate text-3xl font-black">
                {item.username}
              </h2>

              <p
                className={
                  isLeader
                    ? "mt-2 text-sm text-background/70"
                    : "mt-2 text-sm text-muted-foreground"
                }
              >
                {getRankingBadgeDescription(item, position, "podium")}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div
                className={
                  isLeader
                    ? "rounded-2xl bg-background/10 px-4 py-3"
                    : "rounded-2xl bg-background px-4 py-3"
                }
              >
                <div
                  className={
                    isLeader
                      ? "flex items-center gap-2 text-sm text-background/60"
                      : "flex items-center gap-2 text-sm text-muted-foreground"
                  }
                >
                  <Beer className="h-4 w-4" />
                  Piwa
                </div>

                <p className="font-heading text-4xl">{item.total_points}</p>
              </div>

              <div
                className={
                  isLeader
                    ? "rounded-2xl bg-background/10 px-4 py-3"
                    : "rounded-2xl bg-background px-4 py-3"
                }
              >
                <div
                  className={
                    isLeader
                      ? "flex items-center gap-2 text-sm text-background/60"
                      : "flex items-center gap-2 text-sm text-muted-foreground"
                  }
                >
                  <Target className="h-4 w-4" />
                  Idealne strzały
                </div>

                <p className="font-heading text-4xl">
                  {item.exact_scores_count}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
