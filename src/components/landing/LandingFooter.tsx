export default function LandingFooter() {
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        padding: "24px 40px 32px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.35)",
        }}
      >
        © {new Date().getFullYear()} CreatorOS. All rights reserved.
      </p>
    </footer>
  );
}
