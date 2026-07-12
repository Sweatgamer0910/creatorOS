"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function ScenarioSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [pendingScenario, setPendingScenario] = useState<string | null>(null);
  const scenarios = ["growing", "declining", "new"];

  function handleClick(s: string) {
    setPendingScenario(s);
    const params = new URLSearchParams(searchParams.toString());
    params.set("scenario", s);
    startTransition(() => {
      router.push(`/coach?${params.toString()}`);
    });
    setTimeout(() => setPendingScenario(null), 400);
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      {scenarios.map((s) => (
        <button
          key={s}
          onClick={() => handleClick(s)}
          className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
          style={{
            backgroundColor:
              current === s ? "var(--color-accent)" : "var(--color-surface)",
            color: current === s ? "#0e1116" : "var(--color-text)",
            border: "1px solid var(--color-border)",
          }}
        >
          {pendingScenario === s ? <Spinner size={12} variant="dark" /> : null}
          {s}
        </button>
      ))}
    </div>
  );
}
