import { Lock, Trophy } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import {
  TournamentPrediction,
  TournamentTeamOption,
} from "@/src/features/tournament-predictions/types/tournament-prediction.types";

type TournamentPredictionSummaryProps = {
  prediction: TournamentPrediction;
  teams: TournamentTeamOption[];
};

type SummaryItemProps = {
  label: string;
  value: string;
};

function getTeamName(teams: TournamentTeamOption[], teamId: string) {
  return teams.find((team) => team.id === teamId)?.name_pl || "Brak typu";
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="rounded-2xl bg-background px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

export function TournamentPredictionSummary({
  prediction,
  teams,
}: TournamentPredictionSummaryProps) {
  const championName = getTeamName(teams, prediction.champion_team_id);
  const topScoringTeamName = getTeamName(teams, prediction.top_scoring_team_id);
  const finalistOneName = getTeamName(teams, prediction.finalist_team_1_id);
  const finalistTwoName = getTeamName(teams, prediction.finalist_team_2_id);

  const semifinalistOneName = getTeamName(
    teams,
    prediction.semifinalist_team_1_id,
  );
  const semifinalistTwoName = getTeamName(
    teams,
    prediction.semifinalist_team_2_id,
  );
  const semifinalistThreeName = getTeamName(
    teams,
    prediction.semifinalist_team_3_id,
  );
  const semifinalistFourName = getTeamName(
    teams,
    prediction.semifinalist_team_4_id,
  );

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge className="mb-4 rounded-full">Typy zablokowane</Badge>

          <h2 className="text-3xl font-black">Twoje typy turniejowe</h2>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Mundial wystartował, więc proroctwa są już zamknięte. Teraz możesz
            tylko patrzeć, jak pięknie się spełniają albo spektakularnie płoną.
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <SummaryItem label="Mistrz świata" value={championName} />

        <SummaryItem
          label="Drużyna z największą liczbą goli"
          value={topScoringTeamName}
        />

        <SummaryItem label="Finalista 1" value={finalistOneName} />

        <SummaryItem label="Finalista 2" value={finalistTwoName} />

        <SummaryItem
          label="Król strzelców"
          value={prediction.top_scorer_name || "Brak typu"}
        />

        <SummaryItem
          label="Łącznie zdobyte punkty"
          value={`${prediction.total_points} pkt`}
        />
      </div>

      <div className="mt-6 rounded-[2rem] bg-background p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Trophy className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-xl font-black">TOP 4 / półfinaliści</h3>

            <p className="text-sm text-muted-foreground">
              Cztery drużyny, które według Ciebie znajdą się w najlepszej
              czwórce turnieju.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SummaryItem label="TOP 4 — drużyna 1" value={semifinalistOneName} />

          <SummaryItem label="TOP 4 — drużyna 2" value={semifinalistTwoName} />

          <SummaryItem
            label="TOP 4 — drużyna 3"
            value={semifinalistThreeName}
          />

          <SummaryItem label="TOP 4 — drużyna 4" value={semifinalistFourName} />
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-foreground p-4 text-background">
        <p className="font-bold">Zamknięte na amen</p>

        <p className="mt-1 text-sm text-background/70">
          Tych typów nie da się już edytować. Komisja piwna zatwierdziła
          protokół, a historia oceni resztę.
        </p>
      </div>
    </div>
  );
}
