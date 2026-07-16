"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import Button from "@/components/ui/button";

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
      router.push(`/analytics?${params.toString()}`);
    });
    setTimeout(() => setPendingScenario(null), 400);
  }

  return (
    <div className="flex items-center gap-2 mb-3">
      {scenarios.map((s) => (
        <Button
          key={s}
          size="sm"
          variant={current === s ? "primary" : "secondary"}
          onClick={() => handleClick(s)}
        >
          {pendingScenario === s ? <Spinner size={12} variant="dark" /> : null}
          {s}
        </Button>
      ))}
    </div>
  );
}
