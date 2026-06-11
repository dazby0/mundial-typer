import { Beer, CheckCircle2, Target } from "lucide-react";

type PredictionProgressCardProps = {
  predicted: number;
  total: number;
  missing: number;
  percentage: number;
};

export function PredictionProgressCard({
  predicted,
  total,
  missing,
  percentage,
}: PredictionProgressCardProps) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Postęp typowania
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {predicted}/{total} meczów obstawione
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {missing === 0
              ? "Komplet. Ekspert przygotowany, teraz tylko piłka może wszystko zepsuć."
              : `${missing} meczów nadal czeka na Twój wielki futbolowy osąd.`}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-130">
          <div className="rounded-3xl bg-background px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <p className="font-heading text-2xl">{predicted}</p>
                <p className="text-xs text-muted-foreground">zatwierdzone</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-background px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <p className="font-heading text-2xl">{missing}</p>
                <p className="text-xs text-muted-foreground">do kliknięcia</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-background px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Beer className="h-5 w-5" />
              </div>

              <div>
                <p className="font-heading text-2xl">{percentage}%</p>
                <p className="text-xs text-muted-foreground">ogarnięte</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 h-4 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Im bliżej 100%, tym mniej wymówek na grupie znajomych.
      </p>
    </div>
  );
}
