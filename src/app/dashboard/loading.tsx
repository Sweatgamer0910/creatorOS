import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors the real page's structure (src/app/dashboard/page.tsx) so the
// layout doesn't jump when data arrives: greeting text, the Channel
// Health tile, the "resume work" row, and the 5-card quick-access grid.
export default function Loading() {
  return (
    <div
      className="px-4 sm:px-10"
      style={{
        paddingTop: 24,
        paddingBottom: 48,
        maxWidth: 1160,
        margin: "0 auto",
      }}
    >
      <SkeletonBlock width={140} height={15} />
      <SkeletonBlock
        width="min(420px, 60%)"
        height={38}
        style={{ marginTop: 10 }}
      />
      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <SkeletonBlock width="90%" height={16} />
        <SkeletonBlock width="55%" height={16} />
      </div>

      {/* Channel Health tile */}
      <SkeletonCard
        className="flex items-center justify-between"
        style={{ marginTop: 32 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SkeletonBlock width={110} height={12} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <SkeletonBlock width={60} height={34} />
            <SkeletonBlock width={90} height={18} />
          </div>
          <SkeletonBlock width={90} height={13} />
        </div>
        <div className="flex items-end gap-[3px] h-8" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonBlock
              key={i}
              width={5}
              height={10 + (i / 12) * 22}
              radius="sm"
              style={{ alignSelf: "flex-end" }}
            />
          ))}
        </div>
      </SkeletonCard>

      {/* Resume work row */}
      <div style={{ marginTop: 32 }}>
        <SkeletonBlock width={200} height={18} />
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          style={{ marginTop: 12 }}
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} className="flex items-start gap-3">
              <SkeletonBlock width={32} height={32} radius="md" />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  flex: 1,
                }}
              >
                <SkeletonBlock width="40%" height={11} />
                <SkeletonBlock width="75%" height={15} />
                <SkeletonBlock width="35%" height={13} />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <SkeletonBlock
        width={140}
        height={22}
        style={{ marginTop: 48, marginBottom: 16 }}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex flex-col gap-3">
              <SkeletonBlock width={36} height={36} radius="full" />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <SkeletonBlock width="55%" height={16} />
                <SkeletonBlock width="85%" height={13} />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
