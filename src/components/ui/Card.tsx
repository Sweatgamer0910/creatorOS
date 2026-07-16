"use client";

import { spacing, radius } from "@/lib/design-tokens";

type Variant = "flat" | "glass";
type Padding = "sm" | "md" | "lg";
type GlowColor = "amber" | "teal";

interface CardProps {
  children: React.ReactNode;
  variant?: Variant;
  padding?: Padding;
  className?: string;
  style?: React.CSSProperties;
  accentBorder?: string;
  /** Makes the card a real, focusable, keyboard-operable control
   *  (role="button", Enter/Space activate it) — auto-enabled when
   *  `onClick` is passed. Every card gets the signature hover glow
   *  regardless of this flag (it's a visual treatment, not a claim about
   *  interactivity); this only controls whether the card ALSO becomes a
   *  real button for keyboard/screen-reader users. Set explicitly to
   *  `false` to suppress that on a clickable card in the rare case
   *  that's wrong (there isn't one today). */
  interactive?: boolean;
  onClick?: () => void;
  /** Which accent the hover/focus glow uses. */
  glowColor?: GlowColor;
}

const paddingMap: Record<Padding, number> = {
  sm: spacing.base,
  md: spacing.lg,
  lg: spacing.xl,
};

// The two surface treatments, exported so components that need the same
// glass/flat look but not Card's own padding/interactivity contract (e.g.
// GlassPanel, which lets callers control padding via className) can reuse
// the exact values instead of re-declaring them.
export const cardSurfaceStyle: Record<Variant, React.CSSProperties> = {
  flat: {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
  },
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
};

export default function Card({
  children,
  variant = "flat",
  padding = "md",
  className = "",
  style,
  accentBorder,
  interactive,
  onClick,
  glowColor = "amber",
}: CardProps) {
  const isInteractive = interactive ?? Boolean(onClick);
  const baseStyle = cardSurfaceStyle[variant];

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      className={[
        "glow-interactive",
        glowColor === "teal" ? "glow-teal" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      style={{
        ...baseStyle,
        borderRadius: radius.xl,
        padding: paddingMap[padding],
        borderLeft: accentBorder
          ? `3px solid ${accentBorder}`
          : baseStyle.border,
        cursor: isInteractive ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
