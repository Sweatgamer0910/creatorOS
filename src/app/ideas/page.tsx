import { getIdeas } from "@/lib/ideas/actions";
import IdeaForm from "./IdeaForm";
import IdeaCard from "./IdeaCard";
import EmptyIdeas from "./EmptyIdeas";

export default async function IdeasPage() {
  const ideas = await getIdeas();

  return (
    <div style={{ padding: "20px 40px 40px", maxWidth: 800, margin: "0 auto" }}>
      <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Idea Lab</p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          marginTop: 4,
        }}
      >
        Your ideas
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 14,
          marginTop: 8,
          maxWidth: 500,
        }}
      >
        Capture video ideas as they come to you. AI-assisted suggestions are
        coming soon.
      </p>

      <div className="mt-8">
        <IdeaForm />
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
