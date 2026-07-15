import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getContentItems } from "@/lib/pipeline/actions";
import PipelineBoard from "./PipelineBoard";
import NewItemForm from "./NewItemForm";

export default async function PipelinePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const items = await getContentItems();

  return (
    <div
      style={{ padding: "20px 40px 40px", maxWidth: 1100, margin: "0 auto" }}
    >
      <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
        Content Pipeline
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          marginTop: 4,
        }}
      >
        Your pipeline
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 14,
          marginTop: 8,
          maxWidth: 500,
        }}
      >
        Track videos from idea to published. Drag cards between columns.
      </p>

      <div className="mt-8">
        <NewItemForm />
      </div>

      <div className="mt-8">
        <PipelineBoard items={items} />
      </div>
    </div>
  );
}
