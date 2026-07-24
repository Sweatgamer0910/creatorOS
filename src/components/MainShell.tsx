"use client";

import { usePathname } from "next/navigation";
import PageTransition from "./PageTransition";

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullBleed = pathname === "/";

  return (
    <main style={{ paddingTop: isFullBleed ? 0 : 100 }}>
      {isFullBleed ? children : <PageTransition>{children}</PageTransition>}
    </main>
  );
}
