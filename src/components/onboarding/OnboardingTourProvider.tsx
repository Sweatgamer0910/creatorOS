"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import posthog from "@/lib/posthog";
import { completeOnboarding } from "@/lib/onboarding/actions";
import { TOUR_STEPS } from "@/lib/onboarding/steps";
import {
  computeAnchorPosition,
  computeCenteredPosition,
  type Rect,
  type Size,
} from "@/lib/onboarding/positioning";
import {
  pollForElement,
  rectFromElement,
  waitForStableRect,
} from "@/lib/onboarding/dom";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { OnboardingTourContext } from "@/lib/onboarding/context";
import Spotlight from "./Spotlight";
import TourWidget from "./TourWidget";

// Same pathname list NotchNav already excludes itself from — no tour on
// the marketing page or any unauthenticated auth-flow page.
const EXCLUDED_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

const DEFAULT_WIDGET_SIZE: Size = { width: 300, height: 160 };

type TargetState =
  | { kind: "idle" }
  | { kind: "center" }
  | { kind: "rect"; rect: Rect; usingFallback: boolean };

export default function OnboardingTourProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const reducedMotion = usePrefersReducedMotion();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetState, setTargetState] = useState<TargetState>({
    kind: "idle",
  });
  const [widgetSize, setWidgetSize] = useState<Size>(DEFAULT_WIDGET_SIZE);

  const autoStartAttempted = useRef(false);
  const targetStateRef = useRef<TargetState>(targetState);
  useEffect(() => {
    targetStateRef.current = targetState;
  }, [targetState]);
  // Read by the step-navigation effect below without being a dependency
  // of it — that effect must fire exactly once per step advance, not
  // every time pathname changes (see comment there).
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const excluded = EXCLUDED_PATHS.includes(pathname);

  useEffect(() => {
    if (!session?.user?.id) return;

    posthog.identify(session.user.id, {
      email: session.user.email,
      name: session.user.name,
    });
  }, [session?.user?.id, session?.user?.email, session?.user?.name]);

  const start = useCallback(() => {
    setStepIndex(0);
    setTargetState({ kind: "idle" });
    setWidgetSize(DEFAULT_WIDGET_SIZE);
    setActive(true);
  }, []);

  const end = useCallback(() => {
    setActive(false);
    completeOnboarding().catch((e) => {
      console.error("[OnboardingTour] Failed to persist completion:", e);
    });
  }, []);

  // Auto-launch once, the first time a session that hasn't completed the
  // tour lands on /dashboard (post-login, per the redirect shipped
  // earlier this pass).
  useEffect(() => {
    if (autoStartAttempted.current) return;
    if (isPending || !session?.user) return;
    if (pathname !== "/dashboard") return;
    autoStartAttempted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!session.user.onboardingCompletedAt) start();
  }, [session, isPending, pathname, start]);

  // Fires exactly once per step advance (deliberately NOT keyed on
  // pathname — see pathnameRef above) — navigates to that step's route if
  // needed. Keeping this separate from target resolution means the user
  // freely clicking around the real app mid-tour (the whole point of the
  // fix below) never gets yanked back to the step's "expected" page; only
  // an actual Next/Back/start() advance triggers a navigation.
  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[stepIndex];
    if (step.route && step.route !== pathnameRef.current) {
      router.push(step.route);
    }
  }, [active, stepIndex, router]);

  // Resolves the current step's target on whatever page is actually open
  // right now. If that isn't the step's expected route yet (still
  // navigating — or the user's off exploring elsewhere), it just hides
  // the widget and waits rather than resolving a stale/wrong target —
  // this is what stops the tour's copy from "arriving" before the real
  // page does.
  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[stepIndex];

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargetState({ kind: "idle" });

    if (step.route && step.route !== pathname) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    async function settleOn(el: HTMLElement, usingFallback: boolean) {
      el.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
      // Polls until the rect stops moving rather than guessing a fixed
      // delay — also correctly covers PageTransition's own slide-in
      // offset settling, since a transform changes the measured rect too.
      const rect = await waitForStableRect(el);
      if (cancelled) return;
      setTargetState({ kind: "rect", rect, usingFallback });

      // The target can resize independent of the window too — e.g.
      // NotchNav's own hover-expand spring — which a window resize/scroll
      // listener alone wouldn't catch. Since the app stays fully
      // interactive during the tour, that's a real case (hovering the nav
      // mid-tour), not a hypothetical.
      resizeObserver = new ResizeObserver(() => {
        if (cancelled) return;
        setTargetState({
          kind: "rect",
          rect: rectFromElement(el),
          usingFallback,
        });
      });
      resizeObserver.observe(el);
    }

    async function resolve() {
      if (step.target === null) {
        if (!cancelled) setTargetState({ kind: "center" });
        return;
      }

      const el = await pollForElement(step.target);
      if (cancelled) return;
      if (el) {
        await settleOn(el, false);
        return;
      }

      if (step.fallbackTarget) {
        const fallbackEl = await pollForElement(step.fallbackTarget);
        if (cancelled) return;
        if (fallbackEl) {
          await settleOn(fallbackEl, true);
          return;
        }
      }

      // Neither the real target nor its fallback ever showed up — never
      // soft-lock the tour on a missing element, just move on.
      if (!cancelled) {
        setStepIndex((i) => Math.min(i + 1, TOUR_STEPS.length - 1));
      }
    }

    resolve();
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
    };
  }, [active, stepIndex, pathname, reducedMotion]);

  // Keeps the spotlight glued to its target through reflow/font-load/
  // resize while a step is showing. Reads targetStateRef (not the
  // targetState closed over at effect-creation time) so it always knows
  // the current real/fallback selector without needing to resubscribe
  // every time the target resolves.
  useEffect(() => {
    if (!active) return;
    function reMeasure() {
      const current = targetStateRef.current;
      if (current.kind !== "rect") return;
      const step = TOUR_STEPS[stepIndex];
      const selector = current.usingFallback
        ? step.fallbackTarget
        : step.target;
      if (!selector) return;
      const el = document.querySelector<HTMLElement>(selector);
      if (el)
        setTargetState({
          kind: "rect",
          rect: rectFromElement(el),
          usingFallback: current.usingFallback,
        });
    }
    window.addEventListener("resize", reMeasure);
    window.addEventListener("scroll", reMeasure, true);
    return () => {
      window.removeEventListener("resize", reMeasure);
      window.removeEventListener("scroll", reMeasure, true);
    };
  }, [active, stepIndex]);

  // Escape = skip, same idiom as Teleprompter.tsx's keydown handler.
  useEffect(() => {
    if (!active) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") end();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active, end]);

  function handleNext() {
    if (stepIndex === TOUR_STEPS.length - 1) {
      end();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  const step = TOUR_STEPS[stepIndex];
  const showOverlay = active && !excluded && targetState.kind !== "idle";

  let anchor = { x: 0, y: 0 };
  if (showOverlay && typeof window !== "undefined") {
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    if (targetState.kind === "center") {
      anchor = computeCenteredPosition(viewport, widgetSize);
    } else if (targetState.kind === "rect" && step.placement !== "center") {
      anchor = computeAnchorPosition(
        targetState.rect,
        step.placement,
        viewport,
        widgetSize,
      );
    }
  }

  return (
    <OnboardingTourContext.Provider value={{ start }}>
      {children}
      {showOverlay && (
        <>
          {targetState.kind === "rect" && <Spotlight rect={targetState.rect} />}
          <TourWidget
            x={anchor.x}
            y={anchor.y}
            title={step.title}
            body={
              targetState.kind === "rect" &&
              targetState.usingFallback &&
              step.fallbackBody
                ? step.fallbackBody
                : step.body
            }
            stepIndex={stepIndex}
            stepCount={TOUR_STEPS.length}
            isFirst={stepIndex === 0}
            isLast={stepIndex === TOUR_STEPS.length - 1}
            onBack={handleBack}
            onNext={handleNext}
            onSkip={end}
            onMeasure={setWidgetSize}
            reducedMotion={reducedMotion}
          />
        </>
      )}
    </OnboardingTourContext.Provider>
  );
}
