import Card from "@/components/ui/Card";
import ConnectYouTubeButton from "@/components/ConnectYouTubeButton";

export default function ConnectYouTubePrompt({
  description = "Connect your YouTube channel to see real analytics, health score, and coaching insights here.",
  callbackURL,
}: {
  description?: string;
  callbackURL?: string;
}) {
  return (
    <Card style={{ maxWidth: 480, marginTop: 20 }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        Connect your YouTube channel
      </div>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 14,
          marginTop: 8,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      <div style={{ marginTop: 16 }}>
        <ConnectYouTubeButton callbackURL={callbackURL} />
      </div>
    </Card>
  );
}
