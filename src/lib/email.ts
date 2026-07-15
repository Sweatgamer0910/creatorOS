// Thin wrapper over Resend's HTTP API — plain fetch rather than the
// `resend` SDK, since the API is a single JSON POST and this avoids a
// dependency for what's currently one call site. If email usage grows
// (password reset, notifications, etc.), swap this for the SDK then.
const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

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
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${body}`);
  }

  return response.json();
}
