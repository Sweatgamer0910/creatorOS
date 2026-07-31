import type { CSSProperties, ReactNode } from "react";
import { spacing, radius, cardSurfaceStyle } from "@/lib/design-tokens";

type SkeletonRadius = keyof typeof radius;

/**
 * Shared page-level loading primitives. `loading.tsx` files are Server
 * Components rendered before any client JS runs, so the shimmer here is
 * pure CSS (`.skeleton-shimmer`, defined in globals.css) rather than a
 * Framer Motion animation — it needs to paint and animate on the very
 * first frame with zero hydration cost, and it already respects
 * `prefers-reduced-motion` the same way the rest of the app's motion
 * does (see globals.css).
 *
 * Compose page-specific skeletons out of these two primitives instead of
 * hand-rolling per-page placeholder markup — see
 * src/app/dashboard/loading.tsx and src/app/analytics/loading.tsx.
 */
export function SkeletonBlock({
  width = "100%",
  height = 16,
  radius: radiusKey = "sm",
  className = "",
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: SkeletonRadius;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={["skeleton-shimmer", className].filter(Boolean).join(" ")}
      style={{
        width,
        height,
        borderRadius: radius[radiusKey],
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

const cardPaddingMap = {
  sm: spacing.base,
  md: spacing.lg,
  lg: spacing.xl,
} as const;

/** A Card-shaped surface (same background/border/radius as
 * src/components/ui/Card.tsx) to host SkeletonBlock children, so a
 * skeleton card reads as "the same card, not loaded yet" rather than a
 * different shape appearing then swapping out. */
export function SkeletonCard({
  children,
  padding = "md",
  className = "",
  style,
}: {
  children?: ReactNode;
  padding?: keyof typeof cardPaddingMap;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        ...cardSurfaceStyle.flat,
        borderRadius: radius.xl,
        padding: cardPaddingMap[padding],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
