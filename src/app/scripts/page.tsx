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
    <div style={{ padding: "20px 40px 40px", maxWidth: 800, margin: "0 auto" }}>
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            Script Studio
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              marginTop: 4,
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
          fontSize: 14,
          marginTop: 8,
          maxWidth: 500,
        }}
      >
        Draft scripts section by section. AI-assisted writing is coming soon.
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
