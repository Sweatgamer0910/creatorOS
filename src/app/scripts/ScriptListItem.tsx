"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteScript } from "@/lib/scripts/actions";
import InteractiveCard from "@/components/ui/InteractiveCard";
import ConfirmDeleteButton from "@/components/ui/ConfirmDeleteButton";
import Spinner from "@/components/Spinner";

export interface Script {
  id: string;
  title: string;
  updatedAt: Date;
  idea: { id: string; title: string } | null;
}

export default function ScriptListItem({ script }: { script: Script }) {
  const [isDeleting, startDelete] = useTransition();
  const [isNavigating, startNavigate] = useTransition();
  const router = useRouter();

  function handleOpen() {
    startNavigate(() => {
      router.push(`/scripts/${script.id}`);
    });
  }

  function handleDelete() {
    startDelete(async () => {
      await deleteScript(script.id);
    });
  }

  return (
    <InteractiveCard onClick={handleOpen}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isNavigating && <Spinner size={16} />}
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
              {script.title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 2,
              }}
            >
              Updated {new Date(script.updatedAt).toLocaleDateString()}
            </div>
            {script.idea && (
              <Link
                href="/ideas"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "inline-block",
                  marginTop: 4,
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                }}
              >
                from: {script.idea.title}
              </Link>
            )}
          </div>
        </div>
        <ConfirmDeleteButton
          onConfirm={handleDelete}
          loading={isDeleting}
          ariaLabel="Delete script"
        />
      </div>
    </InteractiveCard>
  );
}
