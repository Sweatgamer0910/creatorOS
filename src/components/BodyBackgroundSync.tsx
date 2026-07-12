"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BodyBackgroundSync() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.backgroundColor = pathname === "/" ? "#000000" : "";
  }, [pathname]);

  return null;
}
