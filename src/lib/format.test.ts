import { describe, it, expect } from "vitest";
import { formatCount } from "./format";

describe("formatCount", () => {
  it("leaves small numbers untouched", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(42)).toBe("42");
    expect(formatCount(999)).toBe("999");
  });

  it("formats thousands with a K suffix", () => {
    expect(formatCount(1_000)).toBe("1K");
    expect(formatCount(12_400)).toBe("12.4K");
  });

  it("formats millions with an M suffix", () => {
    expect(formatCount(1_000_000)).toBe("1M");
    expect(formatCount(2_500_000)).toBe("2.5M");
  });

  it("rolls over to a B suffix above a billion instead of staying in M", () => {
    // The regression this whole file exists to prevent: a channel with
    // 5.52 billion lifetime views must read as "5.52B", never "5520.0M".
    expect(formatCount(1_000_000_000)).toBe("1B");
    expect(formatCount(5_520_000_000)).toBe("5.52B");
  });

  it("rolls over to a T suffix above a trillion", () => {
    expect(formatCount(1_000_000_000_000)).toBe("1T");
    expect(formatCount(2_340_000_000_000)).toBe("2.34T");
  });

  it("trims insignificant trailing zeros but keeps real precision", () => {
    expect(formatCount(21_000_000)).toBe("21M");
    expect(formatCount(21_100_000)).toBe("21.1M");
    expect(formatCount(5_500_000_000)).toBe("5.5B");
    expect(formatCount(5_520_000_000)).toBe("5.52B");
  });
});
