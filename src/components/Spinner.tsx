"use client";

export default function Spinner({
  size = 24,
  variant = "accent",
}: {
  size?: number;
  variant?: "accent" | "dark";
}) {
  const color = variant === "dark" ? "#0e1116" : "var(--color-accent)";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: color,
          borderRightColor: color,
          animation: "creatoros-spin 0.7s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            marginLeft: size * 0.04,
            borderTop: `${size * 0.16}px solid transparent`,
            borderBottom: `${size * 0.16}px solid transparent`,
            borderLeft: `${size * 0.26}px solid ${color}`,
          }}
        />
      </div>
      <style>{`
        @keyframes creatoros-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
