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
      <p style={{ ...pStyle, marginTop: 8 }}>Last updated August 1, 2026.</p>

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

      <h2 style={h2Style}>YouTube API Services</h2>
      <p style={pStyle}>
        CreatorOS uses YouTube API Services. By connecting a YouTube channel,
        you also agree to the{" "}
        <a
          href="https://www.youtube.com/t/terms"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube Terms of Service
        </a>
        . CreatorOS&rsquo;s use and transfer of information received from Google
        APIs adheres to the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. You can review or revoke
        CreatorOS&rsquo;s access to your Google account at any time from{" "}
        <a
          href="https://myaccount.google.com/permissions"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google&rsquo;s security settings
        </a>{" "}
        or from{" "}
        <Link
          href="/settings"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
        >
          CreatorOS Settings
        </Link>
        , and Google&rsquo;s own handling of your data is described in the{" "}
        <a
          href="https://policies.google.com/privacy"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Privacy Policy
        </a>
        .
      </p>

      <h2 style={h2Style}>What we don&rsquo;t do</h2>
      <p style={pStyle}>
        We don&rsquo;t sell your data, share it with advertisers, or use it to
        train any model outside of generating your own in-app recommendations.
        YouTube data is never shown to anyone but you.
      </p>

      <h2 style={h2Style}>Cookies and analytics</h2>
      <p style={pStyle}>
        CreatorOS uses a single essential cookie to keep you signed in, plus
        analytics cookies from PostHog, which we use to see aggregate feature
        usage and, for signed-in sessions, a recording of on-screen activity
        (clicks, scrolling, navigation) to help us find bugs and understand
        what&rsquo;s actually useful. Session recordings mask all on-screen text
        and images so the content you view or type is never visible in a
        recording. We also use Vercel Analytics for basic, cookieless pageview
        counts. We don&rsquo;t use advertising cookies, and we don&rsquo;t sell
        or share data for cross-context behavioral advertising.
      </p>

      <h2 style={h2Style}>How we protect your data</h2>
      <p style={pStyle}>
        Security procedures are in place to protect the confidentiality of your
        data. All traffic to and from CreatorOS is encrypted in transit over
        HTTPS/TLS. Your account information and YouTube data are stored in a
        managed database that encrypts data at rest, and are only accessible
        through authenticated requests scoped to your own workspace — no other
        user or account can query or view your data. YouTube access tokens are
        stored and used server-side only; they are never exposed to the browser,
        to other users, or to any party outside the infrastructure providers
        required to run the app (see <em>Third parties</em> below).
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

      <h2 style={h2Style}>Children&rsquo;s privacy</h2>
      <p style={pStyle}>
        CreatorOS is not directed to children under 13, and we don&rsquo;t
        knowingly collect personal information from anyone under 13. If you
        believe a child under 13 has given us information, contact us below and
        we&rsquo;ll delete it.
      </p>

      <h2 style={h2Style}>Your rights</h2>
      <p style={pStyle}>
        You can access, correct, export, or delete your data at any time from{" "}
        <Link
          href="/settings"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
        >
          Settings
        </Link>
        , or by emailing us. If you&rsquo;re a California resident, you may have
        additional rights under the CCPA, including the right to know what
        personal information we hold about you and to request its deletion — as
        stated above, we don&rsquo;t sell or share personal information. To
        exercise any of these rights, contact us below; we won&rsquo;t
        discriminate against you for doing so.
      </p>

      <h2 style={h2Style}>Third parties</h2>
      <p style={pStyle}>
        We use Google OAuth (and optionally Discord) for authentication and
        YouTube data access, and standard infrastructure providers &mdash;
        hosting and pageview analytics (Vercel), database (Neon),
        rate-limiting/session storage (Upstash), transactional and marketing
        email (Resend), product analytics and session recording (PostHog), and
        error monitoring (Sentry) &mdash; to run the app. None of these
        providers use your data for anything beyond operating CreatorOS on our
        behalf.
      </p>

      <h2 style={h2Style}>Changes to this policy</h2>
      <p style={pStyle}>
        We may update this policy as the app changes. If a change is material,
        we&rsquo;ll make reasonable efforts to let existing users know (e.g.
        email or an in-app notice) before it takes effect.
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
