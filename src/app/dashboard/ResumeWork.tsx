"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Lightbulb, FileText, Kanban } from "lucide-react";
import InteractiveCard from "@/components/ui/InteractiveCard";
import Button from "@/components/ui/button";
import type { RecentWorkItem } from "@/lib/dashboard/actions";

const DISMISS_KEY = "creatoros:dismissed-resume-work";

const ICONS: Record<RecentWorkItem["type"], typeof Lightbulb> = {
  idea: Lightbulb,
  script: FileText,
  pipeline: Kanban,
};

function keyFor(items: RecentWorkItem[]) {
  return items
    .map((i) => i.id)
    .sort()
    .join(",");
}

export default function ResumeWork({ items }: { items: RecentWorkItem[] }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(localStorage.getItem(DISMISS_KEY) === keyFor(items));
  }, [items]);

  if (items.length === 0 || dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, keyFor(items));
    setDismissed(true);
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div className="flex items-center justify-between">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Pick up where you left off
        </h2>
        <Button
          variant="ghost"
          iconOnly
          size="sm"
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            border: "none",
            backgroundColor: "transparent",
            color: "var(--color-text-muted)",
          }}
        >
          <X size={14} />
        </Button>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        style={{ marginTop: 12 }}
      >
        {items.map((item) => {
          const Icon = ICONS[item.type];
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <InteractiveCard className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "var(--color-surface-hover)",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} color="var(--color-accent)" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {item.stageLabel}
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--color-accent)",
                      marginTop: 4,
                      fontWeight: 500,
                    }}
                  >
                    {item.actionLabel} →
                  </div>
                </div>
              </InteractiveCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
