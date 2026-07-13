"use client";

import { useState } from "react";
import Card from "./Card";

export default function InteractiveCard({
  children,
  onClick,
  className = "",
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: onClick ? "pointer" : "default",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.2s ease",
      }}
    >
      <Card
        className={className}
        style={{
          borderColor: hovered ? "var(--color-accent)" : "var(--color-border)",
          boxShadow: hovered ? "0 8px 24px -8px rgba(245,166,35,0.25)" : "none",
          ...style,
        }}
      >
        {children}
      </Card>
    </div>
  );
}
