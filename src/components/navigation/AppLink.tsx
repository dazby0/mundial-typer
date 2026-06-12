"use client";

import Link, { type LinkProps } from "next/link";
import { type AnchorHTMLAttributes, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { useNavigationLoading } from "./NavigationLoadingProvider";

type AppLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: React.ReactNode;
  };

function getHrefValue(href: LinkProps["href"]) {
  if (typeof href === "string") {
    return href;
  }

  return href.pathname ?? "";
}

function getHrefPathname(hrefValue: string) {
  return hrefValue.split("?")[0].split("#")[0];
}

export function AppLink({
  href,
  children,
  onClick,
  target,
  ...props
}: AppLinkProps) {
  const pathname = usePathname();
  const { startLoading } = useNavigationLoading();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) return;
    if (target === "_blank") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;

    const hrefValue = getHrefValue(href);
    const hrefPathname = getHrefPathname(hrefValue);

    if (!hrefPathname) return;
    if (hrefPathname === pathname) return;
    if (hrefPathname.startsWith("#")) return;
    if (hrefPathname.startsWith("http")) return;

    startLoading(hrefPathname);
  };

  return (
    <Link href={href} target={target} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
