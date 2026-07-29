import Link from "next/link";

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 20,
  fontWeight: 600,
  color: "var(--color-text)",
  marginTop: 36,
};

const pStyle: React.CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: 15,
  lineHeight: 1.7,
  marginTop: 10,
};

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div style={{ padding: "64px 24px 96px", maxWidth: 720, margin: "0 auto" }}>
      <Link
        href="/"
        className="glow-text"
        style={{
          fontSize: 13,
          color: "var(--color-text-muted)",
          textDecoration: "none",
        }}
      >
        ← CreatorOS
      </Link>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 4vw, 36px)",
          color: "var(--color-text)",
          marginTop: 16,
        }}
      >
        Privacy Policy
      </h1>
      <p style={{ ...pStyle, marginTop: 8 }}>Last updated July 2026.</p>

      <p style={pStyle}>
        CreatorOS (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a tool for planning,
        writing, and tracking YouTube content. This page explains what we
        collect, why, and how to remove it.
      </p>

      <h2 style={h2Style}>What we collect</h2>
      <p style={pStyle}>
        <strong>Account information</strong>: your name and email address,
        collected when you create an account (either directly, or from your
        Google profile if you sign up with Google).
      </p>
      <p style={pStyle}>
        <strong>YouTube data</strong>: if you connect a YouTube channel, we
        request read-only access to your channel&rsquo;s public profile,
        subscriber/view/watch-time statistics, and video-level analytics via the
        YouTube Data and YouTube Analytics APIs. We use this exclusively to
        power the Analytics, Growth Coach, and Dashboard features inside
        CreatorOS — to show you your own numbers back, and to generate
        recommendations grounded in them. We never request upload, edit, or
        delete access to your channel or videos.
      </p>
      <p style={pStyle}>
        <strong>Content you create</strong>: ideas, scripts, series, and
        pipeline entries you write inside CreatorOS are stored so the app can
        show them back to you across sessions.
      </p>

      <h2 style={h2Style}>What we don&rsquo;t do</h2>
      <p style={pStyle}>
        We don&rsquo;t sell your data, share it with advertisers, or use it to
        train any model outside of generating your own in-app recommendations.
        YouTube data is never shown to anyone but you.
      </p>

      <h2 style={h2Style}>How we protect your data</h2>
      <p style={pStyle}>
        Security procedures are in place to protect the confidentiality of
        your data. All traffic to and from CreatorOS is encrypted in transit
        over HTTPS/TLS. Your account information and YouTube data are stored
        in a managed database that encrypts data at rest, and are only
        accessible through authenticated requests scoped to your own
        workspace — no other user or account can query or view your data.
        YouTube access tokens are stored and used server-side only; they are
        never exposed to the browser, to other users, or to any party outside
        the infrastructure providers required to run the app (see{" "}
        <em>Third parties</em> below).
      </p>

      <h2 style={h2Style}>How long we keep it</h2>
      <p style={pStyle}>
        We retain your data for as long as your account exists. You can
        disconnect your YouTube channel or permanently delete your account and
        all associated data at any time from{" "}
        <Link
          href="/settings"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
        >
          Settings
        </Link>
        . Deleting your account removes everything tied to it immediately —
        there is no recovery period.
      </p>

      <h2 style={h2Style}>Third parties</h2>
      <p style={pStyle}>
        We use Google OAuth for authentication and YouTube data access, and
        standard infrastructure providers (hosting, database, transactional
        email) to run the app. None of these providers use your data for
        anything beyond operating CreatorOS on our behalf.
      </p>

      <h2 style={h2Style}>Contact</h2>
      <p style={pStyle}>
        Questions about this policy or your data — Ayaan Kumar,{" "}
        <a
          href="mailto:support.creatoros@gmail.com"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
        >
          support.creatoros@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
