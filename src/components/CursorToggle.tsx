"use client";

import { useEffect, useState } from "react";
import { MousePointer2, Bot } from "lucide-react";
import {
  applyAvatarCursor, clearAvatarCursor,
  loadCursorPref, saveCursorPref, initCursorFromStorage,
} from "@/lib/avatarCursor";

/**
 * Floating toggle that appears when the user has an avatar cursor active.
 * Shows on every page (mounted in layout). Lets them switch between
 * avatar cursor and default pointer.
 */
export default function CursorToggle() {
  // Lazy init: read localStorage once on first render (client-only, ssr:false).
  const [avatarId, setAvatarId] = useState<string | null>(loadCursorPref);

  // Apply the cursor on mount if a preference exists
  useEffect(() => {
    if (avatarId) initCursorFromStorage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for cursor change events dispatched by the lounge exit
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string | null>).detail;
      setAvatarId(id);
    };
    window.addEventListener("jrn-cursor", handler);
    return () => window.removeEventListener("jrn-cursor", handler);
  }, []);

  if (!avatarId) return null;

  const toggle = () => {
    const isActive = document.documentElement.style.cursor !== "";
    if (isActive) {
      clearAvatarCursor();
    } else {
      applyAvatarCursor(avatarId);
    }
  };

  const reset = () => {
    clearAvatarCursor();
    saveCursorPref(null);
    setAvatarId(null);
    window.dispatchEvent(new CustomEvent("jrn-cursor", { detail: null }));
  };

  return (
    <div className="fixed bottom-4 right-4 z-[2000] flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggle}
        title="Toggle avatar cursor / default pointer"
        className="w-10 h-10 rounded-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] backdrop-blur-md flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)] transition-all shadow-lg"
      >
        <Bot size={18} />
      </button>
      <button
        type="button"
        onClick={reset}
        title="Reset to default pointer permanently"
        className="w-8 h-8 rounded-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] backdrop-blur-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent-tertiary)] hover:border-[var(--color-accent-tertiary)] transition-all shadow-lg"
      >
        <MousePointer2 size={14} />
      </button>
    </div>
  );
}
