"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Beer,
  CalendarDays,
  Home,
  Shield,
  Table2,
  Trophy,
  ClipboardList,
  Flag,
  Crown,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/src/features/auth/components/LogoutButton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Image from "next/image";
import logo from "@/src/app/icon.png";
import { AppLink } from "../navigation/AppLink";

type MobileHeaderProps = {
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
    label: "Drabinka",
    href: "/knockout",
    icon: GitBranch,
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

export function MobileHeader({ username, role }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const userInitial = username.slice(0, 1).toUpperCase();

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <AppLink href="/dashboard" className="flex items-center gap-3">
            <Image src={logo} alt="Mundial Typer" width={48} height={48} />

            <div>
              <p className="font-heading text-lg leading-none">Mundial Typer</p>
              <p className="text-xs text-muted-foreground">{username}</p>
            </div>
          </AppLink>

          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg p-2 hover:bg-background"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-full flex-col p-5">
            <div className="mt-6 rounded-3xl bg-background p-4">
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

            <nav className="mt-6 space-y-1 ">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <AppLink
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-background hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </AppLink>
                );
              })}

              {role === "admin" ? (
                <AppLink
                  href="/admin"
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    pathname.startsWith("/admin")
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Panel admina
                </AppLink>
              ) : null}
            </nav>

            <div className="rounded-3xl bg-amber-100 p-4 text-amber-950 mt-6">
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
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
