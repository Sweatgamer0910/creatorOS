import { cardSurfaceStyle } from "@/lib/design-tokens";

// Reuses Card's flat surface values (background/border) so there's one
// source of truth for that look, but doesn't render Card itself —
// GlassPanel's callers control padding via className (e.g.
// `className="p-8"`), which Card's own padding prop would fight with via
// inline-style specificity.
//
// This used to be the translucent "glass" surface (4% white over the
// content behind it, blurred) — over the landing page's pure black
// background that composited to essentially the same black, with an 8%
// white border that was just as invisible. Switched to the app's standard
// opaque deep-grey surface (same tokens PipelineBoard, dashboard cards,
// etc. already use) so the card is actually differentiable from the page
// background instead of reading as a borderless black-on-black shape.
export default function GlassPanel({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        ...cardSurfaceStyle.flat,
        borderRadius: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
