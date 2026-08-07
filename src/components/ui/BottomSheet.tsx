"use client";

import { motion, type PanInfo } from "framer-motion";
import { radius, glass } from "@/lib/design-tokens";

// Mobile counterpart to the desktop side-panel/full-screen overlay pattern
// (VersionHistoryPanel.tsx, Teleprompter.tsx) - a swipe-down-to-dismiss
// sheet docked to the bottom of the screen, the native iOS idiom for
// "temporary focused surface over the app" instead of a Mac-style side
// panel or takeover. Shared here so every mobile overlay gets the same
// drag physics, glass material, and safe-area handling rather than each
// call site reimplementing its own.
//
// The sheet's own entrance/exit only ever animates `y` (the slide), never
// opacity - the same Framer Motion + Turbopack "freshly-mounted element
// can get stuck at `initial` instead of reaching `animate`" race documented
// in PageTransition.tsx, VersionHistoryPanel.tsx, and NotchNav.tsx. A stuck
// sheet transition should only ever cost the slide-up animation, never
// leave real content (whatever's inside the sheet) invisible. The backdrop
// is allowed to animate opacity since a stuck backdrop only costs a dim
// effect, not content visibility.
//
// No `open` prop / internal gating here on purpose - matches how
// Teleprompter/VersionHistoryPanel are already used in ScriptEditor.tsx
// (`<AnimatePresence>{showX && <X onClose={...} />}</AnimatePresence>`).
// exit animations only fire when AnimatePresence actually sees the element
// removed from its children; a component that stays mounted and internally
// returns null on `open === false` would never trigger them. So the caller
// owns the boolean and conditionally renders this component inside its own
// <AnimatePresence>, exactly like the two existing overlays.
export default function BottomSheet({
  onClose,
  title,
  children,
  maxHeight = "80vh",
}: {
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string | number;
}) {
  function handleDragEnd(
    _e: PointerEvent | MouseEvent | TouchEvent,
    info: PanInfo,
  ) {
    // Dismiss on a decisive downward flick (velocity) OR a drag past
    // roughly a third of a typical sheet's travel (offset) - two
    // independent thresholds so a fast short flick and a slow deliberate
    // drag both register as "let go of this," matching iOS sheet feel
    // rather than requiring one specific gesture shape.
    if (info.velocity.y > 500 || info.offset.y > 120) {
      onClose();
    }
  }

  return (
    <motion.div
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(3,3,4,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={handleDragEnd}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 38,
        }}
        style={{
          width: "100%",
          maxHeight,
          display: "flex",
          flexDirection: "column",
          backgroundColor: glass.surface,
          backdropFilter: glass.backdrop,
          WebkitBackdropFilter: glass.backdrop,
          borderTop: `1px solid ${glass.borderTop}`,
          borderTopLeftRadius: radius["2xl"],
          borderTopRightRadius: radius["2xl"],
          boxShadow: glass.shadow,
          // Real device home-indicator clearance - without this the sheet's
          // own bottom padding sits flush with the edge of the screen and
          // the drag handle/content crowd right up against the indicator.
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          touchAction: "none",
        }}
      >
        {/* Drag handle - the standard iOS affordance signaling "this
            surface is draggable," independent of the title/content below
            so it reads as a grab target even before anything else loads. */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 10,
            paddingBottom: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 5,
              borderRadius: radius.full,
              backgroundColor: "rgba(255,255,255,0.24)",
            }}
          />
        </div>

        {title && (
          <div
            style={{
              padding: "4px 20px 12px",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 17,
              flexShrink: 0,
            }}
          >
            {title}
          </div>
        )}

        <div
          style={{
            overflowY: "auto",
            padding: "0 20px 20px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
