export type IdeaStage =
  | { label: "Idea only" }
  | { label: "Scripted" }
  | { label: "In pipeline"; pipelineStatus: string }
  | { label: "Published" };

// Follows the idea -> script -> pipeline-card chain to figure out how far
// along an idea is. A content item can be linked directly to the idea, or
// reached via one of its scripts — either counts.
export function computeIdeaStage(idea: {
  scripts: { contentItems: { status: string }[] }[];
  contentItems: { status: string }[];
}): IdeaStage {
  const allItems = [
    ...idea.contentItems,
    ...idea.scripts.flatMap((s) => s.contentItems),
  ];

  if (allItems.some((item) => item.status === "published")) {
    return { label: "Published" };
  }
  if (allItems.length > 0) {
    return { label: "In pipeline", pipelineStatus: allItems[0].status };
  }
  if (idea.scripts.length > 0) {
    return { label: "Scripted" };
  }
  return { label: "Idea only" };
}
