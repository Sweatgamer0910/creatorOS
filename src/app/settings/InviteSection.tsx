"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import { radius, spacing } from "@/lib/design-tokens";

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--color-background)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: radius.sm,
  padding: `${spacing.sm}px ${spacing.md}px`,
  outline: "none",
  // readOnly doesn't exempt it - iOS Safari still auto-zooms on focus for
  // any text input under 16px, and this one's onFocus explicitly selects
  // the text (the "tap to copy" affordance), so it gets focused a lot.
  fontSize: 16,
  flex: "1 1 260px",
  minWidth: 0,
};

export default function InviteSection({
  link,
  referredCount,
}: {
  link: string;
  referredCount: number;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Same reasoning as the Channel Health share buttons — clipboard can
      // fail in some embedded browsers, and the link is still selectable
      // text either way.
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          style={inputStyle}
          aria-label="Your referral link"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCopy}
        >
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
        {referredCount > 0
          ? `${referredCount} ${referredCount === 1 ? "person has" : "people have"} joined using your link.`
          : "No one's joined via your link yet — share it with a creator who'd get value from this."}
      </p>
    </div>
  );
}
