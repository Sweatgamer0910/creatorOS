"use client";

import { AnimatePresence, motion } from "framer-motion";
import { motion as motionTokens, easing } from "@/lib/design-tokens";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import IdeaCard, { type Idea } from "./IdeaCard";

// Deleting an idea used to just vanish it - `ideas/page.tsx` is a server
// component, so a delete's revalidatePath() re-fetches the whole list and
// React reconciles a shorter array, dropping the card's DOM node with no
// exit animation and no reflow on the cards below it. This client wrapper
// is the thin seam that makes an exit animation possible without turning
// the page itself into a client component or duplicating its data
// fetching: the server keeps owning `ideas`, this just animates the array
// it's handed.
//
// Deliberately NOT giving cards an `initial`/entrance animation - only
// `exit` and `layout` (for the remaining cards sliding smoothly into the
// gap). Both of those are measurement-driven (FLIP), not the scheduled
// mount-time initial->animate transition that gets stuck under Framer
// Motion + Turbopack (see InsightList.tsx, PageTransition.tsx) - so this
// sidesteps that whole bug class rather than needing its own workaround.
// A freshly-added idea just appears at full opacity immediately, same as
// today.
export default function IdeaList({ ideas }: { ideas: Idea[] }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {ideas.map((idea) => (
          <motion.div
            key={idea.id}
            layout={!reducedMotion}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: motionTokens.base, ease: easing.premiumOut }}
          >
            <IdeaCard idea={idea} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
