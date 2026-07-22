"use client";

import { useState } from "react";
import ReactECharts from "echarts-for-react";
import { DailyDataPoint } from "@/lib/analytics";
import Card from "@/components/ui/Card";

type MetricKey = "views" | "subscribersGained" | "watchTimeMinutes";
type ChartStyle = "line" | "bar" | "area";
type RangePreset = "7d" | "30d" | "90d" | "1y";

const METRICS: Record<MetricKey, { label: string; color: string }> = {
  views: { label: "Views", color: "#f5a623" },
  subscribersGained: { label: "Subscribers Gained", color: "#2dd4bf" },
  watchTimeMinutes: { label: "Watch Time (hrs)", color: "#5fb3e0" },
};

const RANGE_DAYS: Record<RangePreset, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

const RANGE_LABELS: Record<RangePreset, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "1y": "1Y",
};

const selectStyle: React.CSSProperties = {
  background: "var(--color-surface-hover)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  color: "var(--color-text)",
  fontSize: 12,
  padding: "5px 8px",
};

const segmentWrapStyle: React.CSSProperties = {
  display: "flex",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  overflow: "hidden",
};

function segmentButtonStyle(active: boolean): React.CSSProperties {
  return {
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 500,
    background: active ? "var(--color-accent)" : "transparent",
    color: active ? "#000" : "var(--color-text-muted)",
    border: "none",
    cursor: "pointer",
  };
}

function MetricChartCard({
  data,
  defaultMetric,
  defaultStyle,
}: {
  data: DailyDataPoint[];
  defaultMetric: MetricKey;
  defaultStyle: ChartStyle;
}) {
  const availableRanges = (Object.keys(RANGE_DAYS) as RangePreset[]).filter(
    (r) => data.length >= RANGE_DAYS[r],
  );
  const initialRange = availableRanges[availableRanges.length - 1] ?? "7d";

  const [metric, setMetric] = useState<MetricKey>(defaultMetric);
  const [style, setStyle] = useState<ChartStyle>(defaultStyle);
  const [range, setRange] = useState<RangePreset>(initialRange);

  const windowed = data.slice(-RANGE_DAYS[range]);
  const meta = METRICS[metric];

  const dates = windowed.map((d) => d.date.slice(5));
  const values = windowed.map((d) =>
    metric === "watchTimeMinutes"
      ? Math.round(d.watchTimeMinutes / 60)
      : d[metric],
  );

  const showZoom = windowed.length > 14;

  const option = {
    tooltip: { trigger: "axis" },
    grid: { left: 44, right: 16, top: 16, bottom: showZoom ? 56 : 30 },
    xAxis: {
      type: "category",
      data: dates,
      axisLine: { lineStyle: { color: "#262b34" } },
      axisLabel: { color: "#8b93a1" },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#1f242d" } },
      axisLabel: { color: "#8b93a1" },
    },
    textStyle: { color: "#8b93a1" },
    dataZoom: showZoom
      ? [
          { type: "inside", start: 0, end: 100 },
          {
            type: "slider",
            start: 0,
            end: 100,
            height: 18,
            bottom: 6,
            borderColor: "#262b34",
            backgroundColor: "#171b22",
            fillerColor: `${meta.color}1f`,
            handleStyle: { color: meta.color },
            textStyle: { color: "#8b93a1" },
          },
        ]
      : [],
    series: [
      {
        data: values,
        type: style === "bar" ? "bar" : "line",
        smooth: style !== "bar",
        areaStyle: style === "area" ? { color: `${meta.color}26` } : undefined,
        lineStyle: { color: meta.color },
        itemStyle: { color: meta.color },
      },
    ],
  };

  return (
    <Card padding="sm">
      <div
        className="flex items-center justify-between flex-wrap gap-3"
        style={{ marginBottom: 12 }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-text)",
          }}
        >
          {meta.label}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as MetricKey)}
            style={selectStyle}
          >
            {(
              Object.entries(METRICS) as [
                MetricKey,
                (typeof METRICS)[MetricKey],
              ][]
            ).map(([key, m]) => (
              <option key={key} value={key}>
                {m.label}
              </option>
            ))}
          </select>
          <div style={segmentWrapStyle}>
            {(["line", "bar", "area"] as ChartStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                style={segmentButtonStyle(style === s)}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          {availableRanges.length > 1 && (
            <div style={segmentWrapStyle}>
              {availableRanges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  style={segmentButtonStyle(range === r)}
                >
                  {RANGE_LABELS[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <ReactECharts
        option={option}
        style={{ height: 280 }}
        notMerge
        lazyUpdate
      />
    </Card>
  );
}

export default function AnalyticsCharts({ data }: { data: DailyDataPoint[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MetricChartCard data={data} defaultMetric="views" defaultStyle="line" />
      <MetricChartCard
        data={data}
        defaultMetric="subscribersGained"
        defaultStyle="bar"
      />
    </div>
  );
}
