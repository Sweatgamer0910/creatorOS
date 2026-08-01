// Syncs users into Resend's Audience (Contacts) so Ayaan can send
// marketing/product-update broadcasts straight from Resend's own dashboard —
// no in-app sending UI needed. Plain fetch, same pattern as src/lib/email.ts:
// one JSON POST doesn't justify the `resend` SDK as a dependency.
//
// Uses a separate API key/env var from RESEND_API_KEY (which is "Sending
// access" only, scoped to transactional email) because writing contacts
// needs "Full access" — see docs/DECISIONS_LOG.md, 2026-07-28.
const RESEND_API_BASE = "https://api.resend.com";

// 2026-07-29: contacts belong to a specific Audience/Segment — Resend's API
// is POST /audiences/{audience_id}/contacts, not a flat POST /contacts.
// The flat-URL version silently 404'd (caught by the try/catch in auth.ts's
// signup hook, which only logs) so every real signup before this fix likely
// never actually landed in Resend. RESEND_AUDIENCE_ID is the "General"
// segment's id from the Resend dashboard (Audience > Segments).
function audienceContactsUrl(email?: string) {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const base = `${RESEND_API_BASE}/audiences/${audienceId}/contacts`;
  return email ? `${base}/${encodeURIComponent(email)}` : base;
}

export async function addToAudience({
  email,
  name,
  plan,
}: {
  email: string;
  name: string;
  plan: string;
}) {
  const apiKey = process.env.RESEND_AUDIENCE_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    // Not configured yet (e.g. local dev without these vars set) — no-op
    // rather than throw, since audience sync should never block sign-up.
    return;
  }

  const [firstName, ...rest] = name.trim().split(" ");
  const lastName = rest.join(" ") || undefined;

  const response = await fetch(audienceContactsUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      first_name: firstName,
      last_name: lastName,
      unsubscribed: false,
      // Custom contact properties — configured in Resend's Audience >
      // Properties tab (all string-typed; Resend only supports
      // string/number property types, no boolean/date, so channelConnected
      // is the literal string "true"/"false" and signupDate is an ISO
      // date string). Lets broadcasts in Phase A1/A2 (see
      // CreatorOS_Marketing_Email_Plan.docx) segment by lifecycle stage.
      //
      // `properties` is a flat object (a "record"), NOT an array of
      // {key, value} pairs — the array shape looked right from the docs'
      // "Expandable" key/value description but fails at runtime with
      // "422 Invalid input: expected record, received array" (caught via
      // the first real signup test, 2026-07-29). Confirmed against
      // Resend's current API reference.
      properties: {
        plan,
        signupDate: new Date().toISOString().slice(0, 10),
        channelConnected: "false",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend contacts API error: ${response.status} - ${body}`);
  }

  return response.json();
}

// Syncs a pre-launch waitlist signup (landing page ClosingCTA form) into the
// same Resend audience as real users, tagged `plan: "waitlist"` so Phase A2
// broadcasts (see docs/CreatorOS_Marketing_Email_Plan.docx) can segment them
// separately from actual accounts — reuses the existing plan property rather
// than a new custom property, which would need configuring in Resend's
// dashboard first (see the 2026-07-29 properties note above). No name is
// collected on the landing form, so first_name/last_name are omitted rather
// than sent empty. Best-effort like the other sync functions here — the
// caller (src/lib/waitlist/actions.ts) treats the WaitlistEntry DB row as
// the source of truth and this as a nice-to-have.
export async function addWaitlistContact(email: string) {
  const apiKey = process.env.RESEND_AUDIENCE_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return;
  }

  const response = await fetch(audienceContactsUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      properties: {
        plan: "waitlist",
        signupDate: new Date().toISOString().slice(0, 10),
        channelConnected: "false",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend contacts API error: ${response.status} - ${body}`);
  }

  return response.json();
}

// Syncs a free Channel Health check opt-in (src/app/channel-health) into
// the same Resend audience, tagged `plan: "channel-check-lead"` so it's
// segmentable separately from both real accounts and landing-page waitlist
// signups. Only the properties already configured in Resend's dashboard
// (see the 2026-07-29 note above) are set here — the channel/score details
// live in the ChannelCheckLead table and the Inngest event payload, not as
// Resend contact properties, so this doesn't depend on adding new custom
// properties in Resend's dashboard first.
export async function addChannelCheckLead(email: string) {
  const apiKey = process.env.RESEND_AUDIENCE_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return;
  }

  const response = await fetch(audienceContactsUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      properties: {
        plan: "channel-check-lead",
        signupDate: new Date().toISOString().slice(0, 10),
        channelConnected: "false",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend contacts API error: ${response.status} - ${body}`);
  }

  return response.json();
}

// Updates a subset of an existing contact's properties without touching the
// rest — used for lifecycle events after signup (channel connected, last
// active) rather than only ever writing properties once at signup time, so
// segmentation in Phase A1/A2 reflects real, current behavior.
export async function updateAudienceContact(
  email: string,
  properties: Record<string, string>,
) {
  const apiKey = process.env.RESEND_AUDIENCE_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return;
  }

  const response = await fetch(audienceContactsUrl(email), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend contacts API error: ${response.status} - ${body}`);
  }

  return response.json();
}

// Looks up a contact's current state — used before sending a marketing
// (non-transactional) email to skip anyone who's already unsubscribed,
// since we send lifecycle emails through the plain Emails API (not Resend's
// Broadcasts feature), which doesn't auto-suppress unsubscribed contacts.
// Returns null if the contact isn't found or audience sync isn't
// configured, which callers should treat as "don't skip, but proceed
// carefully" — see sendMarketingEmail in src/lib/marketing-email.ts.
export async function getAudienceContact(email: string): Promise<{
  unsubscribed: boolean;
  properties?: Record<string, unknown>;
} | null> {
  const apiKey = process.env.RESEND_AUDIENCE_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return null;
  }

  const response = await fetch(audienceContactsUrl(email), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend contacts API error: ${response.status} - ${body}`);
  }

  return response.json();
}

// Sets the contact's unsubscribed flag — a top-level field on the contact,
// not a custom property, so it's a separate call from updateAudienceContact.
// Used by the /unsubscribe route (one-click footer link + List-Unsubscribe
// header) so opt-outs take effect immediately, well inside CAN-SPAM's
// 10-business-day requirement.
export async function setAudienceUnsubscribed(
  email: string,
  unsubscribed: boolean,
) {
  const apiKey = process.env.RESEND_AUDIENCE_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return;
  }

  const response = await fetch(audienceContactsUrl(email), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ unsubscribed }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend contacts API error: ${response.status} - ${body}`);
  }

  return response.json();
}
