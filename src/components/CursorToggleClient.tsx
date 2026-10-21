"use client";

import dynamic from "next/dynamic";

// Reads localStorage on mount — skip SSR.
const CursorToggle = dynamic(() => import("./CursorToggle"), { ssr: false });

export default function CursorToggleClient() {
  return <CursorToggle />;
}
