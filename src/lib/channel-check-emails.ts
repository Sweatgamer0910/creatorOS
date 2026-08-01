// Email content for the free Channel Health checker's follow-up sequence
// (src/lib/inngest/channelCheckNurture.ts) — for visitors who used
// /channel-health, saw their free preview, and opted in to "email me
// tips" without signing up. Distinct from both lifecycle-emails.ts (post-
// signup) and waitlist-emails.ts (landing page "get updates" form): this
// one references the visitor's actual channel and score, since they gave
// us something concrete to talk about.
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

export function checkFollowupScoreRecapEmail(channelTitle: string, score: number) {
  return {
    subject: `${channelTitle}'s Preview Score was ${score} — here's what that actually means`,
    html: shell(`
      <h2 style="color: #0e1116;">Quick recap on ${channelTitle}</h2>
      <p style="color: #444;">
        A couple of days ago you checked ${channelTitle}'s free Health
        Check and got a Preview Score of ${score}. That score was built
        from public data only — upload cadence and recent performance vs.
        the channel's own average.
      </p>
      <p style="color: #444;">
        The real Health Score goes further: private watch-time, traffic
        sources, and day-by-day growth data that isn't visible publicly —
        the stuff that actually explains *why* a score looks the way it
        does, not just that it does.
      </p>
      ${ctaButton(`${appUrl()}/signup`, "See the full picture")}
      ${signOff()}
    `),
  };
}

export function checkFollowupPublicVsPrivateEmail(channelTitle: string) {
  return {
    subject: "What the free checker can't see about your channel",
    html: shell(`
      <h2 style="color: #0e1116;">The honest limits of a public check</h2>
      <p style="color: #444;">
        The free checker looked at ${channelTitle} using YouTube's public
        data only — the same data anyone could see by visiting the
        channel. No watch time, no traffic sources, no audience retention.
      </p>
      <p style="color: #444;">
        Connect the channel for real and CreatorOS's actual Health Score
        uses your private YouTube Analytics — the numbers that show
        whether growth is real and where it's actually coming from. Same
        honest fact/pattern/confidence labeling, just built on real data
        instead of a public approximation.
      </p>
      ${ctaButton(`${appUrl()}/signup`, "Connect your channel free")}
      ${signOff()}
    `),
  };
}

export function checkFollowupFeatureSpotlightEmail() {
  return {
    subject: "From a score to an actual plan",
    html: shell(`
      <h2 style="color: #0e1116;">A score is a starting point, not a plan</h2>
      <p style="color: #444;">
        Once a channel's connected, Growth Coach turns your real analytics
        into specific, rule-based suggestions — and the content Pipeline
        turns any of those into an actual idea, then a script, then a
        published video, tracked end to end.
      </p>
      <p style="color: #444;">
        It's the difference between knowing a number and knowing what to
        do about it.
      </p>
      ${ctaButton(`${appUrl()}/signup`, "Try it free")}
      ${signOff()}
    `),
  };
}

export function checkFollowupFinalCtaEmail(channelTitle: string) {
  return {
    subject: `Still curious about ${channelTitle}'s real numbers?`,
    html: shell(`
      <h2 style="color: #0e1116;">No pressure — just an open door</h2>
      <p style="color: #444;">
        This is the last note in this sequence. If you're curious what
        ${channelTitle} actually looks like with real analytics behind it,
        signing up is free and takes about two minutes.
      </p>
      ${ctaButton(`${appUrl()}/signup`, "Sign up free")}
      ${signOff()}
    `),
  };
}
