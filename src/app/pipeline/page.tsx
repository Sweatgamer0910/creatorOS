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
      style={{ padding: "24px 40px 48px", maxWidth: 1160, margin: "0 auto" }}
    >
      <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>
        Content Pipeline
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(30px, 3.5vw, 38px)",
          marginTop: 6,
        }}
      >
        Your pipeline
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 16,
          marginTop: 10,
          maxWidth: 640,
          lineHeight: 1.6,
        }}
      >
        Every video lives in one of four stages, from a rough idea to
        published. Drag a card between columns as it moves through your
        workflow — the board is the single source of truth for what&apos;s next.
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
