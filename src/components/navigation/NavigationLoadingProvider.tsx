"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AppLoader,
  getRandomLoadingText,
  loadingTexts,
} from "../shared/AppLoader";

type NavigationLoadingContextValue = {
  startLoading: (targetPathname?: string) => void;
  stopLoading: () => void;
};

type LoadingState = {
  isLoading: boolean;
  targetPathname: string | null;
  text: string;
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

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    targetPathname: null,
    text: loadingTexts[0],
  });

  const hasReachedTarget =
    !!loadingState.targetPathname && pathname === loadingState.targetPathname;

  const shouldShowLoader =
    FORCE_LOADER_VISIBLE || (loadingState.isLoading && !hasReachedTarget);

  const value = useMemo(
    () => ({
      startLoading: (targetPathname?: string) => {
        setLoadingState({
          isLoading: true,
          targetPathname: targetPathname ?? null,
          text: getRandomLoadingText(),
        });
      },
      stopLoading: () => {
        setLoadingState((currentState) => ({
          ...currentState,
          isLoading: false,
          targetPathname: null,
        }));
      },
    }),
    [],
  );

  useEffect(() => {
    if (!loadingState.isLoading || FORCE_LOADER_VISIBLE) return;

    const timeout = window.setTimeout(() => {
      setLoadingState((currentState) => ({
        ...currentState,
        isLoading: false,
        targetPathname: null,
      }));
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, [loadingState.isLoading]);

  return (
    <NavigationLoadingContext.Provider value={value}>
      {children}

      {shouldShowLoader && <AppLoader text={loadingState.text} />}
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
