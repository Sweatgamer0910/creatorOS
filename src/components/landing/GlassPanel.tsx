import { cardSurfaceStyle } from "@/components/ui/Card";

// Reuses Card's glass surface values (backdrop-blur/background/border) so
// there's one source of truth for that look, but doesn't render Card
// itself — GlassPanel's callers control padding via className (e.g.
// `className="p-8"`), which Card's own padding prop would fight with via
// inline-style specificity.
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
        ...cardSurfaceStyle.glass,
        borderRadius: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
