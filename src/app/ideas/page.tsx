import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getIdeas } from "@/lib/ideas/actions";
import { getSeriesList } from "@/lib/series/actions";
import IdeaForm from "./IdeaForm";
import IdeaCard from "./IdeaCard";
import EmptyIdeas from "./EmptyIdeas";

export default async function IdeasPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [ideas, seriesList] = await Promise.all([getIdeas(), getSeriesList()]);

  return (
    <div style={{ padding: "24px 40px 48px", maxWidth: 900, margin: "0 auto" }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>
          Idea Lab
        </p>
        <Link
          href="/series"
          className="glow-text"
          style={{
            fontSize: 13,
            color: "var(--color-accent-teal)",
            textDecoration: "none",
          }}
        >
          View all series →
        </Link>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(30px, 3.5vw, 38px)",
          marginTop: 6,
        }}
      >
        Your ideas
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
        The best video ideas rarely show up when you&apos;re sitting down to
        plan content — capture them the moment they hit, then come back and turn
        the good ones into scripts. AI-assisted suggestions are coming soon.
      </p>

      <div className="mt-8">
        <IdeaForm seriesList={seriesList} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {ideas.length === 0 ? (
          <EmptyIdeas />
        ) : (
          ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
        )}
      </div>
    </div>
  );
}
