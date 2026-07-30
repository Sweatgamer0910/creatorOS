# CreatorOS Mobile Redesign Plan — "Instagram/Facebook-style" separate mobile UI

Status: **draft for review — nothing in this plan has been implemented.**
Prepared: 2026-07-30

---

## 1. TL;DR

- What you're describing (Instagram, Facebook: "totally different UI on phone vs. desktop, same account, same data") is a real, well-established pattern, and CreatorOS's codebase is already structured in a way that makes it achievable without touching the desktop UI at all.
- There are two different things people mean by "Instagram has a mobile version": their **native iOS/Android apps** (a completely separate codebase, different tech stack, App Store review — out of scope for this plan) vs. **a distinct mobile *web* layout** (same website, same login, same backend, different components served to phones). Everything below is about the second one. I'll flag the native-app question as a separate, much bigger decision at the end.
- Recommended architecture: keep one Next.js app, one database, one set of business logic (`src/lib/*` — already fully separated from UI, which is the hardest part of this and it's already done) — and add a second, parallel set of *presentational* components per screen, chosen server-side per request based on device. Same pattern already used for the nav fix earlier today, generalized properly to every screen.
- Rough effort: 8–14 focused sessions across the 9 main app screens, done one screen at a time, lowest risk first.
- My recommendation on timing: **ship what's already fixed (usable, not embarrassing) now, do the full custom redesign as a fast-follow in the first few weeks post-launch**, ideally informed by real data on how many of your actual users are on mobile. Full reasoning in section 6 — happy to be talked out of it.

---

## 2. Clearing up what "Instagram/Facebook-style" actually means

This matters because the implementation cost is wildly different depending on which one you mean.

**Native mobile apps.** Instagram's phone app and Instagram's website are not the same codebase at all. The phone app is React Native (compiled to a real iOS/Android app, distributed through the App Stores); the website is a separate React web app. They share a backend API and a design language, but literally none of the UI code. Building this for CreatorOS would mean a second app, a second codebase, Apple/Google developer accounts, app review, and ongoing maintenance of two products. That's a multi-month initiative, not a redesign.

**A separate mobile *web* experience (no app, still a browser).** This is the `m.facebook.com` / "Twitter Lite" pattern: same website, same URL, same login, same database — but a phone visiting it gets served genuinely different components, not just a squeezed version of the desktop layout. This is what I believe you're actually asking for, based on "the boxes and everything are all over the place" and wanting the mobile experience to feel purpose-built rather than shrunk. This plan is scoped to this option.

**Responsive / adaptive (what got fixed earlier today).** One set of components, CSS breakpoints reflow them for a smaller screen. This is what most small products do, it's what CreatorOS had (badly, until today's fix), and it's now at least *functional* — but it's still fundamentally "the desktop design, rearranged," not a purpose-built mobile UI. It doesn't give you Instagram's "totally different UI" feeling, because it isn't one.

---

## 3. What the research says

