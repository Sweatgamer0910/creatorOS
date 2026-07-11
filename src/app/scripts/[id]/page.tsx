import { getScript } from "@/lib/scripts/actions";
import { notFound } from "next/navigation";
import ScriptEditor from "./ScriptEditor";

export default async function ScriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const script = await getScript(id);

  if (!script) notFound();

  return (
    <div style={{ padding: "20px 40px 40px", maxWidth: 800, margin: "0 auto" }}>
      <ScriptEditor script={script} />
    </div>
  );
}
