import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SignupForm from "./SignupForm";

// Server component wrapper: an already-signed-in visitor hitting /signup
// wants their dashboard, not a signup form — same pattern as /login and
// the "/" landing page redirect.
export default async function SignupPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

  return <SignupForm />;
}