**The historical pattern (Facebook, early Twitter, LinkedIn) was exactly this "separate mobile web" approach, and it's well-documented why.** Facebook launched `m.facebook.com` specifically because mobile users on slow/limited connections needed less code and a simpler, touch-first layout than the desktop site — a deliberately separate, lighter, restructured experience, not a responsive reflow ([TechCrunch](https://techcrunch.com/?p=290151), [engineering.fb.com](https://engineering.fb.com/2020/05/08/web/facebook-redesign/)). Twitter did the same with Twitter Lite, built explicitly as a Progressive Web App with its own component tree, and it ended up "an order of magnitude less expensive to run" than the desktop site precisely because it wasn't carrying desktop-only weight ([Medium — Paul Armstrong](https://medium.com/@paularmstrong/twitter-lite-and-high-performance-react-progressive-web-apps-at-scale-d28a00e780a3), [blog.x.com](https://blog.x.com/engineering/en_us/topics/open-source/2017/how-we-built-twitter-lite)). LinkedIn Lite took it further and didn't even use React on mobile, to keep the bundle small ([LinkedIn Engineering](https://www.linkedin.com/blog/engineering/archive/linkedin-lite-a-lightweight-mobile-web-experience)).

**The more recent trend (2025–2026) is that most products default to responsive, and only go adaptive/separate when there's a specific reason to.** A single responsive codebase is what's usually recommended today because it's less maintenance and better for SEO ([UXPin](https://www.uxpin.com/studio/blog/responsive-vs-adaptive-design-whats-best-choice-designers/)) — but the same sources are consistent that **adaptive (separate layouts) is still the right call when mobile and desktop genuinely need different content or interaction models**, which is CreatorOS's actual situation: your Pipeline board's drag-and-drop literally cannot work the same way on a touchscreen as it does with a mouse. That's not a styling problem CSS breakpoints can fix — it needs an actually different interaction design on mobile ([Duck Design](https://duck.design/adaptive-vs-responsive-design/), [Influize](https://www.influize.com/blog/adaptive-vs-responsive-design)).

**On cost:** general web/app redesign case studies put a real redesign effort in the tens of thousands of dollars of engineering time for a product of this size ([FuseLab](https://fuselabcreative.com/the-challenges-of-application-redesign-and-case-study/)), and the honest framing I found repeatedly is that the right call depends on your users' actual device behavior and how mobile-critical the core workflows are — not a blanket rule. One case study's framing fits CreatorOS almost exactly: a dashboard/analytics-heavy product is inherently desktop-primary, and the recommended pattern there was to ship web-first and add a purpose-built mobile layer only where the data justified it, rather than assuming mobile needs full parity everywhere from day one.

**On implementation, in React specifically:** the standard way to get "one business logic layer, two different UIs" is the container/presenter pattern — a container component owns data-fetching and logic, and hands the same data to whichever presentational component matches the device, so you write the data logic once and the two UIs are just two different renderings of the same props ([tsh.io](https://tsh.io/blog/container-presentational-pattern-react), [Effort Stack](https://effortstack.com/blog/container-presenter-pattern-react)). This is good news, because CreatorOS already has this exact separation, described in section 4.

**On Next.js specifically:** you can detect device type on the server, before anything is sent to the browser, using Next's built-in `userAgent()` helper inside a Server Component or middleware — no client-side flicker, no JavaScript needed just to decide which layout to show ([Medium](https://medium.com/@rajendransoundar3/detecting-device-type-in-next-js-ssr-on-both-page-and-app-router-32c07249e1a7), [DEV Community](https://dev.to/m0slah/using-useragent-in-nextjs-app-router-device-browser-os-bot-detection-1ho8)). The one real caveat researchers flag is that using request data like this makes a route fully dynamic and disables full static caching/CDN edge-caching for it, and if you're not careful with cache headers, a CDN can serve the wrong device's cached version to the wrong visitor ([Next.js GitHub discussion](https://github.com/vercel/next.js/discussions/82571)). Section 5 explains why this specific risk mostly doesn't apply to CreatorOS's app screens.

---

## 4. Why CreatorOS is actually well set up for this

I read through the app's structure before writing this. The good news: someone (whoever built this — you, or an earlier session) already did the hard part.

Every screen already follows a clean split: `src/app/<page>/page.tsx` is a thin Server Component that does one job — fetch the data (`getContentItems()`, `getChannelAnalytics()`, `getIdeas()`, etc., all living in `src/lib/*`) — and then hands that data as props to a presentational component (`PipelineBoard`, `AnalyticsCharts`, `IdeaCard`, and so on). None of your business logic lives inside the visual components. That's precisely the container/presenter split the research above describes as the prerequisite for exactly this kind of dual-UI setup. It means a mobile redesign is "write a second presentational component per screen that takes the same props," not "rebuild how the app fetches and manages data." The data layer doesn't need to change at all.

Two more things work in your favor:

- Every app screen (dashboard, analytics, coach, pipeline, scripts, ideas, series, settings) is already fully dynamic per-request — it checks the logged-in session on every load (`auth.api.getSession()`), so none of it is statically cached today. That means the CDN-caching risk the research flagged (wrong version served to wrong device) mostly doesn't apply to your actual product — it would only matter if you also gave the public marketing/landing page a separate mobile version, which is a much smaller, lower-stakes surface.
- You already have a working example of this exact pattern shipped today: `NotchNav.tsx`'s new mobile branch and the nav is a real, working "completely different component for phones, same data, same account" — just not yet applied past the navigation chrome.

The one screen that isn't just a "make it prettier on phone" problem: **Pipeline**. Its drag-and-drop uses a browser API that plain doesn't fire on touchscreens. That one needs an actual interaction redesign on mobile (e.g., tap a card, pick "Move to Scripting," instead of dragging), not just new styling.

---

## 5. Recommended architecture

**Server-side device branch, inside each page, choosing between two presentational component trees — not a separate route, not a separate subdomain.**

Concretely, per screen:

1. A small shared helper, e.g. `src/lib/device.ts`, wraps Next's `userAgent()` to return `"mobile" | "desktop"` from the incoming request headers. One file, written once, used everywhere.
2. Each `page.tsx` keeps its existing data-fetching exactly as-is, then does one `if (device === "mobile") return <PipelineBoardMobile ... /> else return <PipelineBoard ... />` — same props in both branches.
3. Desktop's existing components are literally untouched — same files, same behavior, same everything, they just become the "else" branch.
4. New mobile-only components live alongside the existing ones (e.g. `PipelineBoardMobile.tsx` next to `PipelineBoard.tsx`), free to use a completely different layout, different interaction model, different information density — an actual purpose-built phone UI, not a squeeze of the desktop one.

Why this over the alternatives:

- **Vs. a separate route tree (`/m/dashboard`) with a middleware rewrite:** functionally similar, but adds URL complexity, an extra rewrite layer in `proxy.ts` (which is already your security-critical auth gate — I'd rather not add more logic to that file than necessary), and no real benefit for CreatorOS since we're not trying to CDN-cache these pages differently. The page-level branch gets the same result with less new infrastructure.
- **Vs. a native app:** enormously larger scope (new codebase, app store), and doesn't match "I'm leaving for lunch, don't start coding" — flagging as a separate future decision, not part of this plan.
- **Vs. pure responsive (what's live now):** doesn't get you the "totally different UI" feeling you actually want; keeps the desktop layout as the base for both.

One honest tradeoff to be upfront about: detecting by user-agent string is not perfect. It can misclassify unusual browsers (an iPad in some cases, an in-app browser like the one Instagram/TikTok use when someone taps a link from those apps, or a phone in "desktop mode"). The mitigation, and what I'd build in from the start: fall back to the existing `useIsNarrowViewport()` width check as a secondary correction after the page loads, exactly like the nav does today — so even in the rare misclassification case, the layout still corrects itself instead of staying wrong.

---

## 6. Before or after launch — my recommendation

You asked me to weigh in, so here's my honest read.

**Reasons to do it before launching:** a meaningful share of people who discover a YouTube-creator tool will click through from a phone (social, YouTube app, etc.), and first impressions are hard to undo. If mobile feels like an afterthought at launch, it can color someone's whole impression of the product even if they later switch to desktop.

**Reasons to do it after launching:** this is now a genuinely large scope item — a purpose-built second UI for 8+ screens, plus a real interaction redesign for the Kanban board — sitting on top of an already-full pre-launch list (security, legal, the Google verification re-check, SEO, the nav/padding fix) that took this whole session. Your own project rules are explicit about scope discipline and never sacrificing quality for speed — building 8+ mobile screens well, under real time pressure, is exactly the kind of rushed work that principle is meant to prevent. And critically: **the acute problem is already fixed.** Before today, mobile was arguably broken (nav literally unreachable, content unreadable). After today's fix, it's usable — not custom-built, not delightful, but not embarrassing either. That's the difference between "must fix before anyone sees it" and "worth investing in once you know it's worth it." CreatorOS's core workflows (analytics dashboards, script writing, a Kanban pipeline) are also inherently desktop-primary tools — the kind of product research suggests it's reasonable to ship web-first and invest in a dedicated mobile layer once usage data actually shows it's warranted, rather than assuming parity is needed everywhere on day one.

**My recommendation:** launch on the current (now-usable, responsive) mobile fix, and treat the full custom mobile redesign as a fast-follow in the first few weeks after launch — ideally after checking Vercel/Sentry analytics for what fraction of real signups and sessions are actually on mobile, so the investment is sized to real usage rather than a guess. If that data comes back high, this becomes urgent quickly and should jump the queue; if it's low, it justifies doing it calmly and well rather than rushed. I'd rather you tell me I'm wrong than have this be a silent assumption, since you know your audience better than research articles do.

---

## 7. Phased rollout (once you give the go-ahead)

1. **Foundations** — build the `getDeviceType()` helper and the fallback-correction wiring described in section 5. One small, low-risk change, no visible effect until screens start using it.
2. **Pilot: Pipeline.** This is the one screen that's objectively broken on touch (drag-and-drop), not just unpolished — highest-value place to prove the pattern out. Mobile version replaces drag-and-drop with a tap-based "move to stage" interaction.
3. **Roll out remaining screens one at a time:** Dashboard, Analytics, Coach, Ideas, Scripts (list + editor), Series, Settings. Each is its own self-contained unit of work — you can stop between any two of these and nothing is left half-broken, since desktop is never touched and mobile falls back to the current (usable) responsive layout until its custom version ships.
4. **Landing page.** Decide whether the 3D WebGL hero gets a lightweight, purpose-built mobile hero, or keeps today's fix (hides gracefully on phones). This is a design opportunity more than a bug fix at this point.
5. **Real-device QA.** This sandbox genuinely cannot resize its browser to test a real phone viewport (confirmed earlier today), so every screen needs an actual pass on your own phone (and ideally one Android + one iPhone) before being called done.
6. **Later, optional:** revisit whether a native app is ever worth it, once you have real usage data to justify that much bigger investment.

**Rough effort:** pilot (Pipeline) is the most novel, ~1–2 focused sessions. Simpler screens (Settings, Ideas, Scripts, Series) ~0.5–1 session each once the pattern is established. Data-heavy screens with charts (Dashboard, Analytics, Coach) ~1–2 sessions each, since the chart library (ECharts) needs its own mobile-specific sizing and touch interactions. Total ballpark: **8–14 sessions**, compressible once the first 2–3 screens establish reusable patterns. This is a rough, non-technical-founder-facing estimate, not a contractor quote — treat it as a planning input, not a promise.

---

## 8. Open questions for you to decide (nothing here is implemented yet)

- **Tablets:** do they get the desktop UI or the mobile UI? Given how dense CreatorOS's dashboards are, I'd lean desktop-for-tablets by default, but happy to go either way.
- **Icon/label parity:** should the mobile bottom bar mirror the desktop nav 1:1 (as shipped today), or should mobile get a simplified/reordered set once its own design language exists?
- **Landing page hero:** invest in a bespoke mobile 3D moment, or keep the current graceful hide-on-mobile behavior?
- **Native app:** not part of this plan, but worth deciding explicitly at some point rather than by default — now, later, or never?

---

## 9. What I did *not* do

Per your instruction, no code was written or changed for this. Everything shipped earlier today (the nav fix, the padding fix) was already committed before you asked for this plan and is unrelated to whether you approve anything above.

---

### Sources referenced

- [TechCrunch — Facebook mobile website history](https://techcrunch.com/?p=290151)
- [Meta Engineering — Facebook.com tech stack rebuild](https://engineering.fb.com/2020/05/08/web/facebook-redesign/)
- [Twitter Engineering — How we built Twitter Lite](https://blog.x.com/engineering/en_us/topics/open-source/2017/how-we-built-twitter-lite)
- [Paul Armstrong — Twitter Lite and High Performance React PWAs at Scale](https://medium.com/@paularmstrong/twitter-lite-and-high-performance-react-progressive-web-apps-at-scale-d28a00e780a3)
- [LinkedIn Engineering — LinkedIn Lite](https://www.linkedin.com/blog/engineering/archive/linkedin-lite-a-lightweight-mobile-web-experience)
- [UXPin — Responsive vs Adaptive Design 2026](https://www.uxpin.com/studio/blog/responsive-vs-adaptive-design-whats-best-choice-designers/)
- [Duck Design — Adaptive vs Responsive Design](https://duck.design/adaptive-vs-responsive-design/)
- [Influize — Adaptive vs Responsive Design 2026](https://www.influize.com/blog/adaptive-vs-responsive-design)
- [FuseLab Creative — App Redesign Challenges and Case Study](https://fuselabcreative.com/the-challenges-of-application-redesign-and-case-study/)
- [tsh.io — Container-Presentational Pattern in React](https://tsh.io/blog/container-presentational-pattern-react)
- [Effort Stack — Container-Presenter Pattern in React](https://effortstack.com/blog/container-presenter-pattern-react)
- [Medium — Detecting Device Type in Next.js SSR](https://medium.com/@rajendransoundar3/detecting-device-type-in-next-js-ssr-on-both-page-and-app-router-32c07249e1a7)
- [DEV Community — Using userAgent in Next.js App Router](https://dev.to/m0slah/using-useragent-in-nextjs-app-router-device-browser-os-bot-detection-1ho8)
- [Next.js GitHub Discussion — Vary header/CDN caching tradeoffs](https://github.com/vercel/next.js/discussions/82571)
