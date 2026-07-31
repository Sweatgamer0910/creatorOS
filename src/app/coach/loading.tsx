import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors src/app/coach/page.tsx: title, the CoachSummaryHeader (score +
// 30-day sparkline), the disclaimer line, the "Your next move"
// recommendation card(s), and the "Why" list of insight cards.
export default function Loading() {
  return (
    <div
      className="px-4 sm:px-10"
      style={{
        paddingTop: 24,
        paddingBottom: 48,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <SkeletonBlock width={110} height={15} />
      <SkeletonBlock
        width="min(320px, 55%)"
        height={38}
        style={{ marginTop: 10 }}
      />

      {/* CoachSummaryHeader */}
      <SkeletonCard
        className="flex items-center justify-between gap-6 flex-wrap"
        style={{ marginTop: 16 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SkeletonBlock width={100} height={12} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <SkeletonBlock width={54} height={30} />
            <SkeletonBlock width={80} height={16} />
          </div>
        </div>
        <div style={{ flex: "1 1 200px", minWidth: 160, maxWidth: 320 }}>
          <SkeletonBlock width={110} height={10} style={{ marginBottom: 6 }} />
          <SkeletonBlock width="100%" height={40} radius="md" />
        </div>
      </SkeletonCard>

      <SkeletonBlock width="70%" height={13} style={{ marginTop: 10 }} />

      {/* "Your next move" */}
      <div className="mt-8">
        <SkeletonBlock width={130} height={17} style={{ marginBottom: 12 }} />
        <SkeletonCard padding="md">
          <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
            <SkeletonBlock width={90} height={11} />
            <SkeletonBlock width={90} height={11} />
          </div>
          <SkeletonBlock width="95%" height={16} />
          <SkeletonBlock width="60%" height={16} style={{ marginTop: 6 }} />
        </SkeletonCard>
      </div>

      {/* "Why" */}
      <div className="mt-8">
        <SkeletonBlock width={50} height={15} style={{ marginBottom: 12 }} />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} padding="sm">
              <div
                className="flex items-center gap-3"
                style={{ marginBottom: 8 }}
              >
                <SkeletonBlock width={70} height={11} />
                <SkeletonBlock width={80} height={11} />
              </div>
              <SkeletonBlock width="90%" height={14} />
              <SkeletonBlock width="50%" height={14} style={{ marginTop: 6 }} />
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  );
}
