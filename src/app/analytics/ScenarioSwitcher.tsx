"use client";

import { useRouter } from "next/navigation";

export default function ScenarioSwitcher({ current }: { current: string }) {
  const router = useRouter();

  const scenarios = ["growing", "declining", "new"];

  return (
    <div style={{ marginBottom: 20 }}>
      {scenarios.map((s) => (
        <button
          key={s}
          onClick={() => router.push(`/analytics?scenario=${s}`)}
          style={{
            marginRight: 10,
            padding: "6px 12px",
            fontWeight: current === s ? 700 : 400,
            border: current === s ? "2px solid black" : "1px solid #ccc",
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
