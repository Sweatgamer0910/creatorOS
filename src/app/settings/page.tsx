import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isYouTubeConnected } from "@/lib/analytics";
import Card from "@/components/ui/Card";
import WorkspaceNameForm from "./WorkspaceNameForm";
import YouTubeConnectionSection from "./YouTubeConnectionSection";
import ReplayTourButton from "./ReplayTourButton";
import DeleteAccountSection from "./DeleteAccountSection";

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 16,
  fontWeight: 600,
  color: "var(--color-text)",
};

const sectionDescStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--color-text-muted)",
  marginTop: 4,
  lineHeight: 1.5,
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [workspace, youtubeConnected] = await Promise.all([
    prisma.workspace.findUnique({ where: { ownerId: session.user.id } }),
    isYouTubeConnected(session.user.id),
  ]);

  return (
    <div
      className="px-4 sm:px-10"
      style={{ paddingTop: 24, paddingBottom: 64, maxWidth: 720, margin: "0 auto" }}
    >
      <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>Settings</p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 3.5vw, 34px)",
          marginTop: 6,
        }}
      >
        Account &amp; workspace
      </h1>

      <div className="flex flex-col gap-4" style={{ marginTop: 32 }}>
        <Card>
          <div style={sectionTitleStyle}>Profile</div>
          <p style={sectionDescStyle}>Signed in as {session.user.email}.</p>
        </Card>

        <Card>
          <div style={sectionTitleStyle}>Workspace</div>
          <p style={sectionDescStyle}>
            The name shown across your dashboard and pages.
          </p>
          <div style={{ marginTop: 12 }}>
            <WorkspaceNameForm initialName={workspace?.name ?? ""} />
          </div>
        </Card>

        <Card>
          <div style={sectionTitleStyle}>YouTube connection</div>
          <p style={sectionDescStyle}>
            Powers Analytics, Growth Coach, and your Dashboard health snapshot
            with your real channel data.
          </p>
          <div style={{ marginTop: 12 }}>
            <YouTubeConnectionSection connected={youtubeConnected} />
          </div>
        </Card>

        <Card>
          <div style={sectionTitleStyle}>Tour</div>
          <p style={sectionDescStyle}>
            Replay Nova&rsquo;s guided walkthrough of the app anytime.
          </p>
          <div style={{ marginTop: 12 }}>
            <ReplayTourButton />
          </div>
        </Card>

        <Card accentBorder="#e35d5d">
          <div style={{ ...sectionTitleStyle, color: "#e35d5d" }}>
            Danger zone
          </div>
          <p style={sectionDescStyle}>
            Permanently delete your account and everything in it — ideas,
            scripts, series, pipeline, and connected channel data. This
            can&rsquo;t be undone.
          </p>
          <div style={{ marginTop: 12 }}>
            <DeleteAccountSection />
          </div>
        </Card>
      </div>
    </div>
  );
}
