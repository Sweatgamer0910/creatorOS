# v1 production checklist

Full audit of what's real versus mocked/missing, prioritized by what actually blocks a real
launch versus what's polish. Written after the security/QA pass and the Resend integration —
those items aren't repeated here, see `docs/03-engineering/qa-security-review.md`.

## Blocking — the product doesn't do what it claims yet

**Analytics, Health Score, and the AI Growth Coach are 100% mocked, with no real
implementation behind them at all.** This is the single biggest gap. Concretely:

- `src/lib/analytics/index.ts`, `src/lib/health-score/index.ts`,
  `src/lib/growth-coach/index.ts` each have a mock path and a real path — but the "real" path
  in health-score and growth-coach is just `throw new Error("... not implemented yet")`.
  There is no Anthropic/OpenAI API key anywhere in `.env`, no LLM call anywhere in the
  codebase. "AI-backed insights, labeled by confidence, never fabricated" (the landing page's
  own copy) is currently entirely hardcoded sample data, not AI output.
- Real YouTube Analytics fetching _does_ exist (`src/lib/analytics/youtubeProvider.ts`), but
  it's wired in as a separate `source=real` toggle on the analytics page only — Health Score
  and Coach never call it, they only ever see mock data.
- All three mock flags (`NEXT_PUBLIC_USE_MOCK_ANALYTICS/HEALTH_SCORE/COACH`) are `"true"` in
  `.env` right now, so this is what every current user sees by default.

This needs a decision, not just code: which LLM provider for the coach/scoring (Claude via
the Anthropic API is what the code comments assume), and a budget for it. I can build the
integration once that's picked.

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
