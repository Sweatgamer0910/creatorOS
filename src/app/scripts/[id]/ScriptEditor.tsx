"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { updateScript } from "@/lib/scripts/actions";
import Spinner from "@/components/Spinner";
import LockedFeature from "@/components/LockedFeature";
import Button from "@/components/ui/button";

interface Script {
  id: string;
  title: string;
  hook: string;
  intro: string;
  body: string;
  outro: string;
}

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

export default function ScriptEditor({ script }: { script: Script }) {
  const [values, setValues] = useState({
    hook: script.hook,
    intro: script.intro,
    body: script.body,
    outro: script.outro,
  });
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [isNavigatingBack, startBack] = useTransition();
  const timers = useRef<Record<string, NodeJS.Timeout>>({});
  const router = useRouter();

  function handleChange(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));

    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      setSavingKey(key);
      startTransition(async () => {
        await updateScript(script.id, { [key]: value });
        setSavingKey(null);
      });
    }, 800);
  }

  function handleBack() {
    startBack(() => {
      router.push("/scripts");
    });
  }

  return (
    <div>
      <Button
        variant="text"
        onClick={handleBack}
        className="inline-flex items-center gap-2 mb-4"
        style={{ fontSize: 14 }}
      >
        {isNavigatingBack ? <Spinner size={14} /> : <ArrowLeft size={14} />}
        Back to scripts
      </Button>

      <div className="flex items-center justify-between">
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

      <div className="flex flex-col gap-6 mt-8">
        {sections.map(({ key, label, hint }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    marginLeft: 8,
                  }}
                >
                  {hint}
                </span>
              </div>
              {savingKey === key && (
                <div
                  className="flex items-center gap-2"
                  style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                >
                  <Spinner size={12} />
                  Saving
                </div>
              )}
            </div>
            <textarea
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={key === "body" ? 10 : 4}
              placeholder={`Write your ${label.toLowerCase()} here...`}
              className="w-full px-3 py-2 rounded-lg outline-none resize-none"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
