"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamFlag } from "@/src/features/teams/components/TeamFlag";
import { MatchListItem } from "@/src/features/matches/types/match.types";
import {
  formatGroupName,
  formatMatchDate,
  formatMatchTime,
} from "@/src/features/matches/utils/match-formatters";
import { AppLink } from "@/src/components/navigation/AppLink";

type NextMissingPredictionCardProps = {
  match: MatchListItem | null;
  todayMissingCount: number;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

function getTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - new Date().getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

function formatTimePart(value: number) {
  return String(value).padStart(2, "0");
}

export function NextMissingPredictionCard({
  match,
  todayMissingCount,
}: NextMissingPredictionCardProps) {
  const kickoffDate = useMemo(() => {
    if (!match) {
      return null;
    }

    return new Date(match.kickoff_time);
  }, [match]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    if (!kickoffDate) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false,
      };
    }

    return getTimeLeft(kickoffDate);
  });

  useEffect(() => {
    if (!kickoffDate) {
      return;
    }

    setTimeLeft(getTimeLeft(kickoffDate));

    const intervalId = window.setInterval(() => {
      setTimeLeft(getTimeLeft(kickoffDate));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [kickoffDate]);

  if (!match) {
    return (
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xl font-black">Nie ma zaległych typów</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Wszystko ogarnięte. Podejrzanie profesjonalnie, ale nie będziemy
              psuć atmosfery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-foreground p-4 text-background shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background text-foreground">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-background/60">
                Najbliższy brak typu
              </p>

              <h2 className="mt-1 text-lg font-black sm:text-2xl">
                Ratuj honor, zanim zamkną bramkę
              </h2>

              <p className="mt-2 text-sm text-background/70">
                {todayMissingCount > 0
                  ? `Dzisiaj masz ${todayMissingCount} mecze bez typu. To już nie jest planowanie, to gaszenie pożaru.`
                  : "Ten mecz jest najbliżej bez Twojego typu. Jeszcze możesz udawać, że to była przemyślana decyzja."}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <TeamFlag
                name={match.home_team_name_pl}
                flagCode={match.home_team_flag_code}
                flagEmoji={match.home_team_flag_emoji}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-black sm:text-base">
                  {match.home_team_name_pl}
                </p>
                <p className="text-xs text-background/60">
                  {match.home_team_code}
                </p>
              </div>
            </div>

            <div className="text-center font-heading text-2xl text-background/50">
              VS
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-black sm:text-base">
                  {match.away_team_name_pl}
                </p>
                <p className="text-xs text-background/60">
                  {match.away_team_code}
                </p>
              </div>

              <TeamFlag
                name={match.away_team_name_pl}
                flagCode={match.away_team_flag_code}
                flagEmoji={match.away_team_flag_emoji}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-background/70 sm:text-sm">
            <span className="rounded-full bg-background/10 px-3 py-1.5">
              {formatGroupName(match.group_name)}
            </span>

            <span className="rounded-full bg-background/10 px-3 py-1.5">
              {formatMatchDate(match.kickoff_time)},{" "}
              {formatMatchTime(match.kickoff_time)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-1 flex-col justify-center rounded-3xl border border-background/10 bg-background/10 p-4">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-background/60">
              <Clock className="h-4 w-4" />
              Do zamknięcia typowania
            </div>

            {timeLeft.isExpired ? (
              <p className="mt-3 text-center text-sm font-bold text-background">
                Typowanie powinno być już zamknięte.
              </p>
            ) : (
              <div className="mt-3 flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-1.5">
                {timeLeft.days > 0 ? (
                  <>
                    <div className="rounded-2xl bg-background px-3 py-2 text-center text-foreground shadow-sm">
                      <p className="font-heading text-xl">
                        {formatTimePart(timeLeft.days)}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        dni
                      </p>
                    </div>

                    <span className="font-heading text-xl text-background/50">
                      :
                    </span>
                  </>
                ) : null}

                <div className="rounded-2xl bg-background px-3 py-2 text-center text-foreground shadow-sm">
                  <p className="font-heading text-xl">
                    {formatTimePart(timeLeft.hours)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    godz.
                  </p>
                </div>

                <span className="font-heading text-xl text-background/50">
                  :
                </span>

                <div className="rounded-2xl bg-background px-3 py-2 text-center text-foreground shadow-sm">
                  <p className="font-heading text-xl">
                    {formatTimePart(timeLeft.minutes)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    min.
                  </p>
                </div>

                <span className="font-heading text-xl text-background/50">
                  :
                </span>

                <div className="rounded-2xl bg-background px-3 py-2 text-center text-foreground shadow-sm">
                  <p className="font-heading text-xl">
                    {formatTimePart(timeLeft.seconds)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    sek.
                  </p>
                </div>
              </div>
            )}

            {!timeLeft.isExpired ? (
              <p className="mt-3 text-center text-xs text-background/60">
                Po pierwszym gwizdku zostaje już tylko udawanie, że zapomniałeś
                celowo.
              </p>
            ) : null}
          </div>

          <Button
            asChild
            className="w-full rounded-full bg-background text-foreground hover:bg-background/90"
          >
            <AppLink href={`/matches/${match.id}`}>Obstaw teraz</AppLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
