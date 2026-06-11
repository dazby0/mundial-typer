"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Beer,
  CalendarDays,
  Home,
  Shield,
  Table2,
  Trophy,
  ClipboardList,
  Flag,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/src/features/auth/components/LogoutButton";

type AppSidebarProps = {
  username: string;
  role: "user" | "admin";
};

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Mecze",
    href: "/matches",
    icon: CalendarDays,
  },
  {
    label: "Tabele grupowe",
    href: "/groups",
    icon: Table2,
  },
  {
    label: "Ranking",
    href: "/ranking",
    icon: Trophy,
  },
  {
    label: "Wyniki",
    href: "/results",
    icon: Flag,
  },
  {
    label: "Moje typy",
    href: "/predictions",
    icon: ClipboardList,
  },
  {
    href: "/tournament-predictions",
    label: "Typy turniejowe",
    icon: Crown,
  },
];

export function AppSidebar({ username, role }: AppSidebarProps) {
  const pathname = usePathname();

  const userInitial = username.slice(0, 1).toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r bg-white p-5 lg:flex lg:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-background">
          <Trophy className="h-8 w-8 text-amber-400" />
        </div>

        <div>
          <p className="font-heading text-xl leading-none">Mundial Typer</p>
          <p className="text-xs text-muted-foreground">Liga piwna 2026</p>
        </div>
      </Link>

      <div className="mt-8 rounded-3xl bg-background p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {userInitial}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold">{username}</p>
            <p className="text-xs text-muted-foreground">
              {role === "admin" ? "Admin ligi" : "Zawodnik ligi"}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {role === "admin" ? (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
              pathname.startsWith("/admin")
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <Shield className="h-4 w-4" />
            Panel admina
          </Link>
        ) : null}
      </nav>

      <div className="mt-auto rounded-3xl bg-amber-100 p-4 text-amber-950">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300">
            <Beer className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold">Przypominajka</p>
            <p className="text-xs text-amber-900/75">
              Każdy punkt lidera to jedno piwo.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
