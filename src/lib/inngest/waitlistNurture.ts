// Pre-signup lead nurture sequence — triggered when someone submits the
// landing page's secondary "Get updates" form (ClosingCTA.tsx ->
// joinWaitlist -> "app/waitlist.joined" event), NOT when someone signs up
// for a real account (that's activationSequence.ts, a separate function).
//
// Cadence matches Ayaan's brief (2026-07-31): immediate welcome, then
// feature-spotlight emails roughly every 5 days. Every step re-checks
// whether this email has since become a real signed-up user — if so, the
// sequence stops there, since they're now getting the activation sequence
// instead and don't need both landing in their inbox.
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { sendMarketingEmail } from "@/lib/marketing-email";
import {
  waitlistWelcomeEmail,
  spotlightHealthScoreEmail,
  spotlightGrowthCoachEmail,
  waitlistFinalCtaEmail,
} from "@/lib/waitlist-emails";

async function hasSignedUp(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user !== null;
}

export const waitlistNurtureSequence = inngest.createFunction(
  {
    id: "waitlist-nurture-sequence",
    name: "Waitlist lead nurture email sequence",
    triggers: [{ event: "app/waitlist.joined" }],
  },
  async ({ event, step }) => {
    const { email } = event.data as { email: string };

    await step.run("send-welcome", async () => {
      const { subject, html } = waitlistWelcomeEmail();
      await sendMarketingEmail({ to: email, subject, html });
    });

    await step.sleep("wait-5-days", "5d");
    const convertedAtDay5 = await step.run("check-converted-day-5", () =>
      hasSignedUp(email),
    );
    if (!convertedAtDay5) {
      await step.run("send-spotlight-health-score", async () => {
        const { subject, html } = spotlightHealthScoreEmail();
        await sendMarketingEmail({ to: email, subject, html });
      });
    }

    await step.sleep("wait-10-days", "5d");
    const convertedAtDay10 = await step.run("check-converted-day-10", () =>
      hasSignedUp(email),
    );
    if (!convertedAtDay10) {
      await step.run("send-spotlight-growth-coach", async () => {
        const { subject, html } = spotlightGrowthCoachEmail();
        await sendMarketingEmail({ to: email, subject, html });
      });
    }

    await step.sleep("wait-15-days", "5d");
    const convertedAtDay15 = await step.run("check-converted-day-15", () =>
      hasSignedUp(email),
    );
    if (!convertedAtDay15) {
      await step.run("send-final-cta", async () => {
        const { subject, html } = waitlistFinalCtaEmail();
        await sendMarketingEmail({ to: email, subject, html });
      });
    }
  },
);
