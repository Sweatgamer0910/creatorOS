"use client";

import { createContext, useContext } from "react";

interface OnboardingTourContextValue {
  /** Restarts the tour from step 0, ignoring onboardingCompletedAt — used
   *  by the "replay" help icon in NotchNav. No-op outside the provider. */
  start: () => void;
}

export const OnboardingTourContext = createContext<OnboardingTourContextValue>({
  start: () => {},
});

export function useOnboardingTour() {
  return useContext(OnboardingTourContext);
}
