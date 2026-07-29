// Syncs users into Resend's Audience (Contacts) so Ayaan can send
// marketing/product-update broadcasts straight from Resend's own dashboard —
// no in-app sending UI needed. Plain fetch, same pattern as src/lib/email.ts:
// one JSON POST doesn't justify the `resend` SDK as a dependency.
//
// Uses a separate API key/env var from RESEND_API_KEY (which is "Sending
// access" only, scoped to transactional email) because writing contacts
// needs "Full access" — see docs/DECISIONS_LOG.md, 2026-07-28.
const RESEND_API_URL = "https://api.resend.com/contacts";

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

  if (!apiKey) {
    // Not configured yet (e.g. local dev without this var set) — no-op
    // rather than throw, since audience sync should never block sign-up.
    return;
  }

  const [firstName, ...rest] = name.trim().split(" ");
  const lastName = rest.join(" ") || undefined;

  const response = await fetch(RESEND_API_URL, {
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
      // Custom contact property — configured in Resend's Audience >
      // Properties tab (string, fallback "free"). Lets broadcasts be
      // segmented by plan once paid tiers exist.
      properties: [{ key: "plan", value: plan }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend contacts API error: ${response.status} - ${body}`);
  }

  return response.json();
}
