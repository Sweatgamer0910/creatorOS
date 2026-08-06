import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog/posts";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Static params for every post at build time — the post list is small,
// code-defined content (src/lib/blog/posts.ts), not database-backed, so
// there's no reason for this to be dynamic per-request.
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    // No trailing " — CreatorOS" — the root layout's title template
    // already appends it (see blog/page.tsx for the same fix).
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "64px 24px 120px" }}>
      <Link
        href="/blog"
        className="glow-text"
        style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}
      >
        ← All posts
      </Link>

      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "20px 0 8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
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

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(26px,4vw,38px)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          margin: "0 0 32px",
          color: "var(--color-text)",
          lineHeight: 1.2,
        }}
      >
        {post.title}
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {post.body.map((block, i) =>
          block.type === "h3" ? (
            <h3
              key={i}
              style={{
                margin: "10px 0 0",
                fontSize: 18,
                fontWeight: 600,
                color: "var(--color-text)",
              }}
            >
              {block.text}
            </h3>
          ) : (
            <p
              key={i}
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.75,
                color: "var(--color-text-muted)",
              }}
            >
              {block.text}
            </p>
          ),
        )}
      </div>

      <div
        style={{
          marginTop: 56,
          paddingTop: 32,
          borderTop: "1px solid rgba(245,243,238,0.08)",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 16 }}>
          Want to see what we&rsquo;ve actually built?
        </p>
        <Link
          href="/signup"
          className="glow-interactive"
          style={{
            display: "inline-block",
            padding: "12px 26px",
            background: "var(--color-accent)",
            color: "#030304",
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          Try CreatorOS free
        </Link>
      </div>
    </div>
  );
}
