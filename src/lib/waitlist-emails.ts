// Email content for the pre-signup lead nurture sequence — for people who
// filled out the landing page's secondary "Get updates" form (see
// ClosingCTA.tsx) instead of signing up directly. Distinct from
// lifecycle-emails.ts, which is Phase A1's *post-signup* activation
// sequence for people who already have an account.
//
// Per Ayaan's brief: every ~5 days, feature spotlights + updates, always
// ending in a CTA back to /signup. No fabricated user testimonials — real
// success stories can be swapped in here once they exist (see the comment
// on spotlightGrowthCoachEmail below), but nothing invented in the
// meantime.
function shell(bodyHtml: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      ${bodyHtml}
    </div>
  `;
}

function ctaButton(url: string, label: string): string {
  return `
    <p>
      <a href="${url}" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background: #f5a623; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600;">
        ${label}
      </a>
    </p>
  `;
}

function signOff(): string {
  return `
    <p style="color: #444; margin-top: 24px;">
      — Ayaan
    </p>
  `;
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://creatoros.onl";
}

export function waitlistWelcomeEmail() {
  return {
    subject: "You're on the list — here's what CreatorOS actually does",
    html: shell(`
      <h2 style="color: #0e1116;">You're on the list</h2>
      <p style="color: #444;">
        CreatorOS is an operating system for YouTube creators — one place
        for your channel's real Health Score, Growth Coach insights, idea
        and script drafting, and a Kanban pipeline for turning ideas into
        published videos.
      </p>
      <p style="color: #444;">
        The app is actually live already, so you don't have to wait —
        it's free to start and takes about two minutes to connect a
        channel.
      </p>
      ${ctaButton(`${appUrl()}/signup`, "Sign up free")}
      ${signOff()}
    `),
  };
}

export function spotlightHealthScoreEmail() {
  return {
    subject: "Most analytics tools guess. This one tells you when it's guessing.",
    html: shell(`
      <h2 style="color: #0e1116;">The Health Score, explained</h2>
      <p style="color: #444;">
        Every insight CreatorOS gives you is labeled as a fact, a pattern,
        a recommendation, or a hypothesis — and tagged with how confident
        it actually is (high, medium, or exploratory). No tool pretending
        a guess is a certainty.
      </p>
      <p style="color: #444;">
        It's the core idea behind the Health Score and Growth Coach: you
        get a real, honest read on your channel, not a black-box number.
      </p>
      ${ctaButton(`${appUrl()}/signup`, "See your Health Score")}
      ${signOff()}
    `),
  };
}

// Placeholder for a real user success story once one exists — per Ayaan's
// brief (2026-07-31: "X user used this feature that helped them..."), do
// NOT fabricate a quote or metric here. Swap the second paragraph for a
// genuine one when there's a real creator willing to be named/quoted.
export function spotlightGrowthCoachEmail() {
  return {
    subject: "From idea to published video, without the spreadsheet",
    html: shell(`
      <h2 style="color: #0e1116;">Growth Coach + Pipeline</h2>
      <p style="color: #444;">
        Growth Coach turns your Health Score data into specific,
        rule-based suggestions — what's actually moving your channel, not
        generic advice. Turn any insight straight into an idea, then a
        script, then track it through to published on the content
        Pipeline's Kanban board.
      </p>
      <p style="color: #444;">
        It's the same workflow real creators are using on CreatorOS right
        now to go from "I should post more" to an actual plan.
      </p>
      ${ctaButton(`${appUrl()}/signup`, "Try it free")}
      ${signOff()}
    `),
  };
}

export function waitlistFinalCtaEmail() {
  return {
    subject: "Still on the fence? Here's the two-minute version",
    html: shell(`
      <h2 style="color: #0e1116;">No pressure — just an open door</h2>
      <p style="color: #444;">
        You've heard what CreatorOS does. Signing up is free, takes about
        two minutes, and you can disconnect anytime — nothing to lose by
        trying it on your actual channel.
      </p>
      ${ctaButton(`${appUrl()}/signup`, "Sign up free")}
      ${signOff()}
    `),
  };
}
