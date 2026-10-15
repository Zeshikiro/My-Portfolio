// Chat safety for the lounge: multilingual profanity/slur filter, link & personal-info
// blocking, and spam protection (cooldown, burst limit, duplicate detection, escalating mutes).
//
// Note: the lounge uses Supabase Broadcast (no server code), so every client runs these
// checks on what it SENDS and again on what it RECEIVES. A modified client can skip its
// own outgoing checks, but everyone else still filters and rate-limits what it sends.

/* ------------------------------------------------------------------ */
/* Word lists                                                          */
/* ------------------------------------------------------------------ */

// Blocked anywhere inside a word (low false-positive roots).
const CONTAINS = [
  // English
  "fuck", "fck", "motherf", "shit", "bitch", "cunt", "nigger", "nigga", "faggot", "whore",
  "asshole", "pussy", "dickhead", "bastard", "retard", "slut", "cocksuck", "jackass", "dipshit",
  "killyourself",
  // Filipino / Tagalog / Bisaya
  "putangina", "tangina", "kingina", "pakyu", "pakshet", "tarantado", "punyeta", "pokpok",
  "kantot", "jakol", "gagoka", "ulolka",
  // Spanish / Portuguese
  "hijodeputa", "hijueputa", "pendejo", "gilipollas", "filhodaputa", "caralho", "buceta",
  // Italian / French / German / Dutch / Polish
  "vaffancul", "cazzo", "puttana", "minchia", "coglion", "putain", "connard", "salope", "encule",
  "scheisse", "arschloch", "hurensohn", "wichser", "fotze", "klootzak", "godverdomme", "kurwa",
  "pierdol", "skurwysyn", "jebac", "jeban",
  // Indonesian / Malay
  "kontol", "memek", "ngentot", "bangsat", "pukimak", "bajingan", "goblok",
  // Hindi / Urdu (romanized)
  "madarchod", "behenchod", "bhenchod", "chutiya", "chutia", "bhosdi",
  // Turkish / Arabic (romanized) / Russian (translit)
  "orospu", "siktir", "sikerim", "yarrak", "sharmout", "sharmoot", "blyat", "blyad", "pizdec",
  "pizda", "yebat", "mudak",
  // Cyrillic
  "блять", "блядь", "сука", "пизд", "хуй", "ебан", "ёбан", "мудак", "пидор", "пидар",
];

// Blocked only when the whole word matches (too short / ambiguous to match inside words).
const EXACT = [
  "ass", "dick", "cock", "fag", "fags", "tits", "twat", "wanker", "nazi", "chink", "spic", "kike",
  "gook", "paki", "dyke", "tranny", "coon", "stfu", "gtfo", "wtf", "kys", "fuk", "бля", "bilat",
  // Filipino / Bisaya
  "puta", "putang", "gago", "bobo", "tanga", "ulol", "olol", "kupal", "yawa",
  "pisti", "buang", "titi", "burat", "oten", "otin", "iyot", "leche", "lintik", "bwisit",
  // Spanish / Portuguese / French / Italian / German / Dutch
  "cono", "mierda", "joder", "verga", "chinga", "chingada", "culero", "cabron", "maricon",
  "porra", "merda", "viado", "foda", "fodase", "merde", "batard", "fdp", "stronzo", "kut", "chuj",
  // Indonesian / Malay / Vietnamese / Hindi / Turkish / Arabic / Russian
  "anjing", "puki", "lancau", "dcm", "dmm", "vcl", "gandu", "lund", "harami", "amk",
  "khara", "khuy", "nahui",
];

// Scripts written without spaces (CJK, Thai, Arabic, Korean): matched as substrings.
const SCRIPT_TERMS = [
  // Chinese
  "操你", "草泥马", "傻逼", "煞笔", "妈的", "他妈", "肏", "屌", "婊子", "去死", "贱人", "王八蛋",
  // Japanese
  "死ね", "殺す", "ちんこ", "まんこ", "くたばれ", "きもい",
  // Korean
  "씨발", "시발", "병신", "개새끼", "좆", "미친놈", "니애미", "꺼져",
  // Thai
  "ควย", "เหี้ย", "สัส", "เย็ด", "หี", "ไอ้สัตว์",
  // Arabic
  "شرموطة", "منيوك", "كسمك", "كس امك", "زبي", "يلعن",
  // Hindi (Devanagari)
  "चूतिया", "मादरचोद", "भेनचोद", "भोसड़ी", "रंडी",
];

// Whole-message phrases (checked on the squashed, spaceless text).
const PHRASES = [
  "killyourself", "goandie", "neckyourself", "hangyourself",
  "tanginamo", "putanginamo", "gagoka", "fuckyou", "fuckoff", "sonofabitch",
];

/* ------------------------------------------------------------------ */
/* Normalisation                                                       */
/* ------------------------------------------------------------------ */

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "!": "i", "|": "i", "3": "e", "4": "a", "@": "a", "5": "s", "$": "s",
  "7": "t", "+": "t", "8": "b", "9": "g", "€": "e", "¢": "c",
};

