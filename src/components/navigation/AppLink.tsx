"use client";

import Link, { type LinkProps } from "next/link";
import { type AnchorHTMLAttributes, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { useNavigationLoading } from "./NavigationLoadingProvider";

type AppLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: React.ReactNode;
  };

export function AppLink({
  href,
  children,
  onClick,
  target,
  ...props
}: AppLinkProps) {
  const pathname = usePathname();
  const { startLoading } = useNavigationLoading();

  const getHrefValue = (hrefValue: LinkProps["href"]) => {
    if (typeof hrefValue === "string") {
      return hrefValue;
    }

    return hrefValue.pathname ?? "";
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) return;
    if (target === "_blank") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;

    const hrefValue = getHrefValue(href);

    if (!hrefValue) return;
    if (hrefValue === pathname) return;
    if (hrefValue.startsWith("#")) return;
    if (hrefValue.startsWith("http")) return;

    startLoading();
  };

  return (
    <Link href={href} target={target} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
