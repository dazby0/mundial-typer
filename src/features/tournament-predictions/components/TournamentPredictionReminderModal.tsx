"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Clock, Trophy, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppLink } from "@/src/components/navigation/AppLink";

type TournamentPredictionReminderModalProps = {
  shouldShow: boolean;
};

type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

function getTodayDeadline() {
  const deadline = new Date();

  deadline.setHours(23, 59, 59, 999);

  return deadline;
}

function getTimeLeft(deadline: Date): TimeLeft {
  const difference = deadline.getTime() - new Date().getTime();

  if (difference <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

function formatTimePart(value: number) {
  return String(value).padStart(2, "0");
}

export function TournamentPredictionReminderModal({
  shouldShow,
}: TournamentPredictionReminderModalProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const deadline = useMemo(() => getTodayDeadline(), []);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(deadline),
  );

  const storageKey = useMemo(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    return `tournament-prediction-reminder-dismissed-${todayKey}`;
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimeLeft(getTimeLeft(deadline));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [deadline]);

  useEffect(() => {
    if (!shouldShow || pathname === "/tournament-predictions") {
      return;
    }

    const dismissedToday = sessionStorage.getItem(storageKey);

    if (!dismissedToday) {
      setIsOpen(true);
    }
  }, [shouldShow, pathname, storageKey]);

  function handleClose() {
    sessionStorage.setItem(storageKey, "true");
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="overflow-hidden rounded-3xl border-border/70 bg-background p-0 sm:max-w-lg">
        <div className="relative">
          <div className="bg-linear-to-br from-primary/20 via-background to-background px-6 pb-6 pt-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Trophy className="h-7 w-7" />
            </div>

            <DialogHeader className="mt-5 text-left">
              <DialogTitle className="font-heading text-2xl leading-tight">
                Typy turniejowe same się nie klikną
              </DialogTitle>

              <DialogDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
                Nie masz jeszcze zapisanych typów turniejowych. Admin przedłużył
                okienko dla spóźnialskich i niezorganizowanych - czas jest tylko
                do dzisiaj do północy.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                <Clock className="h-4 w-4" />
                Czas do zamknięcia typów
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="rounded-2xl bg-background px-4 py-3 text-center shadow-sm">
                  <p className="font-heading text-2xl">
                    {formatTimePart(timeLeft.hours)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    godz.
                  </p>
                </div>

                <span className="font-heading text-2xl text-primary">:</span>

                <div className="rounded-2xl bg-background px-4 py-3 text-center shadow-sm">
                  <p className="font-heading text-2xl">
                    {formatTimePart(timeLeft.minutes)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    min.
                  </p>
                </div>

                <span className="font-heading text-2xl text-primary">:</span>

                <div className="rounded-2xl bg-background px-4 py-3 text-center shadow-sm">
                  <p className="font-heading text-2xl">
                    {formatTimePart(timeLeft.seconds)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    sek.
                  </p>
                </div>
              </div>

              {timeLeft.isExpired ? (
                <p className="mt-3 text-sm text-destructive">
                  Czas minął. Jeśli to widzisz, admin właśnie ma problem do
                  rozwiązania.
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground text-center">
                  Po północy formularz powinien zostać zamknięty. Potem zostaje
                  już tylko żałowanie.
                </p>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-border/70 bg-background/80 p-4 text-sm leading-relaxed text-muted-foreground">
              Do zgarnięcia są bonusowe punkty za mistrza, finalistów, króla
              strzelców i inne typy, które później będą wyglądały jak genialna
              analiza albo kompletna kompromitacja.
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full" onClick={handleClose}>
                <AppLink href="/tournament-predictions">
                  Przejdź do typów turniejowych
                </AppLink>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-full"
              >
                Przypomnij mi później
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
