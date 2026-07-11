"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export default function LockedFeature({
  children,
  label = "Requires AI access",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          opacity: 0.5,
          pointerEvents: "none",
          filter: "grayscale(30%)",
        }}
      >
        {children}
      </div>

      <div
        style={{
          position: "absolute",
          top: -8,
          right: -8,
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Lock size={12} color="var(--color-text-muted)" />
      </div>

      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "6px 10px",
            borderRadius: 6,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            fontSize: 12,
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {label} — coming soon
        </div>
      )}
    </div>
  );
}
