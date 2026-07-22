# v1 production checklist

Full audit of what's real versus mocked/missing, prioritized by what actually blocks a real
launch versus what's polish. Written after the security/QA pass and the Resend integration —
those items aren't repeated here, see `docs/03-engineering/qa-security-review.md`.

## Resolved — mock data removed, real YouTube data is now the only path

Dashboard, Analytics, and Coach all now source data from `getChannelAnalytics()`
(`src/lib/analytics/index.ts`), which checks whether the user has a connected Google account
and either fetches real data via `src/lib/analytics/youtubeProvider.ts` or returns `null` —
there is no mock fallback left anywhere (`mockProvider.ts` and the on-page scenario/source
toggle switches were deleted). Every page shows a "Connect your YouTube channel" prompt when
disconnected, and a "reconnect" prompt if a connected account's token has expired or a fetch
otherwise fails.

**Health Score and the Growth Coach are still rule-based, not AI/LLM-backed** — this was never
actually mocked data, just genuine logic (`src/lib/health-score/scorer.ts`,
`src/lib/growth-coach/coach.ts`) that used to run on fake input. It now runs on real analytics
data, so the numbers/insights are real, but the "AI-backed insights" framing on the landing
page is still aspirational rather than literal (the landing copy itself already says
"rule-based ... today, AI insights coming soon", so it isn't overclaiming). Wiring in an actual
LLM (Claude via the Anthropic API is what the code comments assume) is still a separate,
unbuilt piece of work needing a provider decision and budget — not required to ship v1 honestly
as-is, since nothing currently claims otherwise.

## Blocking — legal / account basics

- **No privacy policy or terms of service page anywhere.** Needed both generally (you're
  collecting emails, passwords, and — via the Google OAuth scopes — YouTube channel data) and
  specifically for Google: sensitive-scope OAuth apps (`youtube.readonly`,
  `yt-analytics.readonly`) need a privacy policy URL for Google's verification, or the app
  stays capped at 100 test users and shows an "unverified app" warning screen.
- **No password reset flow.** `emailAndPassword` is enabled with no `forgetPassword`/
  `resetPassword` wiring — a user who forgets their password has no recovery path today.
  Same shape of fix as the verification email (better-auth has this built in, needs a
  `sendResetPassword` callback using the Resend helper we just built).

## Blocking only if v1 charges money

- **No billing at all.** No Stripe (or any payment provider) dependency, no pricing page, no
  subscription/plan model in the Prisma schema. If v1 launches free/beta this doesn't block
  anything; if it's meant to charge from day one, this is a separate, sizable piece of work
  (needs your Stripe account + a pricing decision).

## Worth doing, not launch-blocking

- **SEO/social basics.** `layout.tsx`'s `metadata` is just a title + description — no
  Open Graph/Twitter card image, no `robots.ts`/`sitemap.ts`. Cheap to add, matters once
  you're sharing links.
- **`pnpm audit`** — still hasn't been run (couldn't reach the npm registry from this
  sandbox).
- **Live visual/interaction QA** — everything reviewed so far has been static code reading;
  worth a real click-through with `pnpm dev` open, especially the new rate-limit and
  verification-required flows.
- **Verified sending domain on Resend** — currently sends from the shared
  `onboarding@resend.dev` test address; fine for now, not for real users.

## Already solid

- Auth (session handling, workspace scoping, rate limiting, verification) — now consistent
  across every route after the last two passes.
- Pipeline/Scripts/Ideas CRUD, loading states, design system consistency.
- "Coming soon" AI writing features are honestly labeled (`LockedFeature`) rather than faked.
