"use client";

import ReactECharts from "echarts-for-react";
import { DailyDataPoint } from "@/lib/analytics";

export default function AnalyticsCharts({ data }: { data: DailyDataPoint[] }) {
  const dates = data.map((d) => d.date.slice(5));
  const views = data.map((d) => d.views);
  const subscribersGained = data.map((d) => d.subscribersGained);

  const baseOption = {
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: "category", data: dates, axisLine: { lineStyle: { color: "#262b34" } } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: "#1f242d" } } },
    textStyle: { color: "#8b93a1" },
  };

  const viewsOption = {
    ...baseOption,
    title: { text: "Views (Last 30 Days)", textStyle: { color: "#e8eaed", fontSize: 14 } },
    series: [
      {
        data: views,
        type: "line",
        smooth: true,
        areaStyle: { color: "rgba(245, 166, 35, 0.15)" },
        lineStyle: { color: "#f5a623" },
        itemStyle: { color: "#f5a623" },
      },
    ],
  };

  const subsOption = {
    ...baseOption,
    title: { text: "Subscribers Gained", textStyle: { color: "#e8eaed", fontSize: 14 } },
    series: [
      {
        data: subscribersGained,
        type: "bar",
        itemStyle: { color: "#2dd4bf" },
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 16 }}
      >
        <ReactECharts option={viewsOption} style={{ height: 280 }} />
      </div>
      <div
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 16 }}
      >
        <ReactECharts option={subsOption} style={{ height: 280 }} />
      </div>
    </div>
  );
}
