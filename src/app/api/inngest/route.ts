import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { activationSequence } from "@/lib/inngest/activationSequence";
import { waitlistNurtureSequence } from "@/lib/inngest/waitlistNurture";
import { channelCheckNurtureSequence } from "@/lib/inngest/channelCheckNurture";

// Registers every Inngest function with the Inngest platform. This route
// didn't exist before this pass — the "inngest" package/client
// (src/lib/inngest.ts) has been an installed, configured dependency since
// 2026-07-28 with nothing actually using it. activationSequence (Phase A1
// of the marketing email plan) was the first real function;
// waitlistNurtureSequence (pre-signup lead nurture, added 2026-07-31) the
// second; channelCheckNurtureSequence (free Health Check follow-up,
// also 2026-07-31) the third.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [activationSequence, waitlistNurtureSequence, channelCheckNurtureSequence],
});
