"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CoachInsight } from "@/lib/growth-coach";
import InsightCard from "./InsightCard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useNewInsightIds } from "@/hooks/useNewInsightIds";
import { motion as motionTokens } from "@/lib/design-tokens";

export default function InsightList({
  insights,
  emphasized = false,
}: {
  insights: CoachInsight[];
  emphasized?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  // Memoized so this only gets a new array reference when `insights`
  // itself changes — `insights.map(...)` inline at the call site would
  // allocate a fresh array every render, and since useNewInsightIds writes
  // to localStorage (a state-changing side effect) in the same effect that
  // depends on this array, an unstable reference caused an infinite
  // render loop (caught by live QA, not by the earlier unit tests, since
  // this is a rendering-cycle bug, not a logic bug).
  const insightIds = useMemo(() => insights.map((i) => i.id), [insights]);
  const newIds = useNewInsightIds(insightIds);

  // A per-card stagger (each InsightCard fading in with its own offset) was
  // the original design, but a Framer Motion + Next.js 16/Turbopack/React
  // 19 interaction bug makes any freshly-*mounted* motion element (however
  // it's mounted — a plain initial/animate pair, an AnimatePresence-wrapped
  // list, gated behind a client-only flag or not) render pre-settled at its
  // final state instead of animating from `initial` — confirmed with an
  // isolated control element with no relation to this component, so it's
  // not a bug in this file's logic. The one mechanism proven to actually
  // animate in this app is a `key` change on an already-mounted
  // AnimatePresence (see PageTransition.tsx, verified with real measured
  // values) — so this reveals the whole list as one unit via that same
  // mechanism, rather than per-card.
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRevealed(true);
  }, []);

  if (reducedMotion) {
    return (
      <div className="flex flex-col gap-4">
        {insights.map((insight, i) => (
          <InsightCard
            key={i}
            insight={insight}
            emphasized={emphasized}
            isNew={newIds.has(insight.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!revealed ? (
        // Placeholder for the single render before `revealed` flips true —
        // renders identical content, so its own exit must be instant (no
        // fade) or the identical-looking copy underneath would visibly
        // blink out before the real reveal fades in.
        <motion.div
          key="loading"
          className="flex flex-col gap-4"
          exit={{ opacity: 1 }}
          transition={{ duration: 0 }}
        >
          {insights.map((insight, i) => (
            <InsightCard
              key={i}
              insight={insight}
              emphasized={emphasized}
              isNew={newIds.has(insight.id)}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="revealed"
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.base }}
        >
          {insights.map((insight, i) => (
            <InsightCard
              key={i}
              insight={insight}
              emphasized={emphasized}
              isNew={newIds.has(insight.id)}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
