import { FileText } from "lucide-react";

export default function EmptyScripts() {
  return (
    <div
      className="flex flex-col items-center text-center py-16 px-6 rounded-2xl"
      style={{ border: "1px dashed var(--color-border)" }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: "var(--color-surface-hover)" }}
      >
        <FileText size={22} color="var(--color-accent)" />
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        No scripts yet
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-muted)",
          marginTop: 6,
          maxWidth: 280,
        }}
      >
        Start with a title above — you can fill in the hook, intro, body, and
        outro once it&apos;s created.
      </p>
    </div>
  );
}
