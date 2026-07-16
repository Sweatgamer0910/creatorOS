import { FileText } from "lucide-react";

export default function EmptyScripts() {
  return (
    <div
      className="flex flex-col items-center text-center py-20 px-6 rounded-2xl"
      style={{ border: "1px dashed var(--color-border)" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ backgroundColor: "var(--color-surface-hover)" }}
      >
        <FileText size={28} color="var(--color-accent)" />
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        No scripts yet
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
        Start with a title above, then fill in the hook, intro, body, and
        outro section by section. Every field autosaves as you type, so
        there&apos;s no &quot;save&quot; button to remember.
      </p>
    </div>
  );
}
