import Link from "next/link";
import { getAllPosts } from "@/lib/blog/posts";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Landing page teaser for /blog — previously the only way to find the
// blog from "/" was a small footer link, easy to miss entirely. Pulls the
// 3 most recent posts directly from the same data the blog itself reads
// (src/lib/blog/posts.ts), so this never goes stale relative to what's
// actually published.
export default function BlogTeaser() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <section style={{ padding: "120px 32px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#5B6270",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              Build in public
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px,4vw,40px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#F5F3EE",
              }}
            >
              What we&apos;re actually building
            </h2>
          </div>
          <Link
            href="/blog"
            className="glow-text"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#F5A623",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Read the blog →
          </Link>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: 20 }}
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glow-interactive"
              style={{
                display: "block",
                padding: "22px 20px",
                borderRadius: 14,
                background: "#171B22",
                border: "1px solid rgba(245,243,238,0.08)",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 12, color: "#5B6270" }}>
                {formatDate(post.date)}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#F5F3EE",
                  margin: "8px 0 8px",
                  lineHeight: 1.35,
                }}
              >
                {post.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#9AA0AC",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
