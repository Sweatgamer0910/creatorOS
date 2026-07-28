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
  title: "Terms of Service",
};

export default function TermsPage() {
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
        Terms of Service
      </h1>
      <p style={{ ...pStyle, marginTop: 8 }}>Last updated July 2026.</p>

      <p style={pStyle}>
        By creating a CreatorOS account or using the app, you agree to these
        terms. If you don&rsquo;t agree, don&rsquo;t use CreatorOS.
      </p>

      <h2 style={h2Style}>Your account</h2>
      <p style={pStyle}>
        You&rsquo;re responsible for the content you create in CreatorOS and for
        keeping your login credentials secure. You must be able to legally agree
        to these terms to create an account.
      </p>

      <h2 style={h2Style}>Acceptable use</h2>
      <p style={pStyle}>
        Use CreatorOS for its intended purpose — planning and producing your own
        content. Don&rsquo;t use it to access, scrape, or interfere with data
        belonging to channels you don&rsquo;t own or have authorization to
        manage, and don&rsquo;t attempt to disrupt or reverse-engineer the
        service.
      </p>

      <h2 style={h2Style}>Your content</h2>
      <p style={pStyle}>
        You own everything you create inside CreatorOS — ideas, scripts, series,
        and pipeline entries. We only store and display it back to you; we
        don&rsquo;t claim any ownership over it or publish it anywhere.
      </p>

      <h2 style={h2Style}>YouTube data</h2>
      <p style={pStyle}>
        Connecting a YouTube channel grants CreatorOS read-only access to your
        channel&rsquo;s statistics and analytics, used solely to power features
        inside the app (see the{" "}
        <Link
          href="/privacy"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
        >
          Privacy Policy
        </Link>{" "}
        for details). Your use of YouTube itself remains governed by
        YouTube&rsquo;s own Terms of Service.
      </p>

      <h2 style={h2Style}>No warranty</h2>
      <p style={pStyle}>
        CreatorOS is provided &ldquo;as is&rdquo;, without warranty of any kind.
        Analytics and recommendations are derived from your real data but
        aren&rsquo;t guaranteed to be error-free or to predict outcomes on
        YouTube.
      </p>

      <h2 style={h2Style}>Changes</h2>
      <p style={pStyle}>
        We may update these terms as the app changes. Continued use after an
        update means you accept the revised terms.
      </p>

      <h2 style={h2Style}>Contact</h2>
      <p style={pStyle}>
        Questions about these terms — Ayaan Kumar,{" "}
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
