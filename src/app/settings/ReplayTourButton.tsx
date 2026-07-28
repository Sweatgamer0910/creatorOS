"use client";

import { useOnboardingTour } from "@/lib/onboarding/context";
import Button from "@/components/ui/button";

export default function ReplayTourButton() {
  const { start } = useOnboardingTour();
  return (
    <Button variant="secondary" size="sm" onClick={start}>
      Replay onboarding tour
    </Button>
  );
}
