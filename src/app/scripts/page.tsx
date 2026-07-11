import { getScripts } from "@/lib/scripts/actions";
import NewScriptForm from "./NewScriptForm";
import ScriptListItem from "./ScriptListItem";
import LockedFeature from "@/components/LockedFeature";
import { Sparkles } from "lucide-react";

export default async function ScriptsPage() {
  const scripts = await getScripts();

  return (
    <div style={{ padding: "20px 40px 40px", maxWidth: 800, margin: "0 auto" }}>
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Script Studio</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, marginTop: 4 }}>
            Your scripts
          </h1>
        </div>
        <LockedFeature label="AI-generated scripts">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{ backgroundColor: "var(--color-surface-hover)", color: "var(--color-text)" }}
          >
            <Sparkles size={14} />
            Generate a script with AI
          </button>
        </LockedFeature>
      </div>

      <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginTop: 8, maxWidth: 500 }}>
        Draft scripts section by section. AI-assisted writing is coming soon.
      </p>

      <div className="mt-8">
        <NewScriptForm />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {scripts.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            No scripts yet — create your first one above.
          </p>
        ) : (
          scripts.map((script) => <ScriptListItem key={script.id} script={script} />)
        )}
      </div>
    </div>
  );
}
