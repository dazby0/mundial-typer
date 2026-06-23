import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/lib/utils";
import { AdminKnockoutReadiness } from "@/src/features/admin/types/admin-knockout.types";
import { getReadinessMessage } from "./admin-knockout-ui-helpers";

type AdminKnockoutStatusCardProps = {
  readiness: AdminKnockoutReadiness;
  selectedCount: number;
  requiredCount: number;
};

export function AdminKnockoutStatusCard({
  readiness,
  selectedCount,
  requiredCount,
}: AdminKnockoutStatusCardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] p-6 shadow-sm",
        readiness.can_confirm_round_of_32
          ? "bg-white"
          : "bg-foreground text-background",
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Badge
            className={cn(
              "mb-3 rounded-full",
              readiness.can_confirm_round_of_32 &&
                "bg-primary text-primary-foreground",
              !readiness.can_confirm_round_of_32 &&
                "bg-background text-foreground",
            )}
          >
            Status zatwierdzania
          </Badge>

          <h2 className="text-2xl font-black">
            {readiness.can_confirm_round_of_32
              ? "Można zatwierdzać"
              : "Jeszcze nie zatwierdzamy"}
          </h2>

          <p
            className={cn(
              "mt-2 max-w-2xl text-sm",
              readiness.can_confirm_round_of_32
                ? "text-muted-foreground"
                : "text-background/70",
            )}
          >
            {getReadinessMessage(readiness)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-120">
          <div
            className={cn(
              "rounded-3xl px-5 py-4",
              readiness.can_confirm_round_of_32
                ? "bg-background"
                : "bg-background/10",
            )}
          >
            <p className="font-heading text-3xl">
              {readiness.finished_group_matches}/{readiness.total_group_matches}
            </p>
            <p className="text-xs opacity-70">mecze grupowe</p>
          </div>

          <div
            className={cn(
              "rounded-3xl px-5 py-4",
              readiness.can_confirm_round_of_32
                ? "bg-background"
                : "bg-background/10",
            )}
          >
            <p className="font-heading text-3xl">
              {readiness.total_round_of_32_matches}
            </p>
            <p className="text-xs opacity-70">sloty 1/16</p>
          </div>

          <div
            className={cn(
              "rounded-3xl px-5 py-4",
              readiness.can_confirm_round_of_32
                ? "bg-background"
                : "bg-background/10",
            )}
          >
            <p className="font-heading text-3xl">
              {selectedCount}/{requiredCount}
            </p>
            <p className="text-xs opacity-70">wybory admina</p>
          </div>
        </div>
      </div>
    </div>
  );
}
