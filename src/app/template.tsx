"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import QueryLine from "@/components/shell/QueryLine";
import { findTab } from "@/lib/tabs";

// Remounts on every tab change (see Next.js `template.js` docs), so each tab
// gets its own enter animation and query line.
export default function Template({ children }: { children: React.ReactNode }) {
  const tab = findTab(usePathname());

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <QueryLine query={tab.query} />
      {children}
    </motion.div>
  );
}
