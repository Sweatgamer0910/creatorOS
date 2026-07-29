import { redirect } from "next/navigation";

// Password reset doesn't apply anymore — auth is OAuth-only as of
// 2026-07-28 (see docs/DECISIONS_LOG.md). Redirect rather than 404 in case
// this URL is bookmarked from before the change.
export default function ForgotPasswordPage() {
  redirect("/login");
}
