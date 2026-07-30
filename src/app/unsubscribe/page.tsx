import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { linkStyle, successBoxStyle, errorBoxStyle } from "../auth-form.styles";

// Pure confirmation display — the actual unsubscribe happens in
// src/app/api/unsubscribe/route.ts (GET), which redirects here afterward.
// Kept as two separate routes rather than doing the mutation directly in
// this page so the same URL shape (/api/unsubscribe?email=...) can be used
// for both the visible footer link (a browser GET, ends up here) and the
// RFC 8058 one-click POST mail clients send directly — see
// src/lib/marketing-email.ts.
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; failed?: string }>;
}) {
  const { email, failed } = await searchParams;

  if (!email) {
    return (
      <AuthShell title="Unsubscribe">
        <p style={errorBoxStyle}>
          Missing email address — this link looks incomplete. Contact us if you
          keep getting emails you don&apos;t want.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Unsubscribe"
      footer={
        <Link href="/" style={linkStyle}>
          Back to CreatorOS
        </Link>
      }
    >
      {failed ? (
        <p style={errorBoxStyle}>
          Something went wrong unsubscribing <strong>{email}</strong>. Try again
          in a moment, or reply to any email from us and we&apos;ll do it
          manually.
        </p>
      ) : (
        <p style={successBoxStyle}>
          <strong>{email}</strong> won&apos;t receive marketing emails from
          CreatorOS anymore. Account emails (like password resets) aren&apos;t
          affected.
        </p>
      )}
    </AuthShell>
  );
}
