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
        &ldquo;Solar System Model (Orrery)&rdquo; by{" "}
        <a
          href="https://sketchfab.com/Smoggybeard"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(255,255,255,0.5)", textDecoration: "underline" }}
        >
          Smoggybeard
        </a>{" "}
        — licensed under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(255,255,255,0.5)", textDecoration: "underline" }}
        >
          CC BY 4.0
        </a>
      </p>
    </footer>
  );
}
