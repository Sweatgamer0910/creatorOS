"use client";

import { forwardRef } from "react";
import Spinner from "@/components/Spinner";

type Variant = "primary" | "secondary" | "ghost" | "text";
type Size = "sm" | "md";
type GlowColor = "amber" | "teal";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Which accent the hover/focus glow uses. Ignored by variant="text". */
  glowColor?: GlowColor;
  /** Square, icon-centered button (nav triggers, inline delete/close icons)
   *  instead of the default text-row layout. */
  iconOnly?: boolean;
}

// Same top-lit-surface logic as Card's `flat` variant (design-tokens.ts)
// applied to buttons: a subtle gradient + inset top highlight instead of a
// flat fill, so a button reads as a pressable physical object with a top
// edge catching light, matching every card/nav surface in the app rather
// than looking like a leftover flat-design holdover next to them.
const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundImage:
      "linear-gradient(180deg, #ffb84d 0%, var(--color-accent) 100%)",
    color: "#000",
    border: "1px solid transparent",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
  },
  secondary: {
    backgroundImage:
      "linear-gradient(180deg, var(--color-surface-hover) 0%, var(--color-surface) 100%)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--color-text)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  // No background/border at all — a plain text action (e.g. "Back to
  // scripts"). Gets the lighter .glow-text treatment below instead of the
  // full box-shadow bloom, which would look out of place on inline text.
  text: {
    backgroundColor: "transparent",
    color: "var(--color-text-muted)",
    border: "none",
    padding: 0,
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: 13 },
  md: { padding: "10px 20px", fontSize: 14 },
};

const iconOnlySizeStyles: Record<Size, React.CSSProperties> = {
  sm: { width: 32, height: 32, padding: 0 },
  md: { width: 40, height: 40, padding: 0 },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      glowColor = "amber",
      iconOnly = false,
      disabled,
      children,
      className = "",
      style,
      ...props
    },
    ref,
  ) => {
    const isText = variant === "text";
    // Real :hover/:focus-visible in CSS (see globals.css) instead of
    // JS-driven hover/press state — gets correct focus-visible semantics
    // (no ring on mouse-click focus, a ring on keyboard focus) for free,
    // and doesn't re-render the component on every pointer move.
    const glowClass = isText ? "glow-text" : "glow-interactive";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={[
          glowClass,
          !isText && glowColor === "teal" ? "glow-teal" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...(iconOnly ? iconOnlySizeStyles[size] : {}),
          borderRadius: iconOnly ? 999 : 14,
          fontWeight: 500,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
        {...props}
      >
        {loading ? (
          <Spinner
            size={size === "sm" ? 14 : 16}
            variant={variant === "primary" ? "dark" : "accent"}
          />
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
