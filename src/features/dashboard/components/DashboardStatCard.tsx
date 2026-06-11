import { LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
};

export function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
}: DashboardStatCardProps) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-heading text-3xl">{value}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
