import Card from "@/components/ui/Card";
import ConnectYouTubeButton from "@/components/ConnectYouTubeButton";

export default function ReconnectYouTubeNotice({
  callbackURL,
}: {
  callbackURL?: string;
}) {
  return (
    <Card accentBorder="#d97706" style={{ maxWidth: 480, marginTop: 20 }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Your YouTube connection needs a refresh
      </div>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 14,
          marginTop: 8,
          lineHeight: 1.6,
        }}
      >
        We couldn&apos;t pull fresh data from YouTube — your access may have
        expired. Reconnecting takes a few seconds and won&apos;t affect anything
        else in your account.
      </p>
      <div style={{ marginTop: 16 }}>
        <ConnectYouTubeButton
          label="Reconnect YouTube"
          callbackURL={callbackURL}
        />
      </div>
    </Card>
  );
}
