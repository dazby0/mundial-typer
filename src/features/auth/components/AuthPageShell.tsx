import Link from "next/link";
import { Beer, Trophy } from "lucide-react";

type AuthPageShellProps = {
  title: string;
  description: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  children: React.ReactNode;
};

export function AuthPageShell({
  title,
  description,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  children,
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_460px]">
        <div className="absolute inset-x-6 top-6 h-72 rounded-[3rem]" />

        <div className="relative z-10 hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm shadow-sm">
            <Trophy className="h-4 w-4 text-primary" />
            Mundial 2026 • liga znajomych
          </div>

          <h1 className="max-w-2xl text-7xl font-black uppercase leading-[0.92] tracking-tight">
            Tu się rodzą legendy. Albo memy.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Typuj wyniki, sprawdzaj ranking i pamiętaj: każdy punkt lidera to
            jedna butelka piwa do odebrania. Presja większa niż przy karnym w
            90. minucie.
          </p>

          <div className="mt-8 flex items-center gap-4 rounded-3xl bg-foreground p-5 text-background shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Beer className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">Nagroda główna</p>
              <p className="text-sm text-background/70">
                Tyle piw, ile punktów zdobędzie zwycięzca.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 rounded-[2rem] border bg-white p-6 shadow-2xl shadow-black/10 sm:p-8">
          <div className="mb-8">
            <Link href="/" className="mb-6 inline-block text-sm text-primary">
              ← Powrót na stronę główną
            </Link>

            <h2 className="text-4xl font-black uppercase tracking-tight">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          {children}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link href={footerLinkHref} className="font-medium text-primary">
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
