"use client";

import { CalendarDays } from "lucide-react";
import { Button } from "@/src/components/ui/button";

type TodayMatchesFloatingButtonProps = {
  targetDateKey: string | null;
};

export function TodayMatchesFloatingButton({
  targetDateKey,
}: TodayMatchesFloatingButtonProps) {
  function scrollToTargetDate() {
    if (!targetDateKey) {
      return;
    }

    const element = document.getElementById(`match-day-${targetDateKey}`);

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (!targetDateKey) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <Button
        type="button"
        onClick={scrollToTargetDate}
        className="rounded-full px-5 py-6 shadow-lg"
      >
        <CalendarDays className="h-4 w-4" />
        Dzisiejsze mecze
      </Button>
    </div>
  );
}
