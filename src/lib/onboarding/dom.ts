import type { Rect } from "./positioning";

export function rectFromElement(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Route changes (PageTransition's per-page remount) mean a step's target
// isn't necessarily in the DOM the instant the new page's React tree
// commits — poll for it instead of assuming it's there on the first tick.
export async function pollForElement(
  selector: string,
  intervalMs = 150,
  maxAttempts = 8,
): Promise<HTMLElement | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) return el;
    await wait(intervalMs);
  }
  return document.querySelector<HTMLElement>(selector);
}

function rectsMatch(a: Rect, b: Rect): boolean {
  return (
    Math.abs(a.top - b.top) < 1 &&
    Math.abs(a.left - b.left) < 1 &&
    Math.abs(a.width - b.width) < 1 &&
    Math.abs(a.height - b.height) < 1
  );
}

// A fixed post-scrollIntoView delay was a guess at how long the browser's
// smooth-scroll animation takes — wrong for long distances (e.g. a Back
// navigation scrolling back up the page), which left the spotlight locked
// onto a rect measured mid-scroll. This instead polls until two
// consecutive reads agree, so it only settles once the element has
// genuinely stopped moving, however long that actually takes.
export async function waitForStableRect(
  el: HTMLElement,
  intervalMs = 80,
  maxAttempts = 8,
): Promise<Rect> {
  let previous = rectFromElement(el);
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await wait(intervalMs);
    const current = rectFromElement(el);
    if (rectsMatch(current, previous)) return current;
    previous = current;
  }
  return previous;
}
