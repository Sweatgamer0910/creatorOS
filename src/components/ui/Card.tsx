import { spacing, radius } from "@/lib/design-tokens";

type Variant = "flat" | "glass";
type Padding = "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  variant?: Variant;
  padding?: Padding;
  className?: string;
  style?: React.CSSProperties;
  accentBorder?: string;
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
}: CardProps) {
  const baseStyle: React.CSSProperties =
    variant === "glass"
      ? {
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }
      : {
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        };

  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        borderRadius: radius.xl,
        padding: paddingMap[padding],
        borderLeft: accentBorder
          ? `3px solid ${accentBorder}`
          : baseStyle.border,
        transition: "border-color 0.2s ease, transform 0.2s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
