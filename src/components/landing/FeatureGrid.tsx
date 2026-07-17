import TiltCard from "./TiltCard";

const features = [
  {
    title: "Analytics Dashboard",
    description:
      "Real YouTube Data & Analytics API integration, with a mock/real provider pattern so nothing burns quota during development.",
    path: "M4 19V9M12 19V5M20 19v-7",
  },
  {
    title: "Channel Health Score",
    // Same tag/wording as AI Growth Coach below, and for the same reason:
    // rule-based and fully explainable today, with predictive/recovery-
    // suggestion AI enhancements on the roadmap per the handbook, not yet
    // shipped — the tag says that honestly instead of implying it's here.
    soonTag: "AI insights — coming soon",
    description:
      "A rule-based, fully explainable score — every insight labeled Fact, Pattern, Recommendation, or Hypothesis.",
    path: "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8",
  },
  {
    title: "AI Growth Coach",
    soonTag: "AI insights — coming soon",
    description:
      "Rule-based coaching today, predictable and hallucination-free while the product earns trust — deeper AI-powered insight is next.",
    path: "M13 2 3 14h7l-1 8 10-12h-7l1-8z",
  },
  {
    title: "Idea Lab",
    description:
      "Full CRUD for content ideas with real, educational empty states — never a blank broken screen.",
    path: "circle:12,12,9|M12 7v5l3 3",
  },
  {
    title: "Script Studio",
    description: "Hook, intro, body, outro — a four-section editor that autosaves as you write.",
    path: "M4 6h16M4 12h16M4 18h10",
  },
  {
    title: "Kanban Pipeline",
    description:
      "Native drag-and-drop content pipeline — from idea to done, no extra library required.",
    path: "rect:3,4,18,16,2|M9 4v16M15 4v16",
  },
];

function FeatureIcon({ path }: { path: string }) {
  const parts = path.split("|");
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} stroke="#F5A623" width={18} height={18}>
      {parts.map((part, i) => {
        if (part.startsWith("circle:")) {
          const [cx, cy, r] = part.slice(7).split(",").map(Number);
          return <circle key={i} cx={cx} cy={cy} r={r} />;
        }
        if (part.startsWith("rect:")) {
          const [x, y, w, h, rx] = part.slice(5).split(",").map(Number);
          return <rect key={i} x={x} y={y} width={w} height={h} rx={rx} />;
        }
        return <path key={i} d={part} />;
      })}
    </svg>
  );
}

export default function FeatureGrid() {
  return (
    <section id="features" style={{ padding: "100px 32px 140px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ maxWidth: 640, marginBottom: 64 }}>
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
            In the workspace today
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(30px,4vw,48px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              marginBottom: 14,
              color: "#F5F3EE",
            }}
          >
            Built, not promised.
          </h2>
          <p style={{ color: "#9AA0AC", fontSize: 16, maxWidth: 520 }}>
            These are the pieces already working end-to-end in CreatorOS — not a roadmap slide.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <TiltCard key={f.title}>
              <div
                className="glow-interactive"
                style={{
                  // Darkened toward the page's OLED-black (#030304) rather
                  // than the app's usual --color-surface (#171B22, too
                  // light here and would read as blending into the page) —
                  // kept distinct via the amber-tinted hairline border and
                  // ambient shadow below instead of flat color contrast.
                  // Exact hex is a judgment call within the requested
                  // #0A0C10–#0D0F13 range, worth eyeballing against the
                  // final page background in review.
                  background: "#0C0E12",
                  border: "1px solid rgba(245,166,35,0.12)",
                  borderRadius: 18,
                  boxShadow:
                    "0 20px 50px -28px rgba(0,0,0,0.7), 0 0 40px -22px rgba(245,166,35,0.18)",
                  padding: "32px 28px",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(245,166,35,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <FeatureIcon path={f.path} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 17,
                    fontWeight: 600,
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    color: "#F5F3EE",
                  }}
                >
                  {f.title}
                  {f.soonTag && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9.5,
                        fontWeight: 400,
                        letterSpacing: "0.04em",
                        color: "#F5A623",
                        background: "rgba(245,166,35,0.14)",
                        border: "1px solid rgba(245,166,35,0.3)",
                        borderRadius: 100,
                        padding: "3px 9px",
                        textTransform: "uppercase",
                      }}
                    >
                      {f.soonTag}
                    </span>
                  )}
                </h3>
                <p style={{ fontSize: 14, color: "#9AA0AC", lineHeight: 1.55 }}>
                  {f.description}
                </p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
