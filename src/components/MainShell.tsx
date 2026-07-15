"use client";

import { usePathname } from "next/navigation";

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullBleed = pathname === "/";

  return (
    <main style={{ paddingTop: isFullBleed ? 0 : 100 }}>{children}</main>
  );
}
