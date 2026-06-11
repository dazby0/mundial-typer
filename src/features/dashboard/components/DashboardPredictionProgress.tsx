import Link from "next/link";
import { Button } from "@/components/ui/button";

type DashboardPredictionProgressProps = {
  predicted: number;
  total: number;
  percentage: number;
};

export function DashboardPredictionProgress({
  predicted,
  total,
  percentage,
}: DashboardPredictionProgressProps) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Postęp obstawiania
          </p>

          <h2 className="mt-1 text-2xl font-black">
            {predicted}/{total} typów zapisane
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {percentage === 100
              ? "Komplet. Teraz możesz tylko patrzeć, jak piłka niszczy pewność siebie."
              : `Masz ${percentage}% ogarnięte. Niby coś, ale jeszcze nie otwieramy szampana.`}
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-full bg-white">
          <Link href="/predictions">Zobacz checklistę</Link>
        </Button>
      </div>

      <div className="mt-5 h-4 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
