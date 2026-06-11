import { Trophy } from "lucide-react";
import { PublicTournamentPrediction } from "@/src/features/tournament-predictions/types/tournament-prediction.types";
import { TournamentPredictionTeamPill } from "@/src/features/tournament-predictions/components/TournamentPredictionTeamPill";

type PublicTournamentPredictionsListProps = {
  predictions: PublicTournamentPrediction[];
};

export function PublicTournamentPredictionsList({
  predictions,
}: PublicTournamentPredictionsListProps) {
  if (predictions.length === 0) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-black">Brak publicznych proroctw</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Nikt jeszcze nie zapisał typów turniejowych. Albo wszyscy udają, że
          myślą strategicznie.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Typy znajomych
          </p>

          <h2 className="mt-1 text-3xl font-black">Wielkie proroctwa grupy</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Turniej wystartował, więc koniec tajemnic. Teraz można sprawdzić,
            kto przewidział przyszłość, a kto odpłynął.
          </p>
        </div>

        <div className="rounded-full bg-background px-4 py-2 text-sm font-bold text-muted-foreground">
          {predictions.length} zapisanych typów
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {predictions.map((prediction) => (
          <div
            key={prediction.id}
            className="rounded-[1.5rem] bg-background p-5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-2xl font-black">{prediction.username}</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Bonusy: {prediction.total_points} pkt
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-heading text-xl">
                <Trophy className="h-4 w-4" />
                {prediction.total_points}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="mb-3 text-sm font-bold text-muted-foreground">
                  Mistrz świata
                </p>

                <TournamentPredictionTeamPill
                  name={prediction.champion_team_name_pl}
                  code={prediction.champion_team_code}
                  flagCode={prediction.champion_team_flag_code}
                  flagEmoji={prediction.champion_team_flag_emoji}
                />
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="mb-3 text-sm font-bold text-muted-foreground">
                  Najwięcej goli drużynowo
                </p>

                <TournamentPredictionTeamPill
                  name={prediction.top_scoring_team_name_pl}
                  code={prediction.top_scoring_team_code}
                  flagCode={prediction.top_scoring_team_flag_code}
                  flagEmoji={prediction.top_scoring_team_flag_emoji}
                />
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="mb-3 text-sm font-bold text-muted-foreground">
                  Finaliści
                </p>

                <div className="flex flex-wrap gap-2">
                  <TournamentPredictionTeamPill
                    name={prediction.finalist_team_1_name_pl}
                    code={prediction.finalist_team_1_code}
                    flagCode={prediction.finalist_team_1_flag_code}
                    flagEmoji={prediction.finalist_team_1_flag_emoji}
                  />

                  <TournamentPredictionTeamPill
                    name={prediction.finalist_team_2_name_pl}
                    code={prediction.finalist_team_2_code}
                    flagCode={prediction.finalist_team_2_flag_code}
                    flagEmoji={prediction.finalist_team_2_flag_emoji}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="mb-3 text-sm font-bold text-muted-foreground">
                  Król strzelców
                </p>

                <p className="text-2xl font-black">
                  {prediction.top_scorer_name}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 xl:col-span-2">
                <p className="mb-3 text-sm font-bold text-muted-foreground">
                  TOP 4 / półfinaliści
                </p>

                <div className="flex flex-wrap gap-2">
                  <TournamentPredictionTeamPill
                    name={prediction.semifinalist_team_1_name_pl}
                    code={prediction.semifinalist_team_1_code}
                    flagCode={prediction.semifinalist_team_1_flag_code}
                    flagEmoji={prediction.semifinalist_team_1_flag_emoji}
                  />

                  <TournamentPredictionTeamPill
                    name={prediction.semifinalist_team_2_name_pl}
                    code={prediction.semifinalist_team_2_code}
                    flagCode={prediction.semifinalist_team_2_flag_code}
                    flagEmoji={prediction.semifinalist_team_2_flag_emoji}
                  />

                  <TournamentPredictionTeamPill
                    name={prediction.semifinalist_team_3_name_pl}
                    code={prediction.semifinalist_team_3_code}
                    flagCode={prediction.semifinalist_team_3_flag_code}
                    flagEmoji={prediction.semifinalist_team_3_flag_emoji}
                  />

                  <TournamentPredictionTeamPill
                    name={prediction.semifinalist_team_4_name_pl}
                    code={prediction.semifinalist_team_4_code}
                    flagCode={prediction.semifinalist_team_4_flag_code}
                    flagEmoji={prediction.semifinalist_team_4_flag_emoji}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
