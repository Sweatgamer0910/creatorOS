import Link from "next/link";
import AuroraBackground from "@/components/landing/AuroraBackground";
import Card from "@/components/ui/Card";

// Shared chrome for /login, /signup, /forgot-password, /reset-password.
// AuroraBackground already existed in the codebase (built for the landing
// page's design system) but wasn't used anywhere — auth was the one place
// left rendering on a flat black background instead of the rest of the
// app's premium treatment.
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <AuroraBackground />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 700,
            color: "#fff",
            textDecoration: "none",
            marginBottom: 28,
          }}
        >
          CreatorOS
        </Link>

        <Card
          variant="glass"
          padding="lg"
          style={{
            width: "100%",
            boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 600,
              color: "#fff",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-muted)",
                marginTop: 6,
              }}
            >
              {subtitle}
            </p>
          )}

          <div style={{ marginTop: 24 }}>{children}</div>
        </Card>

        {footer && (
          <div
            style={{
              marginTop: 20,
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
