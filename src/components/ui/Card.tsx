"use client";

import { spacing, radius, cardSurfaceStyle } from "@/lib/design-tokens";

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
