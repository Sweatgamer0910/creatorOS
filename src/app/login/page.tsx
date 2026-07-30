import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

// Server component wrapper: an already-signed-in visitor hitting /login
// (stale bookmark, back-button, etc.) wants their dashboard, not a login
// form they don't need — same pattern as the "/" landing page redirect.
export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

  return <LoginForm />;
}
