import { describe, it, expect } from "vitest";
import { formatCompactNumber } from "./chartTheme";

describe("formatCompactNumber", () => {
  it("leaves small numbers untouched", () => {
    expect(formatCompactNumber(0)).toBe("0");
    expect(formatCompactNumber(42)).toBe("42");
    expect(formatCompactNumber(999)).toBe("999");
  });

  it("formats thousands with a K suffix", () => {
    expect(formatCompactNumber(1000)).toBe("1K");
    expect(formatCompactNumber(12400)).toBe("12.4K");
    expect(formatCompactNumber(999_999)).toBe("1000K");
  });

  it("formats millions with an M suffix", () => {
    expect(formatCompactNumber(1_000_000)).toBe("1M");
    expect(formatCompactNumber(2_500_000)).toBe("2.5M");
  });

  it("trims a trailing .0 rather than showing a pointless decimal", () => {
    expect(formatCompactNumber(2000)).toBe("2K");
    expect(formatCompactNumber(3_000_000)).toBe("3M");
  });

  it("handles negative numbers", () => {
    expect(formatCompactNumber(-1500)).toBe("-1.5K");
    expect(formatCompactNumber(-42)).toBe("-42");
  });
});
