import {
  Home,
  Wrench,
  FolderOpen,
  GraduationCap,
  Award,
  Camera,
  Mail,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

export type Tab = {
  href: string;
  label: string;
  /** Short name used by the terminal (`cd skills`) and the status bar. */
  table: string;
  /** Decorative query shown at the top of the tab. */
  query: string;
  icon: LucideIcon;
  badge?: string;
};

export const TABS: Tab[] = [
  {
    href: "/",
    label: "Home",
    table: "home",
    query: "SELECT * FROM developer WHERE id = 1;",
    icon: Home,
  },
  {
    href: "/skills",
    label: "Skills",
    table: "skills",
    query: "SELECT * FROM skills ORDER BY level DESC;",
    icon: Wrench,
  },
  {
    href: "/projects",
    label: "Projects",
    table: "projects",
    query: "SELECT * FROM projects JOIN roles USING (project_id);",
    icon: FolderOpen,
  },
  {
    href: "/education",
    label: "Education",
    table: "education",
    query: "SELECT * FROM education ORDER BY year DESC;",
    icon: GraduationCap,
  },
  {
    href: "/certifications",
    label: "Certifications",
    table: "certifications",
    query: "SELECT * FROM certifications ORDER BY issued DESC;",
    icon: Award,
  },
  {
    href: "/gallery",
    label: "Gallery",
    table: "gallery",
    query: "SELECT * FROM gallery ORDER BY taken_at DESC;",
    icon: Camera,
  },
  {
    href: "/contact",
    label: "Contact",
    table: "contact",
    query: "INSERT INTO messages (name, email, body) VALUES (...);",
    icon: Mail,
  },
];

export const LIVE_TABS: Tab[] = [
  {
    href: "/play",
    label: "Lounge",
    table: "lounge",
    query: "LISTEN lounge;",
    icon: Gamepad2,
    badge: "soon",
  },
];

export const ALL_TABS: Tab[] = [...TABS, ...LIVE_TABS];

export function findTab(pathname: string): Tab {
  return ALL_TABS.find((t) => t.href === pathname) ?? TABS[0];
}

export function findTabByName(name: string): Tab | undefined {
  const n = name.trim().toLowerCase();
  return ALL_TABS.find(
    (t) => t.table === n || t.label.toLowerCase() === n || t.href === `/${n}`
  );
}
