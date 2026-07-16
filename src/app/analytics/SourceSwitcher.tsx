"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import Button from "@/components/ui/button";

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
        <Button
          key={opt.value}
          size="sm"
          variant={current === opt.value ? "primary" : "secondary"}
          onClick={() => handleClick(opt.value)}
        >
          {pendingSource === opt.value ? (
            <Spinner size={12} variant="dark" />
          ) : null}
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
