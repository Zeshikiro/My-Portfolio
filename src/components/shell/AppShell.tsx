"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import StatusBar from "./StatusBar";
import { ALL_TABS, findTab } from "@/lib/tabs";

const STORAGE_KEY = "jrn.sidebarOpen";
const DESKTOP_QUERY = "(min-width: 1024px)";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const tab = findTab(pathname);

  // `null` until mounted, so the server render and first client render match.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setDesktopOpen(saved === "1");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const open = isDesktop === null ? false : isDesktop ? desktopOpen : mobileOpen;

  const toggle = useCallback(() => {
    if (isDesktop) {
      setDesktopOpen((prev) => {
        localStorage.setItem(STORAGE_KEY, prev ? "0" : "1");
        return !prev;
      });
    } else {
      setMobileOpen((prev) => !prev);
    }
  }, [isDesktop]);

  const close = useCallback(() => {
    if (isDesktop) {
      setDesktopOpen(false);
      localStorage.setItem(STORAGE_KEY, "0");
    } else {
      setMobileOpen(false);
    }
  }, [isDesktop]);

  // On mobile the menu closes after picking a tab; on desktop it stays as the user left it.
  const handleNavigate = useCallback(() => {
    if (!isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  // Keyboard shortcuts: 1–8 jump to tabs, "m" toggles the menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;

      if (e.key.toLowerCase() === "m") {
        toggle();
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= ALL_TABS.length) {
        router.push(ALL_TABS[n - 1].href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, toggle]);

  // Lock page scroll behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = !isDesktop && mobileOpen ? "hidden" : "";
  }, [isDesktop, mobileOpen]);

  const offset = isDesktop && desktopOpen ? SIDEBAR_WIDTH : 0;

  return (
    <>
      <AnimatePresence>
        {open && <Sidebar onNavigate={handleNavigate} onClose={close} />}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && !isDesktop && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ paddingLeft: offset }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="flex flex-col min-h-screen"
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 md:px-6 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--color-glass-border)]">
          <AnimatePresence initial={false}>
            {!open && (
              <motion.button
                key="hamburger"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={toggle}
                aria-label="Open menu"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)] transition-colors"
              >
                <Menu size={22} />
              </motion.button>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2 font-mono text-sm min-w-0">
            <span className="text-[var(--color-text-muted)] hidden sm:inline">jrn_portfolio</span>
            <span className="text-[var(--color-text-muted)] hidden sm:inline">/</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={tab.table}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="text-[var(--color-text-primary)] truncate"
              >
                {tab.label.toLowerCase()}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="ml-auto hidden md:inline font-mono text-[11px] text-[var(--color-text-muted)]">
            press <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-glass-border)]">M</kbd> for menu
          </span>
        </header>

        <main className="flex-1 pb-10">{children}</main>
      </motion.div>

      <StatusBar offset={offset} />
    </>
  );
}
