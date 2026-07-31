import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Rendered inside the normal root layout (fonts, body background, etc.
// already applied), unlike global-error.tsx which replaces the layout
// entirely — so this can use the real design system instead of a
// hand-rolled html/body reset.
export default async function NotFound() {
  const session = await auth.api.getSession({ headers: await headers() });
  const homeHref = session ? "/dashboard" : "/";
  const homeLabel = session ? "Back to Dashboard" : "Back to home";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Image
        src="/logo.png"
        alt=""
        width={40}
        height={40}
        style={{
          borderRadius: 10,
          boxShadow: "0 0 24px rgba(245,166,35,0.35)",
        }}
      />
      <span className="font-mono mt-6 text-[13px] tracking-[3px] text-[var(--color-accent)] uppercase">
        404
      </span>
      <h1 className="font-display mt-3 text-[clamp(28px,4vw,42px)]">
        This page doesn&rsquo;t exist
      </h1>
      <p className="mt-3 max-w-[420px] text-[15px] leading-[1.6] text-[var(--color-text-muted)]">
        The link might be broken, or the page may have moved. Let&rsquo;s get
        you back to somewhere real.
      </p>
      <Link
        href={homeHref}
        className="glow-interactive mt-8 rounded-[10px] bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-black no-underline"
      >
        {homeLabel}
      </Link>
    </div>
  );
}
