"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteIdea } from "@/lib/ideas/actions";
import InteractiveCard from "@/components/ui/InteractiveCard";
import Button from "@/components/ui/button";
import Spinner from "@/components/Spinner";

interface Idea {
  id: string;
  title: string;
  notes: string | null;
  createdAt: Date;
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      await deleteIdea(idea.id);
    });
  }

  return (
    <InteractiveCard>
      <div className="flex items-start justify-between">
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
            {idea.title}
          </div>
          {idea.notes && (
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                marginTop: 4,
              }}
            >
              {idea.notes}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          iconOnly
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Delete idea"
          style={{
            border: "none",
            backgroundColor: "transparent",
            color: "var(--color-text-muted)",
          }}
        >
          {isPending ? <Spinner size={14} /> : <Trash2 size={16} />}
        </Button>
      </div>
    </InteractiveCard>
  );
}
