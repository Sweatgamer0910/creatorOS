// Seed content for the build-in-public blog (src/app/blog). Adapted from
// docs/DEVELOPMENT_LOG.md and docs/DECISIONS_LOG.md — real engineering
// notes from building CreatorOS, rewritten for an outside audience rather
// than pasted verbatim (the logs assume repo/code context a reader here
// won't have). Newest first, same as the source logs.
export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  date: string; // ISO date
  excerpt: string;
  tags: string[];
  body: BlogBlock[];
}

export const posts: BlogPost[] = [
  {
    slug: "database-connection-pooling-detour",
    title: "A two-hour detour into database connection pooling",
    date: "2026-07-30",
    excerpt:
      "We switched to a pooled database connection to fix a real problem, broke a deploy doing it, chased the wrong fix, and then found out the real fix had worked all along.",
    tags: ["engineering", "infrastructure"],
    body: [
      {
        type: "p",
        text: "CreatorOS runs on Vercel's serverless functions talking to a Neon Postgres database. Every function invocation can open its own database connection, and under real concurrent load — a bunch of people hitting the app at once — that adds up fast. We'd seen a handful of intermittent 503s during a QA pass and suspected exactly this: connection exhaustion, not a code bug.",
      },
      {
        type: "p",
        text: "The fix is well-known: point the app at Neon's pooled connection endpoint instead of the direct one, so many function invocations share a small set of real database connections instead of each opening its own. We made the switch. The next deploy immediately broke.",
      },
      {
        type: "h3",
        text: "Chasing the wrong fix",
      },
      {
        type: "p",
        text: "The error was P1001, \"can't reach database server,\" against the pooled endpoint during migrations. This is a known interaction — pooled connections (via PgBouncer) don't always play well with running schema migrations, because migrations sometimes need session-level features a pooled connection doesn't give you. The standard fix is a separate `directUrl` — one URL for the app's normal queries (pooled), a different one just for migrations (direct, unpooled).",
      },
      {
        type: "p",
        text: "So that's what we tried. Except our Prisma version (7.8.0) had quietly removed support for `directUrl` living in the schema file at all — it now wants connection URLs configured in a separate `prisma.config.ts`, and even that config's types didn't expose a `directUrl`-equivalent option. We reverted the change and were back to a broken deploy with no obvious next step.",
      },
      {
        type: "h3",
        text: "The fix that had already worked",
      },
      {
        type: "p",
        text: "We added a `DIRECT_URL` environment variable anyway, more as a hedge than a real plan, and kicked off a manual redeploy. It went through clean — seven migrations applied, no error. Turns out the original failure almost certainly wasn't a fundamental \"pooled connections can't run migrations\" wall at all. Neon's databases spin down when idle and take a moment to wake up; the first deploy probably just hit that cold start. The retry worked because the database was already warm, not because of anything we'd changed.",
      },
      {
        type: "p",
        text: "We kept the pooled connection for the app itself (the actual fix for the actual problem) and left the unused `DIRECT_URL` env var in place, harmless, to delete later. Nothing about this was dramatic, but it's a good reminder that a plausible-sounding root cause and the real root cause aren't always the same thing — and that \"redeploy and see\" is sometimes a legitimate diagnostic step, not just an act of hope.",
      },
    ],
  },
  {
    slug: "the-score-that-used-to-lie-by-accident",
    title: "The score that used to lie by accident",
    date: "2026-07-29",
    excerpt:
      "Our Health Score once reported a confident 'Excellent' — and once, literally 'Infinity% growth' — off channels with almost no view history. Here's the bug, the fix, and the honesty system we built so it can't happen again.",
    tags: ["product", "engineering"],
    body: [
      {
        type: "p",
        text: "CreatorOS's Health Score is supposed to tell you, honestly, how your channel is trending. For a while, it didn't. On channels with very little view history — brand new channels, or an unusually quiet week — it would still confidently report \"Excellent\" or \"At Risk.\" In one case it displayed a growth rate of literal Infinity percent.",
      },
      {
        type: "p",
        text: "The bug was almost embarrassingly simple once we found it. The score is partly built from a week-over-week percentage growth calculation: this week's average views divided by last week's, minus one. If last week's average was zero — completely plausible for a new or dormant channel — that division either produces `NaN` (0 divided by 0) or `Infinity` (anything divided by 0). Either one can silently trip a scoring branch that was never designed to see a number like that.",
      },
      {
        type: "h3",
        text: "Why this mattered more than a normal bug",
      },
      {
        type: "p",
        text: "CreatorOS's whole pitch is that it won't pretend a guess is a fact. Every insight in the app — Health Score, Growth Coach, and now this blog's own topic pages — carries a label: Fact, Pattern, Recommendation, or Hypothesis, plus a confidence level of High, Medium, or Exploratory. A tool that says that about itself and then quietly shows \"Infinity% growth\" as a confident verdict isn't just buggy, it's undermining the one thing it's supposed to be trustworthy about.",
      },
      {
        type: "p",
        text: "The fix was a shared minimum-average-views floor, used by both the Health Score and Growth Coach, that gates the percentage calculation entirely. Below that floor, there simply isn't enough real view volume for a percentage to mean anything — so instead of a number pulled from noise, both features now report an honest \"Insufficient Data\" state. We added that as a first-class value on the Health Score's label field rather than shoehorning it into an existing category, because it's a genuinely different kind of statement: not \"your channel is struggling,\" but \"we don't have enough signal yet to tell you anything real.\"",
      },
      {
        type: "p",
        text: "It's a small fix in terms of lines of code. But it's the kind of bug that, left alone, quietly breaks trust one confident-looking wrong number at a time — which for a product built on \"honest AI\" as a core differentiator, is about as bad as bugs get.",
      },
    ],
  },
  {
    slug: "oauth-only-for-two-days",
    title: "We went OAuth-only for two days, then partly changed our minds",
    date: "2026-07-29",
    excerpt:
      "We ripped out email/password sign-in to move faster on Google and Discord OAuth. A day later we brought it back — not because OAuth was wrong, but because our reasons for going OAuth-only stopped applying.",
    tags: ["product", "decisions"],
    body: [
      {
        type: "p",
        text: "For a couple of days, the only way into CreatorOS was Google or Discord sign-in. We'd removed email/password entirely — no password field anywhere in the app. The reasoning at the time was real: without a purchased domain, we couldn't get a verified sending domain from our email provider, which meant password reset and verification emails either wouldn't send reliably or would be badly rate-limited. Rather than ship a half-working password flow, we cut it and leaned on OAuth, which doesn't need us to send email at all.",
      },
      {
        type: "p",
        text: "Then we bought creatoros.onl, which is a small, deliberate exception to a rule we're otherwise strict about (more on that in a separate post) — until there's a paying customer, we don't spend money on the product. But a real domain unblocks two things at once: a verified email-sending domain, and satisfying Google's OAuth verification requirement that the app link to a real homepage. Both blockers were domain-shaped, and once the domain existed, neither one applied anymore.",
      },
      {
        type: "h3",
        text: "Restoring the option, not replacing anything",
      },
      {
        type: "p",
        text: "So email/password came back — pulled from git history and merged with everything we'd built during the OAuth-only window (Discord sign-in, the Resend audience sync, the `plan` field), rather than reverting any of that work. Google and Discord still sit above the divider on the login and signup screens as the recommended path; email/password is now a third option below it, not a replacement for the other two.",
      },
      {
        type: "p",
        text: "The honest version of this story isn't \"we made a mistake and fixed it.\" Going OAuth-only was the right call given the constraint we had at the time (no verified sending domain). Bringing password auth back was also the right call once that constraint lifted. Product decisions made under a real, temporary limitation are allowed to change when the limitation goes away — the mistake would have been treating a workaround as a permanent architectural stance.",
      },
    ],
  },
  {
    slug: "zero-dollars-until-first-customer",
    title: "Why we haven't spent a dollar on CreatorOS yet",
    date: "2026-07-28",
    excerpt:
      "No domains, no paid API tiers, no upgraded plans — not until CreatorOS has its first paying customer. Here's what that rule has actually cost us in features, and why we're keeping it anyway.",
    tags: ["decisions", "business"],
    body: [
      {
        type: "p",
        text: "Early on we set a simple, non-negotiable rule for building CreatorOS: zero dollars get spent on the product — domains, paid API tiers, developer program fees, upgraded plans, anything with a real cost — until there's a first real sale. Once there's revenue, it gets reinvested. Until then, everything has to be built on free tiers or not built at all.",
      },
      {
        type: "p",
        text: "That rule has real, visible costs of its own. For a while it meant our transactional email had to go out from a shared, restricted sending address that could only reach our own inbox — meaning no real user could receive a password reset or a product update email. It meant Google's OAuth verification for the sensitive YouTube scopes we need was stuck, because Google requires a real homepage URL as part of verification, and we didn't have a domain to point at. It meant Sign in with Apple was off the table entirely, since Apple's developer program is a flat $99/year regardless of whether anyone's paying us yet.",
      },
      {
        type: "h3",
        text: "What the rule didn't block",
      },
      {
        type: "p",
        text: "Everything that costs nothing but time kept moving. We rebuilt authentication around Google and Discord OAuth (Discord's developer portal is free), added a `plan` field to the data model so a future paid tier has somewhere to land even though nothing reads it yet, and wired up audience syncing to our email provider's free tier so the infrastructure would be ready the moment sending was unblocked. None of that needed a credit card.",
      },
      {
        type: "p",
        text: "We did eventually make one exception: buying the creatoros.onl domain, a small, deliberate spend that unblocked both the email-sending restriction and the OAuth verification requirement at once. That wasn't the zero-spend rule quietly eroding — it was a conscious, one-off call, made explicitly as an exception rather than a policy change. The rule itself still stands for everything else.",
      },
      {
        type: "p",
        text: "The honest reason for a rule like this isn't discipline for its own sake. It's that spending money on a product with no revenue is a bet, and we'd rather every early bet be made in engineering time — which is recoverable if we're wrong — than in cash, which isn't.",
      },
    ],
  },
  {
    slug: "building-the-onboarding-tour",
    title: "Building the onboarding tour, and the trap we almost fell into",
    date: "2026-07-27",
    excerpt:
      "Our first-run walkthrough almost skipped straight past any step it couldn't point at yet. Here's why we decided a tour that can't reach a feature should say so, not pretend the feature doesn't exist.",
    tags: ["product", "engineering"],
    body: [
      {
        type: "p",
        text: "New users landing in CreatorOS for the first time see an empty dashboard and, right alongside it, a short guided tour — narrated by Nova, our onboarding mascot — that walks through navigation, the dashboard, and the core pages in under a minute. It's skippable at any point, and each step is data-driven: a route, a target element to spotlight, and the copy to show next to it.",
      },
      {
        type: "p",
        text: "The tricky part was Analytics and Growth Coach. Both pages are gated behind connecting a YouTube channel — a brand-new user hasn't done that yet, so the real UI the tour would normally point at (a chart, an insight card) simply doesn't exist in the DOM. The easy option was to just skip those steps entirely for a fresh signup. It would have worked, technically.",
      },
      {
        type: "h3",
        text: "Why skipping felt wrong",
      },
      {
        type: "p",
        text: "Skipping a step silently teaches a new user nothing about a feature that's actually core to the product — they'd finish the tour never having heard the words \"Growth Coach\" at all, just because of timing. So instead, each of those steps got a fallback: when the real target isn't available yet, the tour points at the \"Connect YouTube\" prompt instead, with different copy explaining what they'll see once they connect. The step still happens. It just tells the truth about what's actually on screen right now, instead of pretending the gated feature doesn't exist or pointing at nothing.",
      },
      {
        type: "p",
        text: "Completion is tracked with a single nullable timestamp on the user record, set whether the tour is finished or explicitly skipped — null just means \"hasn't seen it yet,\" which is what actually drives whether the tour auto-launches. Small detail, but it's the kind of thing that's easy to get backwards (tracking \"has seen\" as a boolean that silently means two different things) and mildly annoying to fix later once real users have inconsistent states saved.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}
