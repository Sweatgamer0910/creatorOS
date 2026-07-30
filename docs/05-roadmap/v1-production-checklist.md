# v1 production checklist

Full audit of what's real versus mocked/missing, prioritized by what actually blocks a real
launch versus what's polish. Last refreshed 2026-07-30 — see `docs/DEVELOPMENT_LOG.md` and
`docs/DECISIONS_LOG.md` for the detailed record behind everything below.

## Resolved — mock data removed, real YouTube data is now the only path

Dashboard, Analytics, and Coach all source data from `getChannelAnalytics()`
(`src/lib/analytics/index.ts`), which checks whether the user has a connected Google account and
either fetches real data via `src/lib/analytics/youtubeProvider.ts` or returns `null` — no mock
fallback anywhere. Every page shows a "Connect your YouTube channel" prompt when disconnected, and
a "reconnect" prompt if a connected account's token has expired or a fetch otherwise fails.

**Health Score and the Growth Coach are rule-based, not AI/LLM-backed** — genuine logic
(`src/lib/health-score/scorer.ts`, `src/lib/growth-coach/coach.ts`) running on real analytics
data. The landing page is explicit that this is "rule-based ... today, AI insights coming soon."
One in-app copy mismatch (Health Score card called itself "AI-generated") was found in live QA
and fixed 2026-07-29 — everywhere now agrees it's rule-based. Wiring in an actual LLM is still
unbuilt, needs a provider decision and budget, not required to ship honestly as-is.

## Resolved — legal / account basics (previously blocking)

- **Privacy policy and terms of service pages are live** (`/privacy`, `/terms`), added
  2026-07-28 — covers the general disclosure need and Google's OAuth-verification requirement.
  Verification itself is submitted and sitting in Google's review queue; nothing further to do
  but wait.
- **Password reset flow is live** — `/forgot-password` → `/reset-password`, restored 2026-07-29
  alongside email/password sign-in (Google/Discord OAuth stay available too).
- **Verified Resend sending domain** — transactional and marketing email both send from
  `creatoros.onl` addresses now, not the shared `onboarding@resend.dev` test address. Confirmed
  working via a real signed-out signup → verification email → login click-through, 2026-07-30.
- **Real mailing address in `marketing-email.ts`** — the CAN-SPAM-required physical address was a
  placeholder, flagged `TODO(ayaan)`; set 2026-07-30.

## Resolved — this week's live QA + security pass

- **Full live click-through of production**, not just static code reading: dashboard, analytics,
  coach, ideas, scripts, pipeline, settings, login, signup, forgot-password, privacy, terms, plus
  a complete signed-out signup flow. See `docs/DEVELOPMENT_LOG.md`, 2026-07-29 and 2026-07-30.
- **`pnpm audit` run and the real findings patched** — `next`, `postcss`, and `sharp` were behind
  patched versions (several high-severity Next.js advisories: middleware bypass, SSRF, DoS).
  Bumped and deployed. Remaining low/moderate findings are all in build-time or Prisma-dev-only
  tooling (`fast-uri`, `@hono/node-server`, `valibot`, `brace-expansion` via Sentry's bundler
  plugin, `ts-morph`/shadcn, and Prisma's local dev server) — not code that runs for real users,
  fine to leave for a future cleanup pass.
- **`/login` and `/signup` now redirect an already-authenticated visitor to `/dashboard`**
  instead of rendering the form again — same pattern as `/`. Found in live QA, 2026-07-29.
- **Neon database connection switched to the pooled endpoint** — the app was connecting through
  Neon's direct endpoint, which Vercel's serverless functions can exhaust under concurrent load
  (each invocation opens its own connection, no shared pool). Plausible cause of intermittent 503s
  seen during QA. Fixed 2026-07-30; see that date's `DECISIONS_LOG.md` entry for the `directUrl`
  detour that turned out unnecessary.
- **Landing page waitlist capture is live** — the `ClosingCTA` form used to be a UI mockup with no
  backend call; now persists to a `WaitlistEntry` table, rate-limited, best-effort synced to
  Resend. Verified with a real end-to-end submission on production, 2026-07-30.

## Blocking only if v1 charges money

- **No billing at all.** No Stripe (or any payment provider) dependency, no pricing page, no
  subscription/plan model beyond `Workspace.plan` defaulting to `"free"`. Not a blocker — v1 is
  launching free/beta by explicit decision. Revisit once there's a pricing decision to build
  against (see `CreatorOS Pricing Strategy.md` for the standing recommendation).

## Resolved — SEO/social basics

- **`robots.ts` and `sitemap.ts` already existed** (dated 2026-07-27) despite this doc previously
  saying they didn't — third stale claim caught in one day (alongside the `pnpm audit` and
  security-header entries above), worth an audit pass of this whole file at some point rather
  than trusting it at face value.
- **Real 1200x630 OG/Twitter card image added** (`opengraph-image.tsx`, via `next/og`), replacing
  the 512x512 `logo.png` fallback `layout.tsx` was using for both — switched Twitter to
  `summary_large_image` now that there's a real landscape image. Not yet visually confirmed
  against a live social-preview debugger — worth checking once deployed.

## Worth doing, not launch-blocking

- **No CI, no end-to-end tests.** Vitest unit tests exist (7 files) but Playwright is a listed
  dependency with nothing written against it, and there's no GitHub Actions (or similar) running
  anything automatically on push — every check so far has been a manual pass. Fine at current
  scale; worth revisiting if the pace of changes picks up or more people start touching the code.
- **Real, current mailing/reply inbox for `ayaan@creatoros.onl`.** MX records point at Resend's
  bounce handler, not a mailbox, so replies to marketing email currently go nowhere. Low priority
  while copy doesn't depend on replies working.

## Already solid

- Auth (session handling, workspace scoping, rate limiting, verification, OAuth + email/password)
  — consistent across every route.
- Pipeline/Scripts/Ideas/Series CRUD, loading states, design system consistency.
- "Coming soon" AI writing features are honestly labeled (`LockedFeature`) rather than faked.
- Sentry error monitoring active in production.
- Upstash Redis and Neon Postgres both have generous headroom at current usage (checked directly
  in both dashboards, 2026-07-30) — not a near-term concern even accounting for a traffic spike.
