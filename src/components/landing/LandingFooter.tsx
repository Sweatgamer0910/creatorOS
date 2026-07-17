export default function LandingFooter() {
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 1,
        padding: "40px 32px",
        borderTop: "1px solid rgba(245,243,238,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        fontSize: 13,
        color: "#5B6270",
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
      <div style={{ display: "flex", gap: 32, fontSize: 13 }}>
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
      <div>© {new Date().getFullYear()} CreatorOS</div>
    </footer>
  );
}
