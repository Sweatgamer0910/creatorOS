const rows = [
  {
    label: "Fact",
    color: "#5FB3E0",
    bg: "rgba(95,179,224,0.12)",
    description: "Directly observed data, no interpretation.",
    tier: "High",
  },
  {
    label: "Pattern",
    color: "#8B7FE0",
    bg: "rgba(139,127,224,0.12)",
    description: "A trend or correlation found in the data.",
    tier: "Medium",
  },
  {
    label: "Recommendation",
    color: "#F5A623",
    bg: "rgba(245,166,35,0.14)",
    description: "A suggested action based on the above.",
    tier: "Medium",
  },
  {
    label: "Hypothesis",
    color: "#9AA0AC",
    bg: "rgba(107,114,128,0.18)",
    description: "A possible explanation, not yet confirmed.",
    tier: "Exploratory",
  },
];

export default function ConfidenceSystem() {
  return (
    <section
      id="confidence"
      style={{
        padding: "140px 32px",
        background: "#0E1116",
        borderTop: "1px solid rgba(245,243,238,0.08)",
        borderBottom: "1px solid rgba(245,243,238,0.08)",
      }}
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{ maxWidth: 1180, margin: "0 auto", gap: 64, alignItems: "center" }}
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
            The non-negotiable
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px,4vw,40px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              marginBottom: 18,
              color: "#F5F3EE",
            }}
          >
            AI outputs don&apos;t get to look more certain than they are.
          </h2>
          <p style={{ color: "#9AA0AC", fontSize: 16, maxWidth: 460 }}>
            Every AI-generated insight in CreatorOS — today and in every
            future version — is labeled with what kind of claim it&apos;s
            making, and how confident the system actually is in it.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                borderRadius: 12,
                background: "#171B22",
                border: "1px solid rgba(245,243,238,0.08)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.04em",
                  padding: "5px 10px",
                  borderRadius: 100,
                  flexShrink: 0,
                  width: 118,
                  textAlign: "center",
                  background: row.bg,
                  color: row.color,
                }}
              >
                {row.label}
              </span>
              <p style={{ fontSize: 13, color: "#9AA0AC" }}>{row.description}</p>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "#5B6270",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {row.tier}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
