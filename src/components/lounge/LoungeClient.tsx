"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// The lounge reads sessionStorage/localStorage on first render, so skip SSR.
const Lounge = dynamic(() => import("./Lounge"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center gap-2 py-32 font-mono text-sm text-[var(--color-text-muted)]">
      <Loader2 size={16} className="animate-spin" /> loading lounge…
    </div>
  ),
});

export default function LoungeClient() {
  return <Lounge />;
}
