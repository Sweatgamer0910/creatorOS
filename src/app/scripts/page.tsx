import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getScripts } from "@/lib/scripts/actions";
import NewScriptForm from "./NewScriptForm";
import ScriptListItem from "./ScriptListItem";
import EmptyScripts from "./EmptyScripts";
import LockedFeature from "@/components/LockedFeature";
import Button from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default async function ScriptsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const scripts = await getScripts();

  return (
    <div style={{ padding: "24px 40px 48px", maxWidth: 900, margin: "0 auto" }}>
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>
            Script Studio
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(30px, 3.5vw, 38px)",
              marginTop: 6,
            }}
          >
            Your scripts
          </h1>
        </div>
        <LockedFeature label="AI-generated scripts">
          <Button variant="secondary" size="sm">
            <Sparkles size={14} />
            Generate a script with AI
          </Button>
        </LockedFeature>
      </div>

      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 16,
          marginTop: 10,
          maxWidth: 640,
          lineHeight: 1.6,
        }}
      >
        Draft hook, intro, body, and outro section by section instead of
        staring at one blank page — each piece autosaves as you write.
        AI-assisted writing is coming soon.
      </p>

      <div className="mt-8">
        <NewScriptForm />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {scripts.length === 0 ? (
          <EmptyScripts />
        ) : (
          scripts.map((script) => (
            <ScriptListItem key={script.id} script={script} />
          ))
        )}
      </div>
    </div>
  );
}
