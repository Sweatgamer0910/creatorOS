export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export type AnchorPlacement = "top" | "bottom" | "left" | "right";

const GAP = 16;
const EDGE_MARGIN = 12;

// Where to fly the tour widget for a given target + author-chosen
// placement, clamped so it never renders off-screen — placement is
// hand-picked per step rather than auto-collision-detected (see
// steps.ts), this only handles the "ran out of room at the edge" case.
export function computeAnchorPosition(
  targetRect: Rect,
  placement: AnchorPlacement,
  viewport: Size,
  widget: Size,
): { x: number; y: number } {
  let x: number;
  let y: number;

  switch (placement) {
    case "top":
      x = targetRect.left + targetRect.width / 2 - widget.width / 2;
      y = targetRect.top - widget.height - GAP;
      break;
    case "bottom":
      x = targetRect.left + targetRect.width / 2 - widget.width / 2;
      y = targetRect.top + targetRect.height + GAP;
      break;
    case "left":
      x = targetRect.left - widget.width - GAP;
      y = targetRect.top + targetRect.height / 2 - widget.height / 2;
      break;
    case "right":
      x = targetRect.left + targetRect.width + GAP;
      y = targetRect.top + targetRect.height / 2 - widget.height / 2;
      break;
  }

  return {
    x: clamp(x, EDGE_MARGIN, viewport.width - widget.width - EDGE_MARGIN),
    y: clamp(y, EDGE_MARGIN, viewport.height - widget.height - EDGE_MARGIN),
  };
}

// A widget bigger than the viewport would otherwise invert the clamp
// range (max < min) and produce a value outside [min, max] entirely.
function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

// Centered "welcome"/"finish" steps have no target to anchor to.
export function computeCenteredPosition(
  viewport: Size,
  widget: Size,
): { x: number; y: number } {
  return {
    x: (viewport.width - widget.width) / 2,
    y: (viewport.height - widget.height) / 2,
  };
}
