import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog/posts";
import Card from "@/components/ui/Card";

const TITLE = "Blog — CreatorOS";
const DESCRIPTION =
  "Building CreatorOS in public — real engineering notes, product decisions, and the occasional detour, as they happen.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 120px" }}>
      <div style={{ marginBottom: 40 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: 2,
            color: "var(--color-accent)",
            textTransform: "uppercase",
          }}
        >
          Build in public
        </span>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px,4.5vw,44px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            margin: "12px 0",
            color: "var(--color-text)",
          }}
        >
          The CreatorOS blog
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 15, lineHeight: 1.6 }}>
          Real engineering notes, product decisions, and the occasional
          detour — written as they happen, not cleaned up after the fact.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
            <Card padding="md">
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  {formatDate(post.date)}
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "var(--color-accent-teal)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: 19, fontWeight: 600, color: "var(--color-text)" }}>
                {post.title}
              </h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--color-text-muted)" }}>
                {post.excerpt}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
