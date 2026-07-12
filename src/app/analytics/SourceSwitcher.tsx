"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function SourceSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [pendingSource, setPendingSource] = useState<string | null>(null);

  function handleClick(source: string) {
    setPendingSource(source);
    const params = new URLSearchParams(searchParams.toString());
    params.set("source", source);
    startTransition(() => {
      router.push(`/analytics?${params.toString()}`);
    });
    setTimeout(() => setPendingSource(null), 400);
  }

  const options = [
    { value: "mock", label: "Mock Data" },
    { value: "real", label: "Real YouTube Data" },
  ];

  return (
    <div className="flex items-center gap-2 mb-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleClick(opt.value)}
          className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
          style={{
            backgroundColor:
              current === opt.value
                ? "var(--color-accent)"
                : "var(--color-surface)",
            color: current === opt.value ? "#0e1116" : "var(--color-text)",
            border: "1px solid var(--color-border)",
          }}
        >
          {pendingSource === opt.value ? (
            <Spinner size={12} variant="dark" />
          ) : null}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
