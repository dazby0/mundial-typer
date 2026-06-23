import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { KnockoutResolutionMethod } from "@/src/features/knockout/types/knockout-rules.types";

type KnockoutResolutionMethodButtonProps = {
  value: KnockoutResolutionMethod;
  selectedValue: KnockoutResolutionMethod;
  title: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
  onClick: (value: KnockoutResolutionMethod) => void;
};

export function KnockoutResolutionMethodButton({
  value,
  selectedValue,
  title,
  description,
  icon: Icon,
  disabled = false,
  onClick,
}: KnockoutResolutionMethodButtonProps) {
  const isSelected = value === selectedValue;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(value)}
      className={cn(
        "rounded-3xl border bg-white p-4 text-left shadow-sm transition",
        "hover:border-primary hover:bg-primary/5",
        isSelected && "border-primary bg-primary/10 ring-2 ring-primary/10",
        disabled &&
          "cursor-not-allowed opacity-60 hover:border-border hover:bg-white",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground",
            isSelected && "bg-primary text-primary-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="font-heading text-xl leading-none">{title}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}
