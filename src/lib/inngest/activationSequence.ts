// Phase A1 of docs/CreatorOS_Marketing_Email_Plan.docx — a behavior-
// triggered lifecycle sequence, not a blind time-based one. Research behind
// the plan found behavior-triggered sequences convert ~4x better, so every
// step here re-checks real app state (has a channel been connected? an
// idea/script started?) before deciding what, if anything, to send —
// nothing here fires on a timer alone.
//
// Triggered by an "app/user.signed_up" event sent from auth.ts's
// databaseHooks.user.create.after. Uses step.sleep for the day1/3/7/14
// waits so a single function run represents the whole 14-day sequence
// (Inngest persists state between steps, so this survives redeploys/
// restarts without losing its place).
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { sendMarketingEmail } from "@/lib/marketing-email";
import { updateAudienceContact } from "@/lib/resend-audience";
import {
  welcomeEmail,
  day1NudgeEmail,
  day3NudgeEmail,
  day7DigestEmail,
  day14UpsellEmail,
} from "@/lib/lifecycle-emails";

// Re-fetches the workspace's current activation state — called at every
// step rather than once, since the whole point of a behavior-triggered
// sequence is reacting to what's true *now*, not what was true at signup.
async function getWorkspaceState(userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { ownerId: userId },
    include: {
      channels: { select: { id: true }, take: 1 },
      ideas: { select: { id: true }, take: 1 },
      scripts: { select: { id: true }, take: 1 },
      contentItems: { select: { id: true }, take: 1 },
    },
  });

  if (!workspace) return null;

  const channelConnected = workspace.channels.length > 0;
  const hasIdeaOrScript =
    workspace.ideas.length > 0 || workspace.scripts.length > 0;
  // "Meaningfully active" (Phase A1's day-14 gate) — how many distinct
  // features they've touched, not just one metric. Threshold of 2+ matches
  // the plan doc's "2+ features used" wording.
  const featuresUsed = [
    channelConnected,
    workspace.ideas.length > 0,
    workspace.scripts.length > 0,
    workspace.contentItems.length > 0,
  ].filter(Boolean).length;

  return { channelConnected, hasIdeaOrScript, isActive: featuresUsed >= 2 };
}

export const activationSequence = inngest.createFunction(
  {
    id: "activation-sequence",
    name: "Lifecycle activation email sequence",
    triggers: [{ event: "app/user.signed_up" }],
  },
  async ({ event, step }) => {
    const { userId, email, name } = event.data as {
      userId: string;
      email: string;
      name: string;
    };

    // Immediately: welcome email, always sent.
    await step.run("send-welcome", async () => {
      const { subject, html } = welcomeEmail(name);
      await sendMarketingEmail({ to: email, subject, html });
    });

    // Day 1: only if they still haven't connected a channel — the single
    // biggest activation blocker per the plan.
    await step.sleep("wait-day-1", "1d");
    await step.run("check-day-1", async () => {
      const state = await getWorkspaceState(userId);
      if (state && !state.channelConnected) {
        const { subject, html } = day1NudgeEmail(name);
        await sendMarketingEmail({ to: email, subject, html });
      }
    });

    // Day 3 (2 more days elapsed): only if connected but no idea/script yet.
    await step.sleep("wait-day-3", "2d");
    await step.run("check-day-3", async () => {
      const state = await getWorkspaceState(userId);
      if (state?.channelConnected && !state.hasIdeaOrScript) {
        const { subject, html } = day3NudgeEmail(name);
        await sendMarketingEmail({ to: email, subject, html });
      }
      // First point in the sequence where "channel connected" might have
      // flipped to true since signup — sync it back to Resend so Phase A2
      // segmentation (which reads this property, not a live DB query)
      // reflects reality.
      if (state) {
        await updateAudienceContact(email, {
          channelConnected: String(state.channelConnected),
        });
      }
    });

    // Day 7 (4 more days elapsed): always sent, feature-spotlight framing.
    await step.sleep("wait-day-7", "4d");
    await step.run("send-day-7", async () => {
      const { subject, html } = day7DigestEmail(name);
      await sendMarketingEmail({ to: email, subject, html });
    });

    // Day 14 (7 more days elapsed): only if meaningfully active — pitching
    // an inactive user wastes the send per the plan's Phase A2 reasoning.
    await step.sleep("wait-day-14", "7d");
    await step.run("check-day-14", async () => {
      const state = await getWorkspaceState(userId);
      if (state?.isActive) {
        const { subject, html } = day14UpsellEmail(name);
        await sendMarketingEmail({ to: email, subject, html });
      }
    });
  },
);
