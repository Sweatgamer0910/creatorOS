"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Maximize2,
  Minimize2,
  Presentation,
  History,
  Save,
  Check,
} from "lucide-react";
import { updateScript, createScriptVersion } from "@/lib/scripts/actions";
import {
  computeScriptWordStats,
  formatReadTime,
  ScriptSections,
} from "@/lib/scripts/wordCount";
import Spinner from "@/components/Spinner";
import LockedFeature from "@/components/LockedFeature";
import Button from "@/components/ui/button";
import { motion as motionTokens, radius, spacing } from "@/lib/design-tokens";
import Teleprompter from "./Teleprompter";
import VersionHistoryPanel from "./VersionHistoryPanel";

interface Script extends ScriptSections {
  id: string;
  title: string;
  hookComplete: boolean;
  introComplete: boolean;
  bodyComplete: boolean;
  outroComplete: boolean;
  idea: { id: string; title: string } | null;
}

const selectStyle: React.CSSProperties = {
  backgroundColor: "var(--color-background)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: radius.sm,
  padding: `${spacing.xs}px ${spacing.sm}px`,
  outline: "none",
  fontSize: 13,
};

const sections = [
  {
    key: "hook" as const,
    label: "Hook",
    hint: "The first few seconds — grab attention immediately",
  },
  {
    key: "intro" as const,
    label: "Intro",
    hint: "Set up what the video is about",
  },
  { key: "body" as const, label: "Body", hint: "The main content" },
  { key: "outro" as const, label: "Outro", hint: "Wrap up and call to action" },
];

type SectionKey = (typeof sections)[number]["key"];

function completeFieldFor(key: SectionKey) {
  return `${key}Complete` as
    "hookComplete" | "introComplete" | "bodyComplete" | "outroComplete";
}

