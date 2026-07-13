"use client";

import { forwardRef } from "react";
import Spinner from "@/components/Spinner";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--color-accent)",
    color: "#000",
    border: "1px solid transparent",
  },
  secondary: {
    backgroundColor: "var(--color-surface-hover)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--color-text)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: 13 },
  md: { padding: "10px 20px", fontSize: 14 },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        style={{
          ...variantStyles[variant],
          ...sizeStyles[size],
          borderRadius: 12,
          fontWeight: 500,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "transform 0.15s ease, opacity 0.15s ease",
          outline: "none",
          ...style,
        }}
        onMouseDown={(e) => {
          if (!disabled && !loading)
            e.currentTarget.style.transform = "scale(0.97)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
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
