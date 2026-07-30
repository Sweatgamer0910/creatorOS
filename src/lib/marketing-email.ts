// Sends marketing/lifecycle email (Phase A1/A2 of
// docs/CreatorOS_Marketing_Email_Plan.docx) — deliberately separate from
// src/lib/email.ts, which is for transactional email (verification,
// password reset) that's exempt from CAN-SPAM's unsubscribe requirements.
// Anything sent through this file is NOT exempt: every send gets a visible
// unsubscribe link in the body plus List-Unsubscribe/List-Unsubscribe-Post
// headers for one-click unsubscribe support in Gmail/Outlook/etc, and skips
// contacts who've already opted out.
import { getAudienceContact } from "@/lib/resend-audience";

const RESEND_API_URL = "https://api.resend.com/emails";

// TODO(ayaan): CAN-SPAM requires a real physical mailing address in the
// footer of marketing email (a PO box is fine) — placeholder until you
// give me one. Don't let real sends go out with this still a placeholder.
const MAILING_ADDRESS = "CreatorOS — mailing address not yet configured";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://creatoros.onl";
}

function unsubscribeUrl(email: string) {
  // Same URL for both the visible footer link (a plain browser GET, which
  // src/app/api/unsubscribe/route.ts redirects to the confirmation page)
  // and the List-Unsubscribe header's RFC 8058 one-click POST — see that
  // route for why they're deliberately the same path.
  return `${appUrl()}/api/unsubscribe?email=${encodeURIComponent(email)}`;
}

function withFooter(html: string, email: string) {
  const url = unsubscribeUrl(email);
  return `
    ${html}
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888; font-family: sans-serif;">
      <p style="margin: 0 0 4px;">${MAILING_ADDRESS}</p>
      <p style="margin: 0;">
        You're receiving this because you have a CreatorOS account.
        <a href="${url}" style="color: #888;">Unsubscribe</a>
      </p>
    </div>
  `;
}

export async function sendMarketingEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ skipped: true; reason: string } | { skipped: false }> {
  // Sent through the plain Emails API (not Resend's Broadcasts feature),
  // which means Resend won't auto-suppress sends to unsubscribed contacts —
  // that check has to happen here.
  const contact = await getAudienceContact(to);
  if (contact?.unsubscribed) {
    return { skipped: true, reason: "unsubscribed" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  // Falls back to the transactional sender if a dedicated marketing sender
  // isn't configured — see docs/DECISIONS_LOG.md for why RESEND_FROM_EMAIL
  // is already the verified creatoros.onl address. Set
  // RESEND_MARKETING_FROM_EMAIL separately (e.g. "Ayaan from CreatorOS
  // <ayaan@creatoros.onl>") once a named-sender address exists — a named
  // human sender measurably outperforms a company-name sender for this
  // kind of email.
  const from =
    process.env.RESEND_MARKETING_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error(
      "RESEND_API_KEY / RESEND_FROM_EMAIL are not set — cannot send email.",
    );
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html: withFooter(html, to),
      headers: {
        // RFC 2369 + RFC 8058 one-click unsubscribe — what makes Gmail/
        // Outlook show their own native "Unsubscribe" button next to the
        // sender, not just the in-body link.
        "List-Unsubscribe": `<${unsubscribeUrl(to)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${body}`);
  }

  return { skipped: false };
}
