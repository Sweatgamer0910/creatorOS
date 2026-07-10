"use client";

import ReactECharts from "echarts-for-react";
import { DailyDataPoint } from "@/lib/analytics";

export default function AnalyticsCharts({ data }: { data: DailyDataPoint[] }) {
  const dates = data.map((d) => d.date.slice(5)); // MM-DD
  const views = data.map((d) => d.views);
  const subscribersGained = data.map((d) => d.subscribersGained);

  const viewsOption = {
    title: { text: "Views (Last 30 Days)" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: dates },
    yAxis: { type: "value" },
    series: [
      {
        data: views,
        type: "line",
        smooth: true,
        areaStyle: {},
      },
    ],
  };

  const subsOption = {
    title: { text: "Subscribers Gained (Last 30 Days)" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: dates },
    yAxis: { type: "value" },
    series: [
      {
        data: subscribersGained,
        type: "bar",
      },
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <ReactECharts option={viewsOption} style={{ height: 300 }} />
      <ReactECharts option={subsOption} style={{ height: 300 }} />
    </div>
  );
}
