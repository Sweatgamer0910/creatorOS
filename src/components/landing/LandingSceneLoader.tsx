"use client";

import dynamic from "next/dynamic";

// Splits three.js + @react-three/* (comfortably the heaviest JS on the
// page) out of the initial bundle so the hero's text/CTAs paint without
// waiting on the 3D stack to parse. `ssr: false` requires a client
// module — page.tsx is a server component, hence this wrapper instead of
// calling dynamic() there directly. No loading fallback on purpose: the
// scene is a fixed background layer behind the DOM content, so "nothing
// yet" is already the correct loading state (the page's own black +
// radial-gradient backdrop shows through).
const LandingScene = dynamic(() => import("./LandingScene"), { ssr: false });

export default function LandingSceneLoader() {
  return <LandingScene />;
}
