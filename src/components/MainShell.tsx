"use client";

import { usePathname } from "next/navigation";
import PageTransition from "./PageTransition";
import { useIsNarrowViewport } from "@/hooks/useIsNarrowViewport";

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullBleed = pathname === "/";
  const isNarrow = useIsNarrowViewport();

  // Below 760px, NotchNav swaps its fixed-top hover dock (100px clearance)
  // for a slimmer 60px top bar plus a new fixed bottom tab bar — page
  // content needs matching top/bottom clearance instead of the desktop
  // value. Desktop's paddingTop: 100 (and 0 for the full-bleed landing
  // page, on both breakpoints) is unchanged.
  const paddingTop = isFullBleed ? 0 : isNarrow ? 72 : 100;
  const paddingBottom = isFullBleed || !isNarrow ? 0 : 84;

  return (
    <main style={{ paddingTop, paddingBottom }}>
      {isFullBleed ? children : <PageTransition>{children}</PageTransition>}
    </main>
  );
}
