// Shared config, types and helpers for the multiplayer lounge (/play).

/** Logical room size. Everything is stored in these units and rendered as percentages. */
export const WORLD = { w: 1000, h: 625, wall: 190 } as const;

/** Where avatars' feet are allowed to go (the floor). */
export const BOUNDS = { minX: 40, maxX: 960, minY: 215, maxY: 605 } as const;

export const SPEED = 230; // world units per second
export const SEND_INTERVAL_MS = 110; // movement broadcast rate while walking
export const TRACK_INTERVAL_MS = 1000; // max presence update rate
export const CHAT_MAX = 140;
export const NAME_MAX = 16;
export const CHAT_COOLDOWN_MS = 1200;
export const EMOTE_COOLDOWN_MS = 600;
export const BUBBLE_MS = 5000;
export const CHANNEL = "lounge:main";

export type Dir = "left" | "right";
export type Hat = "none" | "cap" | "beanie" | "headphones" | "bow" | "crown";

export type AvatarStyle = {
  id: string;
  label: string;
  body: string;
  shade: string;
  hair: string;
  hat: Hat;
  hatColor: string;
};

export const AVATARS: AvatarStyle[] = [
  { id: "violet", label: "Violet", body: "#6c63ff", shade: "#4b44c9", hair: "#2b2140", hat: "headphones", hatColor: "#00d4aa" },
  { id: "mint", label: "Mint", body: "#00d4aa", shade: "#00a184", hair: "#1f1a17", hat: "cap", hatColor: "#6c63ff" },
  { id: "rose", label: "Rose", body: "#ff6b9d", shade: "#d94a7b", hair: "#5a2a1e", hat: "bow", hatColor: "#ffd166" },
  { id: "sun", label: "Sunny", body: "#f5b942", shade: "#c98f1f", hair: "#3b2a1a", hat: "beanie", hatColor: "#ff6b9d" },
  { id: "sky", label: "Sky", body: "#4cc9f0", shade: "#2a9ec4", hair: "#141420", hat: "none", hatColor: "#4cc9f0" },
  { id: "ember", label: "Ember", body: "#ff7a45", shade: "#d1572a", hair: "#2a1a12", hat: "crown", hatColor: "#ffd166" },
];

export const EMOTES = ["👋", "😂", "❤️", "🔥", "👍", "🎉"] as const;

export type Profile = { name: string; avatar: string };

export type PlayerInfo = { id: string; name: string; avatar: string };

/** What each client publishes through Supabase Presence. */
export type PresenceMeta = { name: string; avatar: string; x: number; y: number; dir: Dir };

export type ChatMsg = {
  key: string;
  kind: "chat" | "system";
  id?: string;
  name?: string;
  text: string;
  ts: number;
};

export function getAvatar(id: string | undefined): AvatarStyle {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

export function randomGuestName(): string {
  return `guest_${Math.floor(1000 + Math.random() * 9000)}`;
}

export const clampX = (x: unknown) => clampNum(x, BOUNDS.minX, BOUNDS.maxX);
export const clampY = (y: unknown) => clampNum(y, BOUNDS.minY, BOUNDS.maxY);

function clampNum(v: unknown, min: number, max: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : (min + max) / 2;
  return Math.min(max, Math.max(min, n));
}

/** Strips control characters, collapses whitespace and caps the length. */
export function cleanText(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// Word stems to mask (English + common Tagalog). Matched at the start of a
// word, so "fucking" is caught but "computation" isn't caught by "puta".
const BLOCKED = [
  "fuck", "shit", "bullshit", "bitch", "asshole", "cunt", "dick", "pussy", "nigg", "fag",
  "slut", "whore", "retard", "puta", "tangina", "tang ina", "gago", "gaga", "bobo",
  "ulol", "pakyu", "kupal", "tarantado", "leche", "punyeta", "hayop ka", "pokpok",
];
const BLOCKED_RE = new RegExp(`\\b(${BLOCKED.map((w) => w.replace(/ /g, "\\s*")).join("|")})\\w*`, "gi");

export function maskProfanity(text: string): string {
  return text.replace(BLOCKED_RE, (m) => m[0] + "*".repeat(Math.max(1, m.length - 1)));
}

/** Per-tab id, so two tabs show up as two avatars. */
export function getSessionId(): string {
  const KEY = "jrn.lounge.id";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

const PROFILE_KEY = "jrn.lounge.profile";

export function loadProfile(): Profile {
  try {
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null");
    if (p && typeof p.name === "string" && typeof p.avatar === "string") {
      return { name: cleanText(p.name, NAME_MAX) || randomGuestName(), avatar: getAvatar(p.avatar).id };
    }
  } catch {
    /* ignore corrupted storage */
  }
  return { name: randomGuestName(), avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)].id };
}

export function saveProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}