const NON_LETTER = new RegExp("[^\\p{L}]", "gu");

/** Lowercase, strip accents, undo leetspeak and drop non-letters. */
function base(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[0-9!|@$+€¢]/g, (c) => LEET[c] ?? c)
    .replace(NON_LETTER, "");
}
const squash1 = (s: string) => s.replace(/(.)\1+/gu, "$1"); // fuuuck -> fuck
const squash2 = (s: string) => s.replace(/(.)\1{2,}/gu, "$1$1"); // asssss -> ass

type Key = { k: string; strict: boolean };
// Words with double letters ("ass", "kurwa" doesn't) compare against squash2 so "as" isn't flagged.
const keyOf = (w: string): Key => {
  const b = base(w);
  return squash1(b) === b ? { k: b, strict: false } : { k: squash2(b), strict: true };
};
const CONTAINS_KEYS = CONTAINS.map(keyOf);
const EXACT_KEYS = EXACT.map(keyOf);
const PHRASE_KEYS = PHRASES.map((p) => squash1(base(p)));

function tokenHit(token: string): boolean {
  const b = base(token);
  if (!b) return false;
  const s1 = squash1(b);
  const s2 = squash2(b);
  for (const { k, strict } of EXACT_KEYS) if ((strict ? s2 : s1) === k) return true;
  for (const { k, strict } of CONTAINS_KEYS) if ((strict ? s2 : s1).includes(k)) return true;
  return false;
}

const mask = (w: string) => (w.length <= 1 ? "*" : w[0] + "*".repeat(w.length - 1));

/* ------------------------------------------------------------------ */
/* Links & personal info                                               */
/* ------------------------------------------------------------------ */

const URL_RE =
  /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+(?:\.|\s?\(?dot\)?\s?)(?:com|net|org|io|gg|xyz|ru|ph|me|co|ly|tk|app|dev|site|link|info|biz|tv|to)\b(?:\/\S*)?/gi;
const EMAIL_RE = /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g;
const PHONE_RE = /(?:\+?\d[\s-]?){9,}/g;
const INVITE_RE = /\b(?:discord\.gg|t\.me|wa\.me|bit\.ly)\/\S+/gi;

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export type FilterResult = { text: string; flagged: boolean; removed: boolean };

/** Masks bad words (any language) and strips links / emails / phone numbers. */
export function filterText(input: string): FilterResult {
  let flagged = false;
  let removed = false;
  let text = input;

  // 1) Links and personal info.
  const strip = (re: RegExp, label: string) => {
    text = text.replace(re, () => {
      removed = true;
      return label;
    });
  };
  strip(INVITE_RE, "[link removed]");
  strip(EMAIL_RE, "[email removed]");
  strip(URL_RE, "[link removed]");
  strip(PHONE_RE, "[number removed]");

  // 2) Non-spaced scripts.
  for (const t of SCRIPT_TERMS) {
    if (text.includes(t)) {
      flagged = true;
      text = text.split(t).join("*".repeat([...t].length));
    }
  }

  // 3) Word by word (keeps the original spacing and punctuation).
  const parts = text.split(/(\s+)/);
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i] && tokenHit(parts[i])) {
      parts[i] = mask(parts[i]);
      flagged = true;
    }
  }

  // 4) Spaced-out evasion: "f u c k", "p.u.t.a" -> join runs of short tokens and re-check.
  let run: number[] = [];
  const flush = () => {
    if (run.length >= 3) {
      const joined = run.map((j) => parts[j]).join("");
      if (tokenHit(joined) || PHRASE_KEYS.includes(squash1(base(joined)))) {
        for (const j of run) parts[j] = "*";
        flagged = true;
      }
    }
    run = [];
  };
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i] && base(parts[i]).length <= 2 && base(parts[i]).length > 0) run.push(i);
    else flush();
  }
  flush();
  text = parts.join("");

  // 5) Whole-message phrases ("kill your self", "go and die"...).
  const squashed = squash1(base(text));
  if (PHRASE_KEYS.some((p) => squashed.includes(p))) {
    flagged = true;
    text = "*".repeat(Math.min(12, Math.max(4, text.length)));
  }

  return { text, flagged, removed };
}

/** Tidies spammy formatting: long repeated chars, shouting, emoji walls. */
export function tidy(text: string): string {
  let t = text.replace(/(.)\1{4,}/gu, "$1$1$1$1"); // heyyyyyyyy -> heyyyy
  const letters = t.replace(NON_LETTER, "");
  const upper = letters.replace(/[^A-Z]/g, "").length;
  if (letters.length >= 8 && upper / letters.length > 0.7) t = t.toLowerCase(); // NO SHOUTING
  const emoji = t.match(/\p{Extended_Pictographic}/gu) ?? [];
  if (emoji.length > 8) {
    let n = 0;
    t = t.replace(/\p{Extended_Pictographic}/gu, (m) => (++n <= 8 ? m : ""));
  }
  return t.trim();
}

