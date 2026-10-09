"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Download, X } from "lucide-react";
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { TABS, LIVE_TABS, type Tab } from "@/lib/tabs";

export const SIDEBAR_WIDTH = 260;

const SOCIALS = [
  { icon: FaGithub, href: "https://github.com/Zeshikiro", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/john-ryan-nicolas-21b058332/", label: "LinkedIn" },
  { icon: FaFacebook, href: "https://www.facebook.com/johnryan.nicolas.3/", label: "Facebook" },
  { icon: FaInstagram, href: "https://www.instagram.com/zeshikiro/", label: "Instagram" },
  { icon: FaTiktok, href: "https://www.tiktok.com/@zeshikiro", label: "TikTok" },
];

// Items cascade in one after another when the sidebar opens.
const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
  exit: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 380, damping: 30 } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.12 } },
};

type SidebarProps = {
  onNavigate: () => void;
  onClose: () => void;
};

export default function Sidebar({ onNavigate, onClose }: SidebarProps) {
  const pathname = usePathname();

  const renderItem = (tab: Tab, shortcut: number) => {
    const active = pathname === tab.href;
    const Icon = tab.icon;
    return (
      <motion.li key={tab.href} variants={itemVariants}>
        <Link
          href={tab.href}
          onClick={onNavigate}
          className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            active
              ? "text-[var(--color-text-primary)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)]"
          }`}
        >
          {active && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-lg bg-[var(--color-accent-primary)]/12 border border-[var(--color-accent-primary)]/30"
              transition={{ type: "spring", stiffness: 400, damping: 34 }}
            />
          )}
          {active && (
            <motion.span
              layoutId="sidebar-active-bar"
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-primary"
              transition={{ type: "spring", stiffness: 400, damping: 34 }}
            />
          )}
          <Icon
            size={18}
            className={`relative z-10 shrink-0 ${
              active ? "text-[var(--color-accent-primary)]" : "group-hover:text-[var(--color-accent-primary)] transition-colors"
            }`}
          />
          <span className="relative z-10 flex-1">{tab.label}</span>
          {tab.badge ? (
            <span className="relative z-10 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-accent-tertiary)]/15 text-[var(--color-accent-tertiary)]">
              {tab.badge}
            </span>
          ) : (
            <kbd className="relative z-10 hidden lg:inline text-[10px] font-mono text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
              {shortcut}
            </kbd>
          )}
        </Link>
      </motion.li>
    );
  };

  return (
    <motion.aside
      key="sidebar"
      initial={{ x: -SIDEBAR_WIDTH }}
      animate={{ x: 0 }}
      exit={{ x: -SIDEBAR_WIDTH }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      style={{ width: SIDEBAR_WIDTH }}
      className="fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-[var(--color-bg-surface)]/95 backdrop-blur-md border-r border-[var(--color-glass-border)]"
    >
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col h-full"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between px-5 h-16 border-b border-[var(--color-glass-border)]">
          <Link href="/" onClick={onNavigate} className="flex flex-col leading-none">
            <span className="font-heading font-bold text-2xl tracking-tighter">
              JRN<span className="text-[var(--color-accent-primary)]">.</span>
            </span>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)] mt-1">jrn_portfolio</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-surface-hover)] transition-colors"
          >
            <X size={18} />
          </button>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <motion.p variants={itemVariants} className="px-3 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Explore
          </motion.p>
          <ul className="space-y-1">{TABS.map((tab, i) => renderItem(tab, i + 1))}</ul>

          <motion.p variants={itemVariants} className="px-3 mt-6 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Live
          </motion.p>
          <ul className="space-y-1">{LIVE_TABS.map((tab, i) => renderItem(tab, TABS.length + i + 1))}</ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--color-glass-border)] space-y-4">
          <motion.a
            variants={itemVariants}
            href="/Jrn_Resume-9-21-2026.pdf"
            download
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium border border-[var(--color-accent-secondary)]/60 text-[var(--color-accent-secondary)] hover:bg-[var(--color-accent-secondary)] hover:text-white transition-colors"
          >
            <Download size={16} />
            Download Resume
          </motion.a>
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-accent-primary)] transition-colors"
              >
                <s.icon size={15} />
              </a>
            ))}
          </motion.div>
          <motion.p variants={itemVariants} className="text-[10px] text-center text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} John Ryan Nicolas
          </motion.p>
        </div>
      </motion.div>
    </motion.aside>
  );
}
