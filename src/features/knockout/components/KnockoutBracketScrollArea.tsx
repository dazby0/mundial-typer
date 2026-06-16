"use client";

import { MouseEvent, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { KnockoutMatchPreview } from "../types/knockout.types";
import {
  KnockoutBracketBoard,
  KNOCKOUT_BRACKET_BOARD_WIDTH,
} from "./KnockoutBracketBoard";

type KnockoutBracketScrollAreaProps = {
  matches: KnockoutMatchPreview[];
};

export function KnockoutBracketScrollArea({
  matches,
}: KnockoutBracketScrollAreaProps) {
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const bracketScrollRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  const handleTopScroll = () => {
    if (!topScrollRef.current || !bracketScrollRef.current) {
      return;
    }

    bracketScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
  };

  const handleBracketScroll = () => {
    if (!topScrollRef.current || !bracketScrollRef.current) {
      return;
    }

    topScrollRef.current.scrollLeft = bracketScrollRef.current.scrollLeft;
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!bracketScrollRef.current) {
      return;
    }

    const target = event.target as HTMLElement;
    const isCardClick = target.closest("[data-bracket-node='true']");

    if (isCardClick) {
      return;
    }

    setIsDragging(true);
    dragStartX.current = event.pageX;
    dragStartScrollLeft.current = bracketScrollRef.current.scrollLeft;
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !bracketScrollRef.current) {
      return;
    }

    event.preventDefault();

    const dragDistance = event.pageX - dragStartX.current;
    bracketScrollRef.current.scrollLeft =
      dragStartScrollLeft.current - dragDistance;
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative mt-8 rounded-[2rem] bg-white p-4 shadow-sm md:p-6">
      <div className="pointer-events-none absolute right-0 top-0 z-30 h-full w-12 rounded-r-[2rem] bg-linear-to-l from-white to-transparent md:w-20" />

      <div
        ref={topScrollRef}
        onScroll={handleTopScroll}
        className="bracket-scrollbar mb-4 overflow-x-auto overflow-y-hidden pb-2"
      >
        <div
          style={{
            width: KNOCKOUT_BRACKET_BOARD_WIDTH,
          }}
          className="h-1"
        />
      </div>

      <div
        ref={bracketScrollRef}
        onScroll={handleBracketScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={cn(
          "bracket-scrollbar select-none overflow-x-auto pb-4",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        <KnockoutBracketBoard matches={matches} />
      </div>
    </div>
  );
}
