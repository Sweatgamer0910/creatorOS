import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "CreatorOS — one system for every stage of the channel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Reused for both `og:image` and (absent a dedicated twitter-image.tsx)
// the Twitter card — see layout.tsx's metadata, which no longer hardcodes
// a static /logo.png so this file-convention image takes over instead.
// The 512x512 square logo alone made a poor "summary_large_image" card
// (Next couldn't just stretch it to 1200x630 without looking off); this
// builds a proper landscape card from the same brand tokens the rest of
// the site uses (globals.css: #030304/#0e1116 background, #f5a623 accent,
// Space Grotesk display font isn't available to Satori without a font
// file, so this leans on generic sans-serif weight/spacing instead).
export default async function OpengraphImage() {
  const logoData = readFileSync(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#030304",
          backgroundImage:
            "radial-gradient(ellipse at 50% 35%, rgba(245,166,35,0.22), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={96} alt="" />
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: "#e8eaed",
              letterSpacing: -1.5,
            }}
          >
            CreatorOS
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 34,
            color: "#8b93a1",
            maxWidth: 880,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          One system for every stage of the channel
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 3,
            color: "#f5a623",
            textTransform: "uppercase",
          }}
        >
          AI operating system for YouTube creators
        </div>
      </div>
    ),
    { ...size },
  );
}