export default function ScriptEditor({
  script,
  ideas = [],
}: {
  script: Script;
  ideas?: { id: string; title: string }[];
}) {
  const [values, setValues] = useState<ScriptSections>({
    hook: script.hook,
    intro: script.intro,
    body: script.body,
    outro: script.outro,
  });
  const [linkedIdea, setLinkedIdea] = useState<{
    id: string;
    title: string;
  } | null>(script.idea);
  const [showIdeaEditor, setShowIdeaEditor] = useState(false);
  const [isLinkingIdea, startLinkIdea] = useTransition();
  const [complete, setComplete] = useState<Record<SectionKey, boolean>>({
    hook: script.hookComplete,
    intro: script.introComplete,
    body: script.bodyComplete,
    outro: script.outroComplete,
  });
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [focusedSection, setFocusedSection] = useState<SectionKey | null>(null);
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [isSavingVersion, startSavingVersion] = useTransition();
  const [versionSaved, setVersionSaved] = useState(false);
  const [, startTransition] = useTransition();
  const [isNavigatingBack, startBack] = useTransition();
  const timers = useRef<Record<string, NodeJS.Timeout>>({});
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);

  const stats = useMemo(() => computeScriptWordStats(values), [values]);

  function reportError(message: string) {
    setActionError(message);
    setTimeout(() => setActionError(null), 4000);
  }

  function handleChange(key: SectionKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));

    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      setSavingKey(key);
      startTransition(async () => {
        try {
          await updateScript(script.id, { [key]: value });
        } catch (e) {
          console.error("[ScriptEditor] Failed to save section:", e);
          reportError("Couldn't save — check your connection and try again.");
        } finally {
          setSavingKey(null);
        }
      });
    }, 800);
  }

  function handleToggleComplete(key: SectionKey) {
    const next = !complete[key];
    setComplete((prev) => ({ ...prev, [key]: next }));
    startTransition(async () => {
      try {
        await updateScript(script.id, { [completeFieldFor(key)]: next });
      } catch (e) {
        console.error("[ScriptEditor] Failed to update section status:", e);
        setComplete((prev) => ({ ...prev, [key]: !next }));
        reportError("Couldn't save that change — try again.");
      }
    });
  }

  function handleLinkIdea(id: string) {
    const previous = linkedIdea;
    const idea = id ? (ideas.find((i) => i.id === id) ?? null) : null;
    setLinkedIdea(idea);
    setShowIdeaEditor(false);
    startLinkIdea(async () => {
      try {
        await updateScript(script.id, { ideaId: id || null });
      } catch (e) {
        console.error("[ScriptEditor] Failed to update linked idea:", e);
        setLinkedIdea(previous);
        reportError("Couldn't save that link — try again.");
      }
    });
  }

  function handleSaveVersion() {
    startSavingVersion(async () => {
      try {
        await createScriptVersion(script.id);
        setVersionSaved(true);
        setTimeout(() => setVersionSaved(false), 2000);
      } catch (e) {
        console.error("[ScriptEditor] Failed to save version:", e);
        reportError("Couldn't save a version — try again.");
      }
    });
  }

  function handleRestored(restored: ScriptSections) {
    setValues(restored);
    setShowVersions(false);
  }

  function handleBack() {
    startBack(() => {
      router.push("/scripts");
    });
  }

  return (
    <div>
      {actionError && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            backgroundColor: "rgba(227,93,93,0.1)",
            border: "1px solid rgba(227,93,93,0.3)",
            color: "#e35d5d",
            fontSize: 13,
          }}
        >
          {actionError}
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button
          variant="text"
          onClick={handleBack}
          className="inline-flex items-center gap-2"
          style={{ fontSize: 14 }}
        >
          {isNavigatingBack ? <Spinner size={14} /> : <ArrowLeft size={14} />}
          Back to scripts
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTeleprompter(true)}
          >
            <Presentation size={14} />
            Teleprompter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVersions(true)}
          >
            <History size={14} />
            History
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveVersion}
            loading={isSavingVersion}
          >
            {versionSaved ? <Check size={14} /> : <Save size={14} />}
            {versionSaved ? "Saved" : "Save version"}
          </Button>
        </div>
      </div>

      <div
        className="flex items-center justify-between flex-wrap gap-2"
        style={{ marginTop: 16 }}
      >
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>
          {script.title}
        </h1>
        <LockedFeature label="AI-assisted writing">
          <Button type="button" variant="secondary" size="sm" disabled>
            <Sparkles size={14} />
            Write with AI
          </Button>
        </LockedFeature>
      </div>

      <div
        className="flex items-center gap-2 flex-wrap"
        style={{ marginTop: 8 }}
      >
        {!showIdeaEditor && linkedIdea && (
          <>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              From idea:{" "}
              <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
                {linkedIdea.title}
              </span>
            </span>
            <Button
              variant="text"
              size="sm"
              style={{ fontSize: 12 }}
              onClick={() => setShowIdeaEditor(true)}
            >
              Change
            </Button>
          </>
        )}
        {!showIdeaEditor && !linkedIdea && ideas.length > 0 && (
          <Button
            variant="text"
            size="sm"
            style={{ fontSize: 12, color: "var(--color-accent-teal)" }}
            onClick={() => setShowIdeaEditor(true)}
          >
            + Link to an idea
          </Button>
        )}
        {showIdeaEditor && (
          <div className="flex items-center gap-2">
            <select
              value={linkedIdea?.id ?? ""}
              onChange={(e) => handleLinkIdea(e.target.value)}
              style={selectStyle}
            >
              <option value="">Not linked to an idea</option>
              {ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.title}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIdeaEditor(false)}
            >
              Cancel
            </Button>
          </div>
        )}
        {isLinkingIdea && <Spinner size={12} />}
      </div>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--color-text-muted)",
          marginTop: 6,
        }}
      >
        {stats.total.words.toLocaleString()} words ·{" "}
        {formatReadTime(stats.total.seconds)} read (estimate, ~150 words/min)
      </div>

      <div className="flex flex-col gap-6 mt-8">
        {sections.map(({ key, label, hint }) => {
          const isFocused = focusedSection === key;
          const isDimmed = focusedSection !== null && !isFocused;
          const sectionStats = stats[key];
          const isComplete = complete[key];

          return (
            <motion.div
              key={key}
              layout
              animate={{ opacity: isDimmed ? 0.35 : 1 }}
              transition={{ duration: motionTokens.base }}
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                  >
                    {hint}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {sectionStats.words} words ·{" "}
                    {formatReadTime(sectionStats.seconds)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {savingKey === key && (
                    <div
                      className="flex items-center gap-2"
                      style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                    >
                      <Spinner size={12} />
                      Saving
                    </div>
                  )}
                  <Button
                    variant={isComplete ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleToggleComplete(key)}
                  >
                    {isComplete && <Check size={12} />}
                    {isComplete ? "Complete" : "Mark complete"}
                  </Button>
                  <Button
                    variant="ghost"
                    iconOnly
                    size="sm"
                    onClick={() => setFocusedSection(isFocused ? null : key)}
                    aria-label={
                      isFocused ? "Exit focus mode" : "Focus this section"
                    }
                  >
                    {isFocused ? (
                      <Minimize2 size={14} />
                    ) : (
                      <Maximize2 size={14} />
                    )}
                  </Button>
                </div>
              </div>
              {!isDimmed && (
                <textarea
                  value={values[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={isFocused ? 20 : key === "body" ? 10 : 4}
                  placeholder={`Write your ${label.toLowerCase()} here...`}
                  className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                    overflowY: "auto",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showTeleprompter && (
          <Teleprompter
            sections={values}
            onClose={() => setShowTeleprompter(false)}
          />
        )}
        {showVersions && (
          <VersionHistoryPanel
            scriptId={script.id}
            onClose={() => setShowVersions(false)}
            onRestored={handleRestored}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
