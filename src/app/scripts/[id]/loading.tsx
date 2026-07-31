import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors src/app/scripts/[id]/ScriptEditor.tsx: a title/meta header row,
// then the 4 hook/intro/body/outro sections, each with a label row and a
// large textarea-shaped block.
export default function Loading() {
  return (
    <div
      className="px-4 sm:px-10"
      style={{
        paddingTop: 20,
        paddingBottom: 40,
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <SkeletonBlock width={90} height={13} />
      <div
        className="flex items-center justify-between flex-wrap gap-2"
        style={{ marginTop: 10 }}
      >
        <SkeletonBlock width="min(360px, 60%)" height={32} />
        <SkeletonBlock width={90} height={30} radius="md" />
      </div>

      <div className="flex flex-col gap-6 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <SkeletonBlock width={100} height={15} />
              <SkeletonBlock width={90} height={12} />
            </div>
            <SkeletonBlock width="100%" height={110} radius="md" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
