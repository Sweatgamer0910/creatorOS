import { NextRequest, NextResponse } from "next/server";
import { setAudienceUnsubscribed } from "@/lib/resend-audience";

// Single URL used for both unsubscribe mechanisms, per RFC 8058's own
// recommendation — it's what's in the List-Unsubscribe header AND the
// visible footer link in src/lib/marketing-email.ts:
//
// - POST: RFC 8058 one-click. Mail clients (Gmail/Outlook/etc) call this
//   directly when someone clicks their own native "Unsubscribe" button —
//   no browser involved, expects a bare 200.
// - GET: a human clicking the visible footer link in an actual browser.
//   Unsubscribes the same way, then redirects to /unsubscribe for a
//   readable confirmation instead of showing raw JSON.
async function unsubscribe(email: string | null) {
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  await setAudienceUnsubscribed(email, true);
  return null;
}

export async function POST(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  try {
    const errorResponse = await unsubscribe(email);
    if (errorResponse) return errorResponse;
  } catch (err) {
    console.error("[unsubscribe] one-click POST failed:", err);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  try {
    const errorResponse = await unsubscribe(email);
    if (errorResponse) return errorResponse;
  } catch (err) {
    console.error("[unsubscribe] GET failed:", err);
    return NextResponse.redirect(
      new URL(
        `/unsubscribe?email=${encodeURIComponent(email ?? "")}&failed=1`,
        req.url,
      ),
    );
  }
  return NextResponse.redirect(
    new URL(`/unsubscribe?email=${encodeURIComponent(email!)}`, req.url),
  );
}
