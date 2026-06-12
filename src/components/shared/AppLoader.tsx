"use client";

import { useMemo } from "react";
import Image from "next/image";
import logo from "@/src/app/icon.png";

const loadingTexts = [
  "Sprawdzamy typy ekspertów od kanapy...",
  "Liczymy punkty i wymówki...",
  "Rozgrzewamy VAR...",
  "Ładujemy tabelę hańby...",
  "Sprawdzamy, kto znowu uwierzył w underdoga...",
];

export function AppLoader() {
  const text = useMemo(() => {
    return loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
  }, []);

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background/95 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-5 shadow-xl">
        <div className="rounded-[1.5rem] bg-foreground p-6 text-background">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5 flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-background/20 blur-xl" />

              <div className="absolute inset-0 rounded-full border-4 border-background/15" />

              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-background border-r-background/70" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-sm">
                <Image
                  src={logo}
                  alt="Mundial Typer"
                  width={52}
                  height={52}
                  priority
                  className="h-13 w-13 object-contain"
                />
              </div>
            </div>

            <p className="mb-3 rounded-full bg-background px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-foreground">
              Mundial Typer 2026
            </p>

            <h2 className="text-3xl font-black uppercase tracking-tight">
              Ładujemy boisko...
            </h2>

            <p className="mt-3 max-w-sm text-sm text-background/70">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
