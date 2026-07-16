"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteScript } from "@/lib/scripts/actions";
import InteractiveCard from "@/components/ui/InteractiveCard";
import Button from "@/components/ui/button";
import Spinner from "@/components/Spinner";

interface Script {
  id: string;
  title: string;
  updatedAt: Date;
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

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
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
          </div>
        </div>
        <Button
          variant="ghost"
          iconOnly
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete script"
          style={{
            border: "none",
            backgroundColor: "transparent",
            color: "var(--color-text-muted)",
          }}
        >
          {isDeleting ? <Spinner size={14} /> : <Trash2 size={16} />}
        </Button>
      </div>
    </InteractiveCard>
  );
}
