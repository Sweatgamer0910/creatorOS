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
      <p style={{ ...pStyle, marginTop: 8 }}>Last updated July 30, 2026.</p>

      <p style={pStyle}>
        By creating a CreatorOS account or using the app, you agree to these
        terms. If you don&rsquo;t agree, don&rsquo;t use CreatorOS. CreatorOS
        is operated by Ayaan Kumar (&ldquo;we&rdquo;, &ldquo;us&rdquo;), based
        in Texas.
      </p>

      <h2 style={h2Style}>Eligibility</h2>
      <p style={pStyle}>
        You must be at least 13 years old to use CreatorOS. CreatorOS is not
        directed to children under 13, and we don&rsquo;t knowingly collect
        information from anyone under 13. If we learn that we&rsquo;ve
        collected information from a user under 13, we&rsquo;ll delete it. If
        you&rsquo;re between 13 and the age of majority where you live, you
        confirm that a parent or guardian has reviewed and agreed to these
        terms on your behalf.
      </p>

      <h2 style={h2Style}>Your account</h2>
      <p style={pStyle}>
        You&rsquo;re responsible for the content you create in CreatorOS, for
        keeping your login credentials secure, and for all activity under
        your account. You must be able to legally agree to these terms to
        create an account, and the information you give us (name, email) must
        be accurate.
      </p>

      <h2 style={h2Style}>Acceptable use</h2>
      <p style={pStyle}>
        Use CreatorOS for its intended purpose — planning and producing your
        own content. Don&rsquo;t use it to access, scrape, or interfere with
        data belonging to channels you don&rsquo;t own or have authorization
        to manage; don&rsquo;t attempt to disrupt, reverse-engineer, or gain
        unauthorized access to the service or other users&rsquo; accounts; and
        don&rsquo;t use CreatorOS for anything illegal or that infringes
        someone else&rsquo;s rights.
      </p>

      <h2 style={h2Style}>Your content</h2>
      <p style={pStyle}>
        You own everything you create inside CreatorOS — ideas, scripts,
        series, and pipeline entries. We only store and display it back to
        you; we don&rsquo;t claim any ownership over it or publish it
        anywhere.
      </p>

      <h2 style={h2Style}>YouTube data</h2>
      <p style={pStyle}>
        Connecting a YouTube channel grants CreatorOS read-only access to your
        channel&rsquo;s statistics and analytics, used solely to power
        features inside the app (see the{" "}
        <Link
          href="/privacy"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
        >
          Privacy Policy
        </Link>{" "}
        for details, including how CreatorOS&rsquo;s use of YouTube API
        Services is governed). Your use of YouTube itself remains governed by
        YouTube&rsquo;s own Terms of Service.
      </p>

      <h2 style={h2Style}>Termination</h2>
      <p style={pStyle}>
        You can stop using CreatorOS and delete your account at any time from{" "}
        <Link
          href="/settings"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
        >
          Settings
        </Link>
        . We may suspend or terminate your access if you violate these terms,
        misuse the service, or where we&rsquo;re required to by law. We may
        also discontinue CreatorOS or any feature of it at any time; if we do,
        we&rsquo;ll try to give you reasonable notice and a chance to export
        or delete your data first.
      </p>

      <h2 style={h2Style}>Disclaimers</h2>
      <p style={pStyle}>
        <strong>
          CreatorOS is provided &ldquo;as is&rdquo; and &ldquo;as
          available,&rdquo; without warranties of any kind, express or
          implied, including merchantability, fitness for a particular
          purpose, and non-infringement.
        </strong>{" "}
        We don&rsquo;t warrant that the service will be uninterrupted,
        error-free, or secure. Analytics and recommendations are derived from
        your real data but aren&rsquo;t guaranteed to be accurate or to
        predict outcomes on YouTube — Health Score and Growth Coach are
        rule-based tools, not professional advice.
      </p>

      <h2 style={h2Style}>Limitation of liability</h2>
      <p style={pStyle}>
        <strong>
          To the maximum extent permitted by law, CreatorOS won&rsquo;t be
          liable for any indirect, incidental, special, consequential, or
          punitive damages, or any loss of profits, revenue, data, or
          goodwill, arising from your use of the service. Our total liability
          for any claim arising from these terms or the service is limited to
          the greater of $100 or the amount you paid us in the 12 months
          before the claim arose.
        </strong>{" "}
        Some jurisdictions don&rsquo;t allow these limitations, so some of
        them may not apply to you.
      </p>

      <h2 style={h2Style}>Indemnification</h2>
      <p style={pStyle}>
        You agree to defend and indemnify us against any claims, losses, or
        expenses (including reasonable legal fees) arising from your misuse of
        CreatorOS, your content, or your violation of these terms or anyone
        else&rsquo;s rights.
      </p>

      <h2 style={h2Style}>Governing law &amp; dispute resolution</h2>
      <p style={pStyle}>
        These terms are governed by the laws of the State of Texas, without
        regard to conflict-of-law rules.
      </p>
      <p style={pStyle}>
        <strong>
          Binding arbitration &amp; class action waiver: any dispute arising
          from these terms or CreatorOS will be resolved by binding individual
          arbitration rather than in court, and you and CreatorOS each waive
          the right to a jury trial or to participate in a class action or
          class arbitration.
        </strong>{" "}
        Either party may still bring an individual claim in small claims
        court instead of arbitration if it qualifies. You can opt out of this
        arbitration agreement by emailing{" "}
        <a
          href="mailto:support.creatoros@gmail.com"
          className="glow-text"
          style={{ color: "var(--color-accent)" }}
        >
          support.creatoros@gmail.com
        </a>{" "}
        with your name and account email within 30 days of creating your
        account or of this clause first taking effect for existing accounts,
        whichever is later — opting out doesn&rsquo;t affect any other part of
        these terms.
      </p>

      <h2 style={h2Style}>Changes</h2>
      <p style={pStyle}>
        We may update these terms as the app changes. If a change is
        material, we&rsquo;ll make reasonable efforts to let existing users
        know (e.g. email or an in-app notice). Continued use after an update
        means you accept the revised terms.
      </p>

      <h2 style={h2Style}>General</h2>
      <p style={pStyle}>
        If any part of these terms is found unenforceable, the rest stays in
        effect. These terms (plus the Privacy Policy) are the entire
        agreement between you and CreatorOS regarding the service, and
        supersede any earlier agreements on the same subject. Our failure to
        enforce any part of these terms isn&rsquo;t a waiver of it. You
        can&rsquo;t assign your account or these terms to anyone else without
        our consent; we may assign them, e.g. as part of a merger or
        acquisition.
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
