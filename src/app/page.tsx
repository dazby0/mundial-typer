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
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <div className="absolute inset-x-6 top-6 h-72 rounded-[3rem]" />

        <header className="relative z-10 flex items-center justify-between rounded-full border bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
              26
            </div>
            <div>
              <p className="font-heading text-lg leading-none">Mundial Typer</p>
              <p className="text-xs text-muted-foreground">Liga piwna 2026</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Logowanie</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/register">Wbijam</Link>
            </Button>
          </div>
        </header>

        <div className="relative z-10 grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge className="mb-6 rounded-full bg-white px-4 py-2 text-foreground shadow-sm hover:bg-white">
              Mundial 2026 • znajomi • typy • piwo
            </Badge>

            <h1 className="max-w-4xl text-6xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
              Typuj jak selekcjoner.
              <span className="block text-primary">Płać jak przegrany.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
              Prywatna liga typerów na fazę grupową Mundialu 2026. Zasady są
              proste: trafiasz wynik, zbierasz punkty, a zwycięzca zgarnia tyle
              butelek piwa, ile nastukał punktów.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8 text-base">
                <Link href="/register">Zakładam konto</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full bg-white px-8 text-base"
              >
                <Link href="/login">Mam już konto</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                3 pkt dokładny wynik
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                1 pkt zwycięzca/remis
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                0 pkt za zapominalstwo
              </span>
            </div>
          </div>

          <div className="relative">
            <Card className="rotate-1 border-0 bg-foreground text-background shadow-2xl">
              <CardContent className="p-8">
                <p className="text-sm uppercase tracking-[0.3em] text-background/60">
                  Nagroda główna
                </p>

                <div className="mt-8 flex items-end gap-4">
                  <span className="font-heading text-8xl leading-none">P</span>
                  <div className="pb-3">
                    <p className="text-2xl font-black">punktów</p>
                    <p className="text-background/70">= butelek piwa</p>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl bg-white/10 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <Beer className="h-7 w-7" />
                    </div>
                    <p className="text-sm leading-6 text-background/80">
                      Zwycięzca nie tylko ma rację. Zwycięzca ma zapas w
                      lodówce.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="absolute -bottom-6 -left-6 hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-xl md:block">
              <p className="font-heading text-4xl">72</p>
              <p className="text-sm">mecze fazy grupowej</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-4 pb-10 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="border-0 bg-white shadow-sm">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
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
