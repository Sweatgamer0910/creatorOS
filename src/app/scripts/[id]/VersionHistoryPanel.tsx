"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { getScriptVersions, restoreScriptVersion } from "@/lib/scripts/actions";
import Button from "@/components/ui/button";
import Spinner from "@/components/Spinner";
import { radius } from "@/lib/design-tokens";
import { ScriptSections } from "@/lib/scripts/wordCount";

interface ScriptVersionRecord extends ScriptSections {
  id: string;
  createdAt: Date;
}

export default function VersionHistoryPanel({
  scriptId,
  onClose,
  onRestored,
}: {
  scriptId: string;
  onClose: () => void;
  onRestored: (sections: ScriptSections) => void;
}) {
  const [versions, setVersions] = useState<ScriptVersionRecord[] | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    getScriptVersions(scriptId)
      .then(setVersions)
      .catch((e) => {
        console.error("[VersionHistoryPanel] Failed to load versions:", e);
        setLoadError("Couldn't load version history — try again.");
      });
  }, [scriptId]);

  function handleRestore(version: ScriptVersionRecord) {
    setRestoringId(version.id);
    setRestoreError(null);
    startTransition(async () => {
      try {
        await restoreScriptVersion(scriptId, version.id);
        onRestored({
          hook: version.hook,
          intro: version.intro,
          body: version.body,
          outro: version.outro,
        });
      } catch (e) {
        console.error("[VersionHistoryPanel] Failed to restore version:", e);
        setRestoreError("Couldn't restore that version — try again.");
      } finally {
        setRestoringId(null);
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(3,3,4,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 92vw)",
          height: "100%",
          backgroundColor: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          padding: 24,
          overflowY: "auto",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            Version history
          </span>
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </Button>
        </div>

        {loadError && (
          <p style={{ color: "#e35d5d", fontSize: 14 }}>{loadError}</p>
        )}
        {!loadError && versions === null && (
          <div className="flex justify-center" style={{ marginTop: 40 }}>
            <Spinner size={28} />
          </div>
        )}
        {restoreError && (
          <p style={{ color: "#e35d5d", fontSize: 13, marginBottom: 8 }}>
            {restoreError}
          </p>
        )}
        {versions && versions.length === 0 && (
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            No saved versions yet — use &ldquo;Save version&rdquo; to snapshot
            the current draft.
          </p>
        )}
        {versions && versions.length > 0 && (
          <div className="flex flex-col gap-3">
            {versions.map((v) => (
              <div
                key={v.id}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: radius.md,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                  {new Date(v.createdAt).toLocaleString()}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestore(v)}
                  disabled={restoringId === v.id}
                  style={{ marginTop: 8 }}
                >
                  {restoringId === v.id ? (
                    <Spinner size={12} />
                  ) : (
                    "Restore this version"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
