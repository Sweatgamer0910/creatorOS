"use client";

import { useId, useState } from "react";
import ReactECharts from "echarts-for-react";
import { DailyDataPoint } from "@/lib/analytics";
import Card from "@/components/ui/Card";
import RangePicker from "@/components/RangePicker";
import {
  chartColors,
  chartTooltipTheme,
  chartAxisPointerTheme,
  chartAnimationDuration,
  chartAnimationEasing,
  formatCompactNumber,
} from "@/lib/chartTheme";
import {
  RangePreset,
  RANGE_DAYS,
  RANGE_LABELS,
  RANGE_WINDOW_NAMES,
  bucketData,
  formatDateRange,
} from "@/lib/analytics/buckets";

type MetricKey = "views" | "subscribersGained" | "watchTimeMinutes";
type ChartStyle = "line" | "bar" | "area";

const METRICS: Record<MetricKey, { label: string; color: string }> = {
  views: { label: "Views", color: "#f5a623" },
  subscribersGained: { label: "Subscribers Gained", color: "#2dd4bf" },
  watchTimeMinutes: { label: "Watch Time (hrs)", color: "#5fb3e0" },
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
  const pickerId = useId();
  const availableRanges = (Object.keys(RANGE_DAYS) as RangePreset[]).filter(
    (r) => data.length >= RANGE_DAYS[r],
  );
  const initialRange = availableRanges[availableRanges.length - 1] ?? "7d";

  const [metric, setMetric] = useState<MetricKey>(defaultMetric);
  const [style, setStyle] = useState<ChartStyle>(defaultStyle);
  const [range, setRange] = useState<RangePreset>(initialRange);

  const buckets = bucketData(data, range);
  const meta = METRICS[metric];

  const dates = buckets.map((b) => b.label);
  const values = buckets.map((b) =>
    metric === "watchTimeMinutes"
      ? Math.round(b.watchTimeMinutes / 60)
      : b[metric],
  );

  const option = {
    tooltip: {
      trigger: "axis",
      ...chartTooltipTheme,
      axisPointer: chartAxisPointerTheme,
    },
    grid: { left: 48, right: 16, top: 16, bottom: 30 },
    animationDuration: chartAnimationDuration,
    animationEasing: chartAnimationEasing,
    xAxis: {
      type: "category",
      data: dates,
      axisLine: { lineStyle: { color: chartColors.border } },
      axisLabel: { color: chartColors.textMuted },
      axisPointer: chartAxisPointerTheme,
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: chartColors.surfaceHover } },
      axisLabel: {
        color: chartColors.textMuted,
        formatter: formatCompactNumber,
      },
    },
    textStyle: { color: chartColors.textMuted },
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
        style={{ marginBottom: 4 }}
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
            <RangePicker
              options={availableRanges.map((r) => ({
                value: r,
                label: RANGE_LABELS[r],
              }))}
              value={range}
              onChange={setRange}
              layoutId={`range-highlight-${pickerId}`}
            />
          )}
        </div>
      </div>

      {/* "What am I looking at" — always visible, not dependent on any
          scroll/scrub gesture, so it's never ambiguous how much data is
          shown (the thing the free-scrubbing zoom slider it replaced made
          genuinely unclear). */}
      <div
        style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          marginBottom: 12,
        }}
      >
        {formatDateRange(data, range)} · {RANGE_WINDOW_NAMES[range]}
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
