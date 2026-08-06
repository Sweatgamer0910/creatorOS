// Shared number-abbreviation formatter (1.2K / 3.4M / 5.52B / 1.1T) for any
// place in the app that displays a large count — view counts, subscriber
// counts, etc. Previously duplicated independently in
// ChannelHealthChecker.tsx (which had the B tier) and
// channel-health-preview/scorer.ts (which didn't), so a channel that
// cleared a billion views rendered correctly as "5.52B" in one place and
// as "5520.0M" in the other, depending on which formatter happened to run
// the number through. Consolidated to one implementation so every caller
// gets the same ceiling — including the T tier, since the biggest channels
// today sit in the tens-of-billions of lifetime views and are still
// climbing; without a trillion tier this would eventually repeat the same
// bug at the next order of magnitude.
//
// Trims insignificant trailing zeros before the unit suffix (21.0M -> 21M,
// 5.50B -> 5.5B, 5.00B -> 5B) while keeping real precision (21.1M, 5.52B).
function trimTrailingZero(s: string): string {
  return s.replace(/(\.\d*?)0+(?=[A-Z]$)/, "$1").replace(/\.(?=[A-Z]$)/, "");
}

export function formatCount(n: number): string {
  if (n >= 1_000_000_000_000)
    return trimTrailingZero(`${(n / 1_000_000_000_000).toFixed(2)}T`);
  if (n >= 1_000_000_000)
    return trimTrailingZero(`${(n / 1_000_000_000).toFixed(2)}B`);
  if (n >= 1_000_000) return trimTrailingZero(`${(n / 1_000_000).toFixed(1)}M`);
  if (n >= 1_000) return trimTrailingZero(`${(n / 1_000).toFixed(1)}K`);
  return String(n);
}
