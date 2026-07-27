import { describe, it, expect } from "vitest";
import {
  computeAnchorPosition,
  computeCenteredPosition,
  type Rect,
} from "./positioning";

const viewport = { width: 1200, height: 800 };
const widget = { width: 280, height: 140 };

const centeredTarget: Rect = { top: 300, left: 500, width: 100, height: 40 };

describe("computeAnchorPosition", () => {
  it("places 'bottom' below the target, horizontally centered on it", () => {
    const { x, y } = computeAnchorPosition(
      centeredTarget,
      "bottom",
      viewport,
      widget,
    );
    expect(y).toBe(centeredTarget.top + centeredTarget.height + 16);
    expect(x).toBe(
      centeredTarget.left + centeredTarget.width / 2 - widget.width / 2,
    );
  });

  it("places 'top' above the target", () => {
    const { y } = computeAnchorPosition(
      centeredTarget,
      "top",
      viewport,
      widget,
    );
    expect(y).toBe(centeredTarget.top - widget.height - 16);
  });

  it("places 'left' to the left of the target", () => {
    const { x } = computeAnchorPosition(
      centeredTarget,
      "left",
      viewport,
      widget,
    );
    expect(x).toBe(centeredTarget.left - widget.width - 16);
  });

  it("places 'right' to the right of the target", () => {
    const { x } = computeAnchorPosition(
      centeredTarget,
      "right",
      viewport,
      widget,
    );
    expect(x).toBe(centeredTarget.left + centeredTarget.width + 16);
  });

  it("clamps to the edge margin when the target is at the top of the viewport", () => {
    const target: Rect = { top: 0, left: 500, width: 100, height: 40 };
    const { y } = computeAnchorPosition(target, "top", viewport, widget);
    // Unclamped this would be negative (0 - 140 - 16).
    expect(y).toBe(12);
  });

  it("clamps to the right/bottom edge when the target is near the far edge", () => {
    const target: Rect = { top: 780, left: 1150, width: 40, height: 20 };
    const { x, y } = computeAnchorPosition(target, "bottom", viewport, widget);
    expect(x).toBeLessThanOrEqual(viewport.width - widget.width - 12);
    expect(y).toBeLessThanOrEqual(viewport.height - widget.height - 12);
  });

  it("falls back to the edge margin instead of an inverted range when the widget is bigger than the viewport", () => {
    const hugeWidget = { width: 2000, height: 2000 };
    const { x, y } = computeAnchorPosition(
      centeredTarget,
      "bottom",
      viewport,
      hugeWidget,
    );
    expect(x).toBe(12);
    expect(y).toBe(12);
  });
});

describe("computeCenteredPosition", () => {
  it("centers the widget in the viewport", () => {
    const { x, y } = computeCenteredPosition(viewport, widget);
    expect(x).toBe((viewport.width - widget.width) / 2);
    expect(y).toBe((viewport.height - widget.height) / 2);
  });
});
