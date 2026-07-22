import { describe, it, expect } from "vitest";
import {
  countWords,
  estimateReadSeconds,
  formatReadTime,
  computeScriptWordStats,
} from "./wordCount";

describe("countWords", () => {
  it("counts space-separated words", () => {
    expect(countWords("hey there creator")).toBe(3);
  });

  it("returns 0 for empty or whitespace-only text", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   \n\t  ")).toBe(0);
  });

  it("collapses repeated whitespace/newlines between words", () => {
    expect(countWords("hey   there\n\nfriend")).toBe(3);
  });

  it("ignores leading/trailing whitespace", () => {
    expect(countWords("  hello world  ")).toBe(2);
  });
});

describe("estimateReadSeconds", () => {
  it("estimates at 150 words/minute", () => {
    expect(estimateReadSeconds(150)).toBe(60);
    expect(estimateReadSeconds(75)).toBe(30);
  });

  it("returns 0 for 0 words", () => {
    expect(estimateReadSeconds(0)).toBe(0);
  });
});

describe("formatReadTime", () => {
  it("formats under a minute as seconds", () => {
    expect(formatReadTime(45)).toBe("~45s");
    expect(formatReadTime(0)).toBe("~0s");
  });

  it("formats whole minutes without a seconds remainder", () => {
    expect(formatReadTime(120)).toBe("~2m");
  });

  it("formats minutes with a remainder", () => {
    expect(formatReadTime(90)).toBe("~1m 30s");
  });
});

describe("computeScriptWordStats", () => {
  it("computes per-section and total word/time stats", () => {
    const stats = computeScriptWordStats({
      hook: "one two three",
      intro: "four five",
      body: "",
      outro: "six",
    });

    expect(stats.hook.words).toBe(3);
    expect(stats.intro.words).toBe(2);
    expect(stats.body.words).toBe(0);
    expect(stats.outro.words).toBe(1);
    expect(stats.total.words).toBe(6);
    expect(stats.total.seconds).toBe(estimateReadSeconds(6));
  });

  it("handles a fully empty script", () => {
    const stats = computeScriptWordStats({
      hook: "",
      intro: "",
      body: "",
      outro: "",
    });
    expect(stats.total.words).toBe(0);
    expect(stats.total.seconds).toBe(0);
  });
});
