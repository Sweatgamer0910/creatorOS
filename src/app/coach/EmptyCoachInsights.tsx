import { Sparkles } from "lucide-react";

export default function EmptyCoachInsights() {
  return (
    <div
      className="flex flex-col items-center text-center py-20 px-6 rounded-2xl"
      style={{ border: "1px dashed var(--color-border)" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ backgroundColor: "var(--color-surface-hover)" }}
      >
        <Sparkles size={28} color="var(--color-accent)" />
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        Nothing to flag right now
      </h3>
      <p
        style={{
          fontSize: 15,
          color: "var(--color-text-muted)",
          marginTop: 8,
          maxWidth: 360,
          lineHeight: 1.6,
        }}
      >
        There isn&apos;t enough recent activity on your channel yet to read a
        pattern from — check back after your next few uploads.
      </p>
    </div>
  );
}
