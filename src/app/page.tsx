import Link from "next/link";
import { Beer, CalendarDays, Trophy, UsersRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const highlights = [
  {
    title: "Typujesz wynik",
    description:
      "Wpisujesz 2:1, udajesz eksperta i modlisz się, żeby bramkarz nie zrobił cyrku w 90. minucie.",
    icon: CalendarDays,
  },
  {
    title: "Ranking nie wybacza",
    description:
      "Tabela prawdy pokazuje, kto zna piłkę, a kto tylko najgłośniej krzyczał przy grillu.",
    icon: Trophy,
  },
  {
    title: "Typy po gwizdku",
    description:
      "Po starcie meczu odkrywamy typy znajomych. Idealny moment na screeny i bezczelne komentarze.",
    icon: UsersRound,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-8">
        <div className="absolute inset-x-4 top-6 h-72 rounded-[3rem] sm:inset-x-6" />

        <header className="relative z-10 flex items-center justify-between gap-2 rounded-full border bg-white/80 px-3 py-2 shadow-sm backdrop-blur sm:px-5 sm:py-3">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background sm:h-10 sm:w-10">
              26
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-sm leading-none sm:text-lg">
                Mundial Typer
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Liga piwna 2026
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="hidden text-xs sm:inline-flex sm:text-sm"
            >
              <Link href="/login">Logowanie</Link>
            </Button>
            <Button asChild className="rounded-full text-xs sm:text-sm">
              <Link href="/register">Wbijam</Link>
            </Button>
          </div>
        </header>

        <div className="relative z-10 grid flex-1 items-center gap-8 py-8 sm:py-12 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <Badge className="mb-4 rounded-full bg-white px-3 py-1 text-xs text-foreground shadow-sm hover:bg-white sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
              Mundial 2026 • znajomi • typy • piwo
            </Badge>

            <h1 className="max-w-4xl text-3xl font-black uppercase leading-[0.92] tracking-tight sm:text-4xl md:text-5xl lg:text-8xl">
              Typuj jak selekcjoner.
              <span className="block text-primary">Płać jak przegrany.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-7 sm:text-lg sm:leading-8">
              Prywatna liga typerów na fazę grupową Mundialu 2026. Zasady są
              proste: trafiasz wynik, zbierasz punkty, a zwycięzca zgarnia tyle
              butelek piwa, ile nastukał punktów.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:gap-3 sm:flex-row md:mt-9">
              <Button
                asChild
                size="sm"
                className="rounded-full px-6 text-xs sm:size-lg sm:px-8 sm:text-base"
              >
                <Link href="/register">Zakładam konto</Link>
              </Button>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full bg-white px-6 text-xs sm:size-lg sm:px-8 sm:text-base"
              >
                <Link href="/login">Mam już konto</Link>
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium sm:mt-8 sm:gap-3 sm:text-sm">
              <span className="rounded-full bg-white px-3 py-1.5 shadow-sm sm:px-4 sm:py-2">
                3 pkt dokładny wynik
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 shadow-sm sm:px-4 sm:py-2">
                1 pkt zwycięzca/remis
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 shadow-sm sm:px-4 sm:py-2">
                0 pkt za zapominalstwo
              </span>
            </div>
          </div>

          <div className="relative">
            <Card className="rotate-1 border-0 bg-foreground text-background shadow-2xl">
              <CardContent className="p-5 sm:p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-background/60 sm:text-sm">
                  Nagroda główna
                </p>

                <div className="mt-5 flex items-end gap-3 sm:mt-8 sm:gap-4">
                  <span className="font-heading text-5xl leading-none sm:text-8xl">
                    P
                  </span>
                  <div className="pb-2 sm:pb-3">
                    <p className="text-lg font-black sm:text-2xl">punktów</p>
                    <p className="text-xs sm:text-sm text-background/70">
                      = butelek piwa
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl bg-white/10 p-4 sm:mt-8 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground sm:h-14 sm:w-14">
                      <Beer className="h-5 w-5 sm:h-7 sm:w-7" />
                    </div>
                    <p className="text-xs leading-5 text-background/80 sm:text-sm sm:leading-6">
                      Zwycięzca nie tylko ma rację. Zwycięzca ma zapas w
                      lodówce.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-primary p-3 text-primary-foreground shadow-xl sm:-bottom-6 sm:-left-6 sm:rounded-3xl sm:p-5 md:block">
              <p className="font-heading text-3xl sm:text-4xl">72</p>
              <p className="text-xs sm:text-sm">mecze fazy grupowej</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-3 pb-6 sm:gap-4 sm:pb-10 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="border-0 bg-white shadow-sm">
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:mb-4 sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    {item.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
