"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminKnockoutThirdPlaceOption } from "@/src/features/admin/types/admin-knockout.types";
import { AdminKnockoutTeamFlag } from "./AdminKnockoutTeamCard";

type AdminKnockoutThirdPlaceSelectProps = {
  matchCode: string;
  slotSide: "home" | "away";
  slotLabel: string;
  value: string;
  options: AdminKnockoutThirdPlaceOption[];
  onChange: (
    matchCode: string,
    slotSide: "home" | "away",
    teamId: string,
  ) => void;
};

export function AdminKnockoutThirdPlaceSelect({
  matchCode,
  slotSide,
  slotLabel,
  value,
  options,
  onChange,
}: AdminKnockoutThirdPlaceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption =
    options.find((option) => option.team_id === value) || null;

  return (
    <div className="relative rounded-3xl border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {slotLabel}
      </p>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border bg-background px-4 py-3 text-left transition hover:border-primary/60",
          isOpen && "border-primary ring-2 ring-primary/10",
        )}
      >
        {selectedOption ? (
          <div className="flex min-w-0 items-center gap-3">
            <AdminKnockoutTeamFlag
              flagCode={selectedOption.flag_code}
              name={selectedOption.name_pl || selectedOption.name_en}
            />

            <div className="min-w-0">
              <p className="truncate font-heading text-lg leading-none">
                {selectedOption.name_pl || selectedOption.name_en}
              </p>

              <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
                {selectedOption.code} · 3. miejsce #
                {selectedOption.third_place_rank}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-12 items-center justify-center rounded-xl border border-dashed bg-muted/50 text-xs font-bold text-muted-foreground">
              ?
            </div>

            <div>
              <p className="font-heading text-lg leading-none">
                Wybierz drużynę
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Dostępne zakwalifikowane 3. miejsca
              </p>
            </div>
          </div>
        )}

        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-4 right-4 top-[calc(100%-0.75rem)] z-30 overflow-hidden rounded-3xl border bg-white shadow-xl">
          <div className="max-h-72 overflow-y-auto p-2">
            {options.length === 0 ? (
              <div className="rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                Brak dostępnych opcji dla tego slotu.
              </div>
            ) : (
              options.map((option) => {
                const isSelected = option.team_id === value;
                const optionName = option.name_pl || option.name_en;
                const groupLetter = option.group_name.replace("Group ", "");

                return (
                  <button
                    key={option.team_id}
                    type="button"
                    onClick={() => {
                      onChange(matchCode, slotSide, option.team_id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-background",
                      isSelected && "bg-primary/10",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <AdminKnockoutTeamFlag
                        flagCode={option.flag_code}
                        name={optionName}
                      />

                      <div className="min-w-0">
                        <p className="truncate font-semibold">{optionName}</p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {option.code} · Grupa {groupLetter} · {option.points}{" "}
                          pkt · bilans {option.goal_difference}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
