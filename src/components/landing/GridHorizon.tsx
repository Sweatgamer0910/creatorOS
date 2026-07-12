export default function GridHorizon() {
  return (
    <div
      style={{
        position: "absolute",
        inset: "-60px -60px -40px -60px",
        pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(245,166,35,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.3) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage:
          "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 70%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 70%)",
      }}
    />
  );
}
