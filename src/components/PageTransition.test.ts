import { describe, it, expect } from "vitest";
import { classify } from "./PageTransition";

describe("classify", () => {
  it("treats the first render (no previous path) as lateral", () => {
    expect(classify(null, "/dashboard")).toBe("lateral");
    expect(classify(null, "/series")).toBe("lateral");
  });

  it("treats a no-op navigation to the same path as lateral", () => {
    expect(classify("/ideas", "/ideas")).toBe("lateral");
  });

  it("drills forward from Idea Lab into the series list", () => {
    expect(classify("/ideas", "/series")).toBe("drillForward");
  });

  it("drills forward from the series list into a series detail page", () => {
    expect(classify("/series", "/series/abc123")).toBe("drillForward");
  });

  it("drills forward directly from Idea Lab into a series detail page", () => {
    expect(classify("/ideas", "/series/abc123")).toBe("drillForward");
  });

  it("drills back from a series detail page to the series list", () => {
    expect(classify("/series/abc123", "/series")).toBe("drillBack");
  });

  it("drills back from the series list to Idea Lab", () => {
    expect(classify("/series", "/ideas")).toBe("drillBack");
  });

  it("drills back directly from a series detail page to Idea Lab", () => {
    expect(classify("/series/abc123", "/ideas")).toBe("drillBack");
  });

  it("treats navigating between two different series detail pages as lateral (same depth)", () => {
    expect(classify("/series/abc123", "/series/xyz789")).toBe("lateral");
  });

  it("treats ordinary top-level app navigation as lateral", () => {
    expect(classify("/dashboard", "/analytics")).toBe("lateral");
    expect(classify("/analytics", "/coach")).toBe("lateral");
    expect(classify("/pipeline", "/scripts")).toBe("lateral");
  });

  it("treats navigation into a script detail page as lateral (not part of the drill relationship)", () => {
    expect(classify("/scripts", "/scripts/abc123")).toBe("lateral");
  });

  it("treats navigating from Idea Lab to an unrelated page as lateral", () => {
    expect(classify("/ideas", "/dashboard")).toBe("lateral");
    expect(classify("/dashboard", "/ideas")).toBe("lateral");
  });
});
