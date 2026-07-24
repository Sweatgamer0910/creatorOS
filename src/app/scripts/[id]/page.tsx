import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getScript } from "@/lib/scripts/actions";
import { getIdeas } from "@/lib/ideas/actions";
import { notFound, redirect } from "next/navigation";
import ScriptEditor from "./ScriptEditor";

export default async function ScriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  // getScript is workspace-scoped, so this also 404s (rather than leaking
  // existence) for a script id that belongs to a different workspace.
  const [script, ideas] = await Promise.all([getScript(id), getIdeas()]);

  if (!script) notFound();

  return (
    <div style={{ padding: "20px 40px 40px", maxWidth: 800, margin: "0 auto" }}>
      <ScriptEditor script={script} ideas={ideas} />
    </div>
  );
}
