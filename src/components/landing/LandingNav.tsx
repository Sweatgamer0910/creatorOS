import Link from "next/link";

export default function LandingNav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 32px",
        background: "rgba(3,3,4,0.55)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        borderBottom: "1px solid rgba(245,243,238,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "-0.01em",
          color: "#F5F3EE",
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "linear-gradient(135deg, #F5A623, #D9861A)",
            boxShadow: "0 0 18px rgba(245,166,35,0.55)",
            flexShrink: 0,
          }}
        />
        CreatorOS
      </div>
      <div
        className="hidden sm:flex"
        style={{ gap: 32, fontSize: 14, color: "#9AA0AC" }}
      >
        {/* The 5-card scatter/converge sequence is what visitors actually
            mean by "the product" — the ring/tile pipeline section above it
            is more of a process illustration. */}
        <a href="#workspace-assembly-track" className="glow-text">
          Product
        </a>
        <a href="#features" className="glow-text">
          Features
        </a>
        <a href="#confidence" className="glow-text">
          How AI works here
        </a>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Link
          href="/login"
          className="glow-interactive"
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "9px 18px",
            borderRadius: 8,
            border: "1px solid rgba(245,243,238,0.14)",
            color: "#F5F3EE",
            textDecoration: "none",
          }}
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="glow-interactive"
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "9px 18px",
            borderRadius: 8,
            background: "#F5A623",
            color: "#030304",
            textDecoration: "none",
          }}
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
}
