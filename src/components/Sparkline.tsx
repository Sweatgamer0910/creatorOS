// Plain SVG line+area sparkline — no ECharts instance, no client JS. Used
// for small "here's the real trend behind this claim" visuals (Growth
// Coach's summary header and per-insight trend), where mounting a full
// chart library instance per usage would be unnecessary weight for
// something glance-sized.
export default function Sparkline({
  data,
  color,
  height = 28,
}: {
  data: number[];
  color: string;
  height?: number;
}) {
  if (data.length < 2) return null;

  const width = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const linePoints = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      style={{ display: "block" }}
      role="img"
      aria-label="Trend sparkline"
    >
      <polygon points={areaPoints} fill={color} opacity={0.12} />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
