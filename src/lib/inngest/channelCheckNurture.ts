// Follow-up sequence for the free Channel Health checker (src/app/
// channel-health) — triggered when a visitor opts in to "email me tips"
// after seeing their free preview (src/lib/channel-health-preview/
// leadCapture.ts -> "app/channel-health.captured"). Distinct from
// waitlistNurture.ts, which fires off the landing page's "get updates"
// form instead.
//
// Cadence per Ayaan's spec (2026-07-31): wait 48 hours, send the first
// email, then every 3 days after that — day 2, day 5, day 8, day 11, four
// emails total. Same "stop early if they've already converted" pattern as
// every other nurture sequence here.
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { sendMarketingEmail } from "@/lib/marketing-email";
import {
  checkFollowupScoreRecapEmail,
  checkFollowupPublicVsPrivateEmail,
  checkFollowupFeatureSpotlightEmail,
  checkFollowupFinalCtaEmail,
} from "@/lib/channel-check-emails";

async function hasSignedUp(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user !== null;
}

export const channelCheckNurtureSequence = inngest.createFunction(
  {
    id: "channel-check-nurture-sequence",
    name: "Channel Health checker follow-up email sequence",
    triggers: [{ event: "app/channel-health.captured" }],
  },
  async ({ event, step }) => {
    const { email, channelTitle, score } = event.data as {
      email: string;
      channelTitle: string;
      score: number;
    };

    await step.sleep("wait-48-hours", "48h");
    const convertedAtDay2 = await step.run("check-converted-day-2", () =>
      hasSignedUp(email),
    );
    if (!convertedAtDay2) {
      await step.run("send-score-recap", async () => {
        const { subject, html } = checkFollowupScoreRecapEmail(channelTitle, score);
        await sendMarketingEmail({ to: email, subject, html });
      });
    }

    await step.sleep("wait-day-5", "3d");
    const convertedAtDay5 = await step.run("check-converted-day-5", () =>
      hasSignedUp(email),
    );
    if (!convertedAtDay5) {
      await step.run("send-public-vs-private", async () => {
        const { subject, html } = checkFollowupPublicVsPrivateEmail(channelTitle);
        await sendMarketingEmail({ to: email, subject, html });
      });
    }

    await step.sleep("wait-day-8", "3d");
    const convertedAtDay8 = await step.run("check-converted-day-8", () =>
      hasSignedUp(email),
    );
    if (!convertedAtDay8) {
      await step.run("send-feature-spotlight", async () => {
        const { subject, html } = checkFollowupFeatureSpotlightEmail();
        await sendMarketingEmail({ to: email, subject, html });
      });
    }

    await step.sleep("wait-day-11", "3d");
    const convertedAtDay11 = await step.run("check-converted-day-11", () =>
      hasSignedUp(email),
    );
    if (!convertedAtDay11) {
      await step.run("send-final-cta", async () => {
        const { subject, html } = checkFollowupFinalCtaEmail(channelTitle);
        await sendMarketingEmail({ to: email, subject, html });
      });
    }
  },
);
