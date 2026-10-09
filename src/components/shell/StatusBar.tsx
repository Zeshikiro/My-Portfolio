"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { findTab } from "@/lib/tabs";

export default function StatusBar({ offset }: { offset: number }) {
  const tab = findTab(usePathname());

  return (
    <motion.footer
      initial={false}
      animate={{ left: offset }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="fixed bottom-0 right-0 z-20 h-7 flex items-center gap-4 px-4 font-mono text-[11px] text-[var(--color-text-muted)] bg-[var(--color-bg-surface)]/90 backdrop-blur-md border-t border-[var(--color-glass-border)]"
    >
      <span className="flex items-center gap-1.5">
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-[var(--color-accent-secondary)] animate-ping opacity-60" />
          <span className="relative w-2 h-2 rounded-full bg-[var(--color-accent-secondary)]" />
        </span>
        connected
      </span>
      <span className="hidden sm:inline">db: jrn_portfolio</span>
      <span>table: {tab.table}</span>
      <span className="ml-auto hidden sm:inline">v2.0</span>
    </motion.footer>
  );
}
