"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, Check } from "lucide-react";
import Button from "@/components/ui/button";
import Spinner from "@/components/Spinner";

// IdeaCard, ScriptListItem, and PipelineBoard's ItemCard each had a
// single-tap, no-confirmation delete button, 32x32 (Button's iconOnly
// "sm" size) and — in IdeaCard and PipelineBoard — sitting 4-8px from a
// sibling icon button. Fine with a mouse; on a touchscreen that's a real
// fat-finger risk on an irreversible, unrecoverable action (no trash/undo
// anywhere in this app). Rather than add a full confirm dialog/sheet for
// something this lightweight, the button itself becomes the confirmation:
// first tap arms it (turns red, swaps the icon to a checkmark, grows to a
// real 44x44 touch target) and auto-disarms after a few seconds; the
// second tap actually deletes. One shared component so this behavior — and
// any future tuning of it — can't drift between the three call sites the
// way formatCount once did.
export default function ConfirmDeleteButton({
  onConfirm,
  loading = false,
  ariaLabel = "Delete",
  armedMs = 3000,
}: {
  onConfirm: () => void;
  loading?: boolean;
  ariaLabel?: string;
  armedMs?: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      timeoutRef.current = setTimeout(() => setConfirming(false), armedMs);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setConfirming(false);
    onConfirm();
  }

  return (
    <Button
      variant="ghost"
      iconOnly
      size="sm"
      onClick={handleClick}
      disabled={loading}
      aria-label={confirming ? `Confirm — ${ariaLabel.toLowerCase()}` : ariaLabel}
      style={{
        border: confirming ? "1px solid #e35d5d" : "none",
        backgroundColor: confirming ? "rgba(227,93,93,0.14)" : "transparent",
        color: confirming ? "#e35d5d" : "var(--color-text-muted)",
        // Real touch target once armed - the one moment a mis-tap actually
        // matters, so it's also the one moment this button is easiest to
        // land on purpose and hardest to clip by accident.
        width: confirming ? 44 : 32,
        height: confirming ? 44 : 32,
        transition: "width 0.15s ease, height 0.15s ease",
      }}
    >
      {loading ? (
        <Spinner size={14} />
      ) : confirming ? (
        <Check size={16} />
      ) : (
        <Trash2 size={16} />
      )}
    </Button>
  );
}
