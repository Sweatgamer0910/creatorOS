import { motion as motionTokens } from "@/lib/design-tokens";

// Shared ECharts theme so every chart in the app pulls from one place
// instead of each instance hardcoding its own axis/tooltip colors. ECharts'
// `option` object is plain JS, not CSS, so it can't reference
// `var(--color-...)` directly — these hex values mirror globals.css's
// custom properties and need to be kept in sync by hand (already true of
// the hardcoded axis colors this file replaces).
export const chartColors = {
  border: "#262b34",
  textMuted: "#8b93a1",
  surfaceHover: "#1f242d",
  surface: "#171b22",
  text: "#e8eaed",
};

// motion.slow (0.25s) — a data reveal should read as deliberate, not
// instant, but shouldn't be the app's "fast" micro-interaction timing
// either. Pulled from design-tokens.ts rather than left at ECharts' own
// unrelated default.
export const chartAnimationDuration = motionTokens.slow * 1000;
export const chartAnimationEasing = "cubicOut";

export const chartTooltipTheme = {
  backgroundColor: chartColors.surface,
  borderColor: chartColors.border,
  borderWidth: 1,
  padding: [8, 12] as [number, number],
  textStyle: { color: chartColors.text, fontSize: 12 },
  extraCssText: "border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.35);",
};

export const chartAxisPointerTheme = {
  lineStyle: { color: chartColors.border, width: 1 },
  label: {
    backgroundColor: chartColors.surfaceHover,
    color: chartColors.text,
    borderColor: chartColors.border,
    borderWidth: 1,
  },
};

// "12400" -> "12.4K", "2500000" -> "2.5M" — trims a trailing ".0" so whole
// numbers don't show a pointless decimal.
export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}
