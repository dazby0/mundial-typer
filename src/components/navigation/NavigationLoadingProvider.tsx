"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppLoader } from "../shared/AppLoader";

type NavigationLoadingContextValue = {
  startLoading: () => void;
  stopLoading: () => void;
};

const NavigationLoadingContext =
  createContext<NavigationLoadingContextValue | null>(null);

const FORCE_LOADER_VISIBLE = false;

export function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const shouldShowLoader = isLoading || FORCE_LOADER_VISIBLE;

  const value = useMemo(
    () => ({
      startLoading: () => setIsLoading(true),
      stopLoading: () => setIsLoading(false),
    }),
    [],
  );

  useEffect(() => {
    if (FORCE_LOADER_VISIBLE) return;

    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading || FORCE_LOADER_VISIBLE) return;

    const timeout = window.setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, [isLoading]);

  return (
    <NavigationLoadingContext.Provider value={value}>
      {children}

      {shouldShowLoader && <AppLoader />}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);

  if (!context) {
    throw new Error(
      "useNavigationLoading must be used within NavigationLoadingProvider",
    );
  }

  return context;
}
