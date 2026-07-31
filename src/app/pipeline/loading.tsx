import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors src/app/pipeline/page.tsx + PipelineBoard.tsx: title, the
// new-item form, and the 5-column board (Idea / Scripted / Filming /
// Editing / Published), each with a column header and a couple of cards.
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
      <SkeletonBlock width={130} height={15} />
      <SkeletonBlock
        width="min(260px, 55%)"
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
        <SkeletonBlock width="65%" height={16} />
      </div>

      <SkeletonCard className="mt-8">
        <SkeletonBlock width="100%" height={40} radius="md" />
      </SkeletonCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        {Array.from({ length: 5 }).map((_, col) => (
          <div
            key={col}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <SkeletonBlock width="60%" height={13} />
            {Array.from({ length: col === 0 ? 2 : 1 }).map((_, card) => (
              <SkeletonCard key={card} padding="sm">
                <SkeletonBlock width="85%" height={14} />
                <SkeletonBlock
                  width="50%"
                  height={12}
                  style={{ marginTop: 8 }}
                />
              </SkeletonCard>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
