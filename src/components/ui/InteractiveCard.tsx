import Card from "./Card";

// Thin, name-preserving wrapper around Card's own onClick-driven
// interactivity (role="button", keyboard support, signature hover/focus
// glow — see Card.tsx) — kept so the ~4 existing call sites don't need to
// change, but the hover/lift/glow logic itself now lives in exactly one
// place. Card only turns on the interactive treatment when `onClick` is
// passed, so a caller that renders this with no onClick (e.g. a plain
// info tile) correctly stays static instead of implying a click that does
// nothing.
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
  return (
    <Card onClick={onClick} className={className} style={style}>
      {children}
    </Card>
  );
}
