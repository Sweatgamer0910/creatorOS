"use client";

import { AnimatePresence, motion } from "framer-motion";
import { motion as motionTokens, easing } from "@/lib/design-tokens";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import ScriptListItem, { type Script } from "./ScriptListItem";

// Same seam as IdeaList.tsx (see its comment for the full reasoning):
// scripts/page.tsx is a server component, delete goes through
// revalidatePath, and without this wrapper a deleted script's card just
// vanished with no exit animation or reflow. Only `exit` + `layout` here,
// deliberately no mount-time `initial` animation - that's the half of
// Framer Motion that gets stuck under Turbopack, not this half.
export default function ScriptList({ scripts }: { scripts: Script[] }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {scripts.map((script) => (
          <motion.div
            key={script.id}
            layout={!reducedMotion}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: motionTokens.base, ease: easing.premiumOut }}
          >
            <ScriptListItem script={script} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