/** Clean a display name. Returns "" if it's offensive (caller picks a guest name). */
export function cleanName(name: string): string {
  const r = filterText(name);
  return r.flagged || r.removed ? "" : r.text;
}

/* ------------------------------------------------------------------ */
/* Spam guard (outgoing, for this client)                              */
/* ------------------------------------------------------------------ */

const BURST_WINDOW = 15_000;
const BURST_MAX = 5;
const DUP_WINDOW = 30_000;
const STRIKE_WINDOW = 60_000;
const STRIKES_TO_MUTE = 3;
const MUTE_KEY = "jrn.lounge.mute";

export type SendCheck = { ok: true; text: string; warning?: string } | { ok: false; reason: string };

export class ChatGuard {
  private sent: { t: number; key: string }[] = [];
  private strikes: number[] = [];
  private mutedUntil = 0;
  private muteLevel = 0;

  constructor(private cooldownMs: number) {
    try {
      const saved = JSON.parse(localStorage.getItem(MUTE_KEY) ?? "null");
      if (saved && typeof saved.until === "number") {
        this.mutedUntil = saved.until;
        this.muteLevel = saved.level ?? 0;
      }
    } catch {
      /* ignore */
    }
  }

  mutedFor(now = Date.now()) {
    return Math.max(0, Math.ceil((this.mutedUntil - now) / 1000));
  }

  private strike(now: number): string | null {
    this.strikes = this.strikes.filter((t) => now - t < STRIKE_WINDOW);
    this.strikes.push(now);
    if (this.strikes.length >= STRIKES_TO_MUTE) {
      this.strikes = [];
      this.muteLevel = Math.min(this.muteLevel + 1, 5);
      const secs = 30 * 2 ** (this.muteLevel - 1); // 30s, 60s, 2m, 4m, 8m
      this.mutedUntil = now + secs * 1000;
      try {
        localStorage.setItem(MUTE_KEY, JSON.stringify({ until: this.mutedUntil, level: this.muteLevel }));
      } catch {
        /* ignore */
      }
      return `You've been muted for ${secs}s for spam or bad language.`;
    }
    return null;
  }

  check(raw: string, now = Date.now()): SendCheck {
    const muted = this.mutedFor(now);
    if (muted > 0) return { ok: false, reason: `You're muted. Try again in ${muted}s.` };

    const tidied = tidy(raw);
    if (!tidied) return { ok: false, reason: "" };

    const last = this.sent[this.sent.length - 1];
    if (last && now - last.t < this.cooldownMs) return { ok: false, reason: "Slow down a little…" };

    this.sent = this.sent.filter((m) => now - m.t < Math.max(BURST_WINDOW, DUP_WINDOW));
    if (this.sent.filter((m) => now - m.t < BURST_WINDOW).length >= BURST_MAX) {
      return { ok: false, reason: this.strike(now) ?? "Too many messages. Take a breather." };
    }

    const key = squash1(base(tidied)) || tidied;
    if (this.sent.some((m) => m.key === key && now - m.t < DUP_WINDOW)) {
      return { ok: false, reason: this.strike(now) ?? "You just said that." };
    }

    const f = filterText(tidied);
    if (!f.text.replace(/[*\s]/g, "")) return { ok: false, reason: this.strike(now) ?? "Let's keep it friendly." };

    this.sent.push({ t: now, key });
    let warning: string | undefined;
    if (f.flagged) warning = this.strike(now) ?? "Keep it friendly, please. Bad words get masked.";
    else if (f.removed) warning = "Links and contact info aren't allowed in the lounge.";
    return { ok: true, text: f.text, warning };
  }
}

/* ------------------------------------------------------------------ */
/* Incoming guard (per remote player, enforced by every client)        */
/* ------------------------------------------------------------------ */

export class RemoteGuard {
  private log = new Map<string, number[]>();
  private ignoredUntil = new Map<string, number>();

  /** Returns false if this player is flooding and their message should be dropped. */
  allow(id: string, now = Date.now()): boolean {
    if ((this.ignoredUntil.get(id) ?? 0) > now) return false;
    const times = (this.log.get(id) ?? []).filter((t) => now - t < BURST_WINDOW);
    times.push(now);
    this.log.set(id, times);
    if (times.length > BURST_MAX + 2) {
      this.ignoredUntil.set(id, now + 60_000); // auto-ignore flooders for a minute
      return false;
    }
    // Hard floor between messages, even if their client skips the cooldown.
    return times.length < 2 || times[times.length - 1] - times[times.length - 2] > 500;
  }

  isIgnored(id: string, now = Date.now()) {
    return (this.ignoredUntil.get(id) ?? 0) > now;
  }

  forget(id: string) {
    this.log.delete(id);
    this.ignoredUntil.delete(id);
  }
}
