import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ConnectYouTubeButton from "./ConnectYouTubeButton";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { ownerId: session.user.id },
  });

  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>Workspace: {workspace ? workspace.name : "No workspace found"}</p>
      <ConnectYouTubeButton />
    </div>
  );
}
