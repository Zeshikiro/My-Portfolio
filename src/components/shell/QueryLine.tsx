"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

const SEEN_KEY = "jrn.seenQueries";

function markSeen(query: string): boolean {
  try {
    const seen: string[] = JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]");
    if (seen.includes(query)) return true;
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, query]));
  } catch {
    // sessionStorage unavailable (private mode etc.) — just animate every time.
  }
  return false;
}

/**
 * The small "query" line at the top of each tab. Types itself out the first
 * time a tab is opened in a session, then shows instantly on repeat visits.
 */
export default function QueryLine({ query }: { query: string }) {
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [ms, setMs] = useState<string | null>(null);

  useEffect(() => {
    const finish = () => {
      setTyped(query);
      setDone(true);
      setMs((Math.random() * 0.03 + 0.004).toFixed(3));
    };

    if (reduceMotion || markSeen(query)) {
      finish();
      return;
    }

    const step = Math.max(8, Math.min(22, 650 / query.length));
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(query.slice(0, i));
      if (i >= query.length) {
        window.clearInterval(id);
        window.setTimeout(finish, 180);
      }
    }, step);
    return () => window.clearInterval(id);
  }, [query, reduceMotion]);

  return (
    <div className="container mx-auto px-6 max-w-6xl pt-6">
      <div className="font-mono text-xs sm:text-[13px] leading-relaxed">
        <div className="flex flex-wrap gap-x-2">
          <span className="text-[var(--color-accent-secondary)]">jrn@portfolio:~$</span>
          <span className="text-[var(--color-text-secondary)] break-all">
            {typed}
            {!done && <span className="inline-block w-[7px] h-[1em] -mb-[2px] ml-px bg-[var(--color-accent-primary)] animate-pulse" />}
          </span>
        </div>
        <div className="h-5">
          {done && ms && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-[var(--color-text-muted)]"
            >
              <Check size={12} className="text-[var(--color-accent-secondary)]" />
              query OK · {ms}s
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
