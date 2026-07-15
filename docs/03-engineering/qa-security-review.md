# Full QA pass — security + dashboard review

Method: full static read of auth, every server action, every app-router page under
`src/app/(dashboard/analytics/coach/pipeline/scripts/ideas)`, and the components they render.
Could not get a live instance running in this sandbox to click through in a real browser —
the sandbox's network egress is allowlisted and doesn't include `registry.npmjs.org`, which
blocks both `next dev`'s one-time native SWC binary download and `pnpm/npm audit`. Both are
one-command checks worth running locally (`pnpm dev`, `pnpm audit`) to confirm the fixes below
render correctly and to catch any dependency CVEs this review couldn't check.

## Critical — fixed

**Broken access control / IDOR across Pipeline, Scripts, and Ideas.** `updateContentItemStatus`,
`deleteContentItem`, `updateScript`, `deleteScript`, `getScript`, and `deleteIdea` all took a
raw record `id` and operated on it with no check that the record belonged to the caller's
workspace — two of them (`updateContentItemStatus`, `deleteContentItem`) had no auth check
at all. In practice: any authenticated user could edit or delete any other workspace's
pipeline items, and `/scripts/<id>` would render any workspace's script content to anyone who
knew or guessed the id — this is a real cross-tenant data exposure in a multi-tenant product,
not a theoretical one.

Fixed by scoping every mutation/single-read to `{ id, workspaceId }` via Prisma's
`updateMany`/`deleteMany`/`findFirst` (Prisma's `update`/`delete`/`findUnique` only accept
unique-field `where` clauses, so ownership can't be folded into them directly) — see
`src/lib/pipeline/actions.ts`, `src/lib/scripts/actions.ts`, `src/lib/ideas/actions.ts`.

## Medium — fixed

**Inconsistent / missing route protection.** `dashboard` and `analytics` redirected
unauthenticated visitors to `/login`; `pipeline`, `scripts`, `scripts/[id]`, `ideas`, and
`coach` didn't — they'd either throw an unhandled "Not authenticated" error (ugly Next.js
error page instead of a redirect) or, in `coach`'s case, render mock data with no session
check at all. Fixed by adding the same `if (!session) redirect("/login")` check to every one
of those pages, plus a new `src/middleware.ts` that gates every non-public route on session
_cookie_ presence (a fast, no-DB-hit check) as a second line of defense — so a future page
that forgets its own check still isn't wide open. The per-page checks stay: middleware's
cookie check is optimistic (doesn't validate against the DB), the page-level
`auth.api.getSession()` is what actually confirms the session and scopes data.

## Also fixed (second pass)

- **Rate limiting.** `@upstash/ratelimit` was installed but never used anywhere — dropped in
  favor of better-auth's own built-in limiter instead of running two rate-limiting systems.
  It's now backed by the existing Upstash Redis instance (`src/lib/auth-rate-limit-storage.ts`,
  wired in as `secondaryStorage`), explicitly enabled (better-auth defaults it to
  production-only), with a tighter 5-req/60s custom rule on `/sign-in/email` and
  `/sign-up/email` specifically, 30/60s elsewhere. See `src/lib/auth.ts`.
- **Email verification.** `requireEmailVerification: true` is on. There's no transactional
  email provider configured anywhere in this project (no Resend/SES/Postmark key in `.env`),
  so `sendVerificationEmail` currently logs the verification link server-side rather than
  emailing it — that keeps signup usable in dev instead of silently locking everyone out, but
  it is **not** production-ready. Before real signups matter, wire a real provider into that
  callback in `src/lib/auth.ts`.
- **Pipeline drag-and-drop rollback.** `PipelineBoard.handleDrop` now reverts the optimistic
  status change and shows an inline error if `updateContentItemStatus` throws, instead of
  leaving a card visually in the wrong column while the database disagrees.

## Also fixed (third pass)

- **Real email delivery.** Connected the account's Resend workspace (via Claude in Chrome —
  it was already logged in), created a Sending-access-only API key
  ("CreatorOS - Auth Emails"), and added `RESEND_API_KEY`/`RESEND_FROM_EMAIL` to `.env`.
  `sendVerificationEmail` in `src/lib/auth.ts` now calls Resend's HTTP API directly
  (`src/lib/email.ts` — plain `fetch`, no new dependency) instead of just logging the link.
  **No custom domain is verified yet**, so it sends from Resend's shared test address
  (`onboarding@resend.dev`) — that works today, but replace `RESEND_FROM_EMAIL` with an
  address on a verified domain (Resend → Domains → Add domain, then a few DNS records) before
  this is something you'd want real users seeing in their inbox.

## Not fixed — needs infrastructure or a decision, not just code

- **No verified sending domain** — see above.
- **Dependency audit not run** — couldn't reach the npm registry from this sandbox. Run
  `pnpm audit` locally.
- **No visual/interaction QA** — couldn't boot the dev server in this sandbox (same network
  restriction blocks the native SWC binary Next.js needs). Everything in this doc is from
  reading the code, not clicking through it. Worth a real pass with `pnpm dev` open next to
  this list — in particular, confirm the new rate limits don't false-positive during normal
  use, and that the verification-required flow doesn't strand existing test accounts created
  before this change (they'll have `emailVerified: false` in the DB and won't be able to sign
  in until verified or manually flipped).

## What's good

- The workspace-scoping _pattern_ itself (`getWorkspaceId()` deriving from the session, one
  workspace per user) is sound — the bug was inconsistent application, not a bad design.
  Now that it's applied everywhere, this is a solid multi-tenant foundation.
- Design tokens and component reuse (`GlassPanel`, `Card`, `TiltCard`, CSS custom properties
  for color/type) are consistent across dashboard, analytics, coach, pipeline, scripts, and
  ideas — no one-off styling drift between sections.
- Real YouTube OAuth + YouTube Analytics API integration (`youtubeProvider.ts`) sits cleanly
  alongside a mock-data provider with a `SourceSwitcher`/`ScenarioSwitcher` toggle — a
  genuinely useful pattern for developing and demoing without live data or hitting API quota.
- `LockedFeature` (grayed-out preview + "coming soon" tooltip) is an honest way to show
  planned AI features in the UI without faking functionality that isn't built yet.
- `.env*` is git-ignored; no secrets found hardcoded or logged anywhere in the app code.
- No `dangerouslySetInnerHTML`/`eval` usage found — low baseline XSS surface.
- Per-route `loading.tsx` files are present across the dashboard sections — good perceived
  performance without extra work per page.
