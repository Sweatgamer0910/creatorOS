// Email content for Phase A1 of docs/CreatorOS_Marketing_Email_Plan.docx —
// the behavior-triggered activation sequence. Each function returns
// {subject, html} for one email in the sequence; the actual send + timing
// logic lives in src/lib/inngest/activationSequence.ts.
//
// Shared visual shell matches the existing transactional templates in
// src/lib/auth.ts (dark heading, amber #f5a623 CTA button, muted gray body
// text) so marketing mail doesn't look like a different product. Kept
// intentionally short per email (research: trial/activation emails under
// ~150 words outperform longer ones) with exactly one CTA each.
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

export function welcomeEmail(name: string) {
  const firstName = name.trim().split(" ")[0] || "there";
  return {
    subject: "Welcome to CreatorOS — here's your first move",
    html: shell(`
      <h2 style="color: #0e1116;">Welcome, ${firstName}</h2>
      <p style="color: #444;">
        You're in. The single fastest way to see CreatorOS actually work is
        to connect your YouTube channel — that's what unlocks your real
        Health Score, Growth Coach insights, and analytics instead of an
        empty dashboard.
      </p>
      ${ctaButton(`${appUrl()}/dashboard`, "Connect YouTube")}
      ${signOff()}
    `),
  };
}

export function day1NudgeEmail(name: string) {
  const firstName = name.trim().split(" ")[0] || "there";
  return {
    subject: "Quick one — stuck on connecting your channel?",
    html: shell(`
      <h2 style="color: #0e1116;">Hey ${firstName}</h2>
      <p style="color: #444;">
        Noticed you haven't connected a YouTube channel yet. Totally fine if
        you're just looking around — but if something's in the way, reply to
        this email and I'll help directly.
      </p>
      ${ctaButton(`${appUrl()}/dashboard`, "Connect YouTube")}
      ${signOff()}
    `),
  };
}

export function day3NudgeEmail(name: string) {
  const firstName = name.trim().split(" ")[0] || "there";
  return {
    subject: "Your Health Score is live — want a script to go with it?",
    html: shell(`
      <h2 style="color: #0e1116;">Nice, ${firstName} — you're connected</h2>
      <p style="color: #444;">
        Your channel's Health Score and Growth Coach insights are live now.
        Next step most creators take: turn one of those insights into an
        actual idea in the Idea Lab, then a script.
      </p>
      ${ctaButton(`${appUrl()}/ideas`, "Start an idea")}
      ${signOff()}
    `),
  };
}

export function day7DigestEmail(name: string) {
  const firstName = name.trim().split(" ")[0] || "there";
  return {
    subject: "What creators using CreatorOS do in week one",
    html: shell(`
      <h2 style="color: #0e1116;">One week in, ${firstName}</h2>
      <p style="color: #444;">
        Beyond the Health Score, two features are worth a look if you
        haven't yet: Growth Coach (rule-based insights on what's actually
        moving your channel) and the content Pipeline (a Kanban board for
        turning ideas into published videos).
      </p>
      ${ctaButton(`${appUrl()}/coach`, "See Growth Coach")}
      ${signOff()}
    `),
  };
}

export function day14UpsellEmail(name: string) {
  const firstName = name.trim().split(" ")[0] || "there";
  return {
    subject: "You're getting real value — here's what's next",
    html: shell(`
      <h2 style="color: #0e1116;">${firstName}, you're an active user</h2>
      <p style="color: #444;">
        You've been using CreatorOS for two weeks now. We're working on a
        paid tier with deeper analytics and more — if that's something
        you'd want early access to, just reply and let me know. No pitch
        yet, genuinely just gauging interest.
      </p>
      ${signOff()}
    `),
  };
}
