"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, Pencil, Wifi, WifiOff, Loader2 } from "lucide-react";
import AvatarSprite from "./AvatarSprite";
import RoomDecor from "./RoomDecor";
import ChatPanel, { type SendResult } from "./ChatPanel";
import { getSupabase } from "@/lib/supabase";
import { useTheme, toggleTheme } from "@/lib/theme";
import { ChatGuard, RemoteGuard } from "@/lib/chatSafety";
import { ITEMS, FUN_FACTS, type Interactable } from "@/lib/loungeItems";
import { applyAvatarCursor, saveCursorPref } from "@/lib/avatarCursor";
import {
  AVATARS, BUBBLE_MS, CHANNEL, CHAT_COOLDOWN_MS, CHAT_MAX, EMOTES, EMOTE_COOLDOWN_MS,
  NAME_MAX, SEND_INTERVAL_MS, SPEED, TRACK_INTERVAL_MS, WORLD,
  clampX, clampY, cleanText, getAvatar, getSessionId, loadProfile, maskProfanity, randomGuestName, saveProfile,
  type ChatMsg, type Dir, type PlayerInfo, type PresenceMeta, type Profile,
} from "@/lib/lounge";

/** Spring-driven animation state (R.E.P.O.-style wobble). */
type Rig = {
  lean: number; leanV: number; // body tilt (deg)
  hr: number; hrV: number;     // head rotation (deg)
  hx: number; hxV: number;     // head offset (px)
  sq: number; sqV: number;     // squash/stretch
  bob: number; phase: number;  // step bounce
  lx: number; ly: number;      // pupil look
  lastNvx: number; lastNvy: number; still: number; wasMoving: boolean;
};

/** Simulation state for one avatar. Lives in a ref so movement never re-renders React. */
type Sim = { x: number; y: number; tx: number; ty: number; dir: Dir; moving: boolean; sitting: boolean; el: HTMLDivElement | null; rig: Rig };
type Bubble = { text: string; key: string };
type Status = "offline" | "connecting" | "live" | "error";
/** Queued item interaction: walk to spot, then fire the action. */
type PendingInteraction = { item: Interactable; arrived: boolean };

const SPAWN = { x: 500, y: 560 };
const MAX_MESSAGES = 100;
const STEP_CYCLE = 0.3; // seconds per left+right step, matches av-stomp in CSS
let keySeq = 0;
const nextKey = (p: string) => `${p}-${Date.now()}-${keySeq++}`;

const newRig = (): Rig => ({
  lean: 0, leanV: 0, hr: 0, hrV: 0, hx: 0, hxV: 0, sq: 1, sqV: 0, bob: 0, phase: 0, lx: 0, ly: 0,
  lastNvx: 0, lastNvy: 0, still: 1, wasMoving: false,
});

/** Random fun-fact index, cycling without repeats in a short window. */
let lastFacts: number[] = [];
function nextFunFact(): string {
  const pool = FUN_FACTS.map((_, i) => i).filter((i) => !lastFacts.includes(i));
  const idx = pool[Math.floor(Math.random() * pool.length)] ?? 0;
  lastFacts.push(idx);
  if (lastFacts.length > Math.floor(FUN_FACTS.length * 0.6)) lastFacts = lastFacts.slice(-2);
  return FUN_FACTS[idx];
}

/** Damped spring step. Returns [position, velocity]. */
function spring(x: number, v: number, target: number, k: number, c: number, dt: number): [number, number] {
  const nv = v + (k * (target - x) - c * v) * dt;
  return [x + nv * dt, nv];
}

/** Advances the rig. vx/vy are the avatar's current velocity in world units/s. */
function animateRig(s: Sim, vx: number, vy: number, dt: number) {
  const r = s.rig;
  // Debounce stops: remote avatars can pause for a frame or two between network
  // updates, which shouldn't count as "stopped" (no twitchy start/stop wobble).
  r.still = s.moving ? 0 : r.still + dt;
  const walking = s.moving || r.still < 0.12;
  const nvx = s.moving ? Math.max(-1, Math.min(1, vx / SPEED)) : walking ? r.lastNvx : 0;
  const nvy = s.moving ? Math.max(-1, Math.min(1, vy / SPEED)) : walking ? r.lastNvy : 0;

  // Start/stop impulses: squash, and the head flops (lags on start, overshoots on stop).
  if (walking !== r.wasMoving) {
    if (walking) {
      r.sqV -= 2.2;
      r.hrV -= nvx * 140;
    } else {
      r.sqV -= 3.2;
      r.hrV += r.lastNvx * 220;
      r.leanV += r.lastNvx * 90;
    }
    r.wasMoving = walking;
  }
  if (s.moving) {
    r.lastNvx = nvx;
    r.lastNvy = nvy;
  }
  r.phase = walking ? r.phase + (dt * Math.PI * 2) / STEP_CYCLE : 0;

  const waddle = walking ? Math.sin(r.phase) * 6 : 0;
  [r.lean, r.leanV] = spring(r.lean, r.leanV, nvx * 9 + waddle, 180, 16, dt);
  [r.hr, r.hrV] = spring(r.hr, r.hrV, -nvx * 10 - waddle * 0.4, 110, 6.5, dt); // low damping = wobbly
  [r.hx, r.hxV] = spring(r.hx, r.hxV, -nvx * 2, 120, 10, dt);
  [r.sq, r.sqV] = spring(r.sq, r.sqV, 1, 420, 13, dt);
  r.sq = Math.max(0.78, Math.min(1.22, r.sq));

  const bobTarget = walking ? -Math.abs(Math.sin(r.phase)) * 2.4 : 0;
  r.bob += (bobTarget - r.bob) * Math.min(1, dt * (walking ? 30 : 10));

  const e = Math.min(1, dt * 10);
  r.lx += ((walking ? nvx : s.dir === "right" ? 0.45 : -0.45) * 1.7 - r.lx) * e;
  r.ly += ((walking ? nvy : 0) * 1.2 - r.ly) * e;
}

function paint(s: Sim) {
  const el = s.el;
  if (!el) return;
  el.style.left = `${(s.x / WORLD.w) * 100}%`;
  el.style.top = `${(s.y / WORLD.h) * 100}%`;
  el.style.zIndex = String(Math.round(s.y));
  const moving = String(s.moving);
  if (el.dataset.moving !== moving) el.dataset.moving = moving;
  if (el.dataset.dir !== s.dir) el.dataset.dir = s.dir;
  const sit = String(s.sitting);
  if (el.dataset.sit !== sit) el.dataset.sit = sit;
  const r = s.rig;
  const st = el.style;
  st.setProperty("--lean", `${r.lean.toFixed(2)}deg`);
  st.setProperty("--hr", `${r.hr.toFixed(2)}deg`);
  st.setProperty("--hx", `${r.hx.toFixed(2)}px`);
  st.setProperty("--sq", r.sq.toFixed(3));
  st.setProperty("--bob", `${r.bob.toFixed(2)}px`);
  st.setProperty("--lx", `${r.lx.toFixed(2)}px`);
  st.setProperty("--ly", `${r.ly.toFixed(2)}px`);
}

export default function Lounge() {
  // This component is client-only (loaded with ssr: false), so browser storage is safe here.
  const router = useRouter();
  const [selfId] = useState(getSessionId);
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState<Status>("connecting");
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [bubbles, setBubbles] = useState<Record<string, Bubble>>({});
  const [emotes, setEmotes] = useState<Record<string, Bubble>>({});

  const theme = useTheme();
  const day = theme === "light";
  const [mutedPlayers, setMutedPlayers] = useState<Set<string>>(new Set());
  const mutedRef = useRef(mutedPlayers);
  const [clockHands, setClockHands] = useState(() => {
    const d = new Date();
    const m = d.getMinutes();
    const h = (d.getHours() % 12) + m / 60;
    return { hourDeg: h * 30, minDeg: m * 6 };
  });
  const [roomFx, setRoomFx] = useState<Record<string, number>>({});
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const chatGuard = useRef<ChatGuard | null>(null);
  if (chatGuard.current == null) {
    chatGuard.current = new ChatGuard(CHAT_COOLDOWN_MS);
  }
  const remoteGuard = useRef<RemoteGuard | null>(null);
  if (remoteGuard.current == null) {
    remoteGuard.current = new RemoteGuard();
  }
  const pendingInteraction = useRef<PendingInteraction | null>(null);

  const toggleMute = useCallback((id: string) => {
    setMutedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      mutedRef.current = next;
      return next;
    });
  }, []);

  // Update clock every 10 seconds
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const m = d.getMinutes();
      const h = (d.getHours() % 12) + m / 60;
      setClockHands({ hourDeg: h * 30, minDeg: m * 6 });
    };
    const t = setInterval(updateTime, 10000);
    return () => clearInterval(t);
  }, []);

  const sims = useRef(new Map<string, Sim>());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const liveRef = useRef(false);
  const roomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keys = useRef({ up: false, down: false, left: false, right: false });
  const lastEmote = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);

  const pushMessage = useCallback((m: ChatMsg) => {
    setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), m]);
  }, []);

  const addSystem = useCallback(
    (text: string) => pushMessage({ key: nextKey("sys"), kind: "system", text, ts: Date.now() }),
    [pushMessage],
  );

  const showBubble = useCallback(
    (id: string, text: string) => {
      const key = nextKey("b");
      setBubbles((prev) => ({ ...prev, [id]: { text, key } }));
      later(() => setBubbles((prev) => (prev[id]?.key === key ? omit(prev, id) : prev)), BUBBLE_MS);
    },
    [later],
  );

  const showEmote = useCallback(
    (id: string, text: string) => {
      const key = nextKey("e");
      setEmotes((prev) => ({ ...prev, [id]: { text, key } }));
      later(() => setEmotes((prev) => (prev[id]?.key === key ? omit(prev, id) : prev)), 1700);
    },
    [later],
  );

  const ensureSim = useCallback((id: string, x: number, y: number, dir: Dir) => {
    let s = sims.current.get(id);
    if (!s) {
      s = { x, y, tx: x, ty: y, dir, moving: false, sitting: false, el: null, rig: newRig() };
      sims.current.set(id, s);
    }
    return s;
  }, []);

  const register = useCallback((id: string, el: HTMLDivElement | null) => {
    const s = sims.current.get(id);
    if (!s) return;
    s.el = el;
    paint(s);
  }, []);

  const send = useCallback((event: string, payload: Record<string, unknown>) => {
    if (liveRef.current) channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  /** Run the action when the avatar arrives at an item's spot. */
  const executeAction = useCallback(
    (item: Interactable) => {
      const me = sims.current.get(selfId);
      const now = Date.now();

      switch (item.action) {
        case "clock":
          toggleTheme();
          addSystem("Theme toggled.");
          break;
        case "window":
          addSystem(day ? "☀️ A sunny day outside." : "🌙 City lights glitter in the night.");
          break;
        case "neon":
          setRoomFx((prev) => ({ ...prev, neon: now }));
          if (item.shared) send("fx", { id: selfId, item: item.id });
          break;
        case "poster":
          showBubble(selfId, nextFunFact());
          pushMessage({ key: nextKey("sys"), kind: "system", text: `📋 ${FUN_FACTS[0]}`, ts: now });
          break;
        case "server":
          setRoomFx((prev) => ({ ...prev, server: now }));
          addSystem("⚡ SELECT * FROM server_rack; — 6 rows returned.");
          if (item.shared) send("fx", { id: selfId, item: item.id });
          break;
        case "plant":
          setRoomFx((prev) => ({ ...prev, [item.id]: now }));
          addSystem("💧 You watered the plant.");
          if (item.shared) send("fx", { id: selfId, item: item.id });
          break;
        case "coffee":
          setRoomFx((prev) => ({ ...prev, coffee: now }));
          showEmote(selfId, "☕");
          if (item.shared) send("fx", { id: selfId, item: item.id });
          break;
        case "sit":
          if (me) me.sitting = !me.sitting;
          break;
        case "exit":
          setShowExitPrompt(true);
          break;
      }
    },
    [selfId, day, addSystem, pushMessage, showBubble, showEmote, send],
  );

  /** Called when a hotspot is clicked. Sets the avatar's target to the spot,
   *  queues the action for when it arrives. */
  const onItemClick = useCallback(
    (item: Interactable) => {
      const me = sims.current.get(selfId);
      if (!me) return;
      // Stand up if sitting
      if (me.sitting) me.sitting = false;
      me.tx = clampX(item.spot.x);
      me.ty = clampY(item.spot.y);
      pendingInteraction.current = { item, arrived: false };
    },
    [selfId],
  );

  /** Exit prompt actions */
  const handleExit = useCallback(
    (keepCursor: boolean) => {
      setShowExitPrompt(false);
      if (keepCursor) {
        applyAvatarCursor(profile.avatar);
        saveCursorPref(profile.avatar);
        window.dispatchEvent(new CustomEvent("jrn-cursor", { detail: profile.avatar }));
      }
      router.push("/");
    },
    [profile.avatar, router],
  );

  // ---------- Connection (Presence + Broadcast) ----------
  useEffect(() => {
    if (!joined) return;
    const simMap = sims.current;
    const me = ensureSim(selfId, SPAWN.x + Math.round(Math.random() * 120 - 60), SPAWN.y, "right");

    const sb = getSupabase();
    if (!sb) {
      return () => {
        simMap.clear();
        setPlayers([]);
      };
    }

    const ch = sb.channel(CHANNEL, { config: { presence: { key: selfId }, broadcast: { self: false } } });
    channelRef.current = ch;
    const names = new Map<string, string>();
    const lastRemoteChat = new Map<string, number>();
    let subscribedAt = 0;
    const settled = () => subscribedAt > 0 && Date.now() - subscribedAt > 1500;

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<PresenceMeta>();
      const list: PlayerInfo[] = [];
      const seen = new Set<string>();
      for (const [id, metas] of Object.entries(state)) {
        const m = metas[metas.length - 1];
        if (!m) continue;
        const name = cleanText(m.name, NAME_MAX) || "guest";
        list.push({ id, name: maskProfanity(name), avatar: getAvatar(m.avatar).id });
        names.set(id, maskProfanity(name));
        seen.add(id);
        if (id !== selfId) ensureSim(id, clampX(m.x), clampY(m.y), m.dir === "left" ? "left" : "right");
      }
      for (const id of [...simMap.keys()]) if (id !== selfId && !seen.has(id)) simMap.delete(id);
      if (!seen.has(selfId)) list.push({ id: selfId, ...profile });
      list.sort((a, b) => (a.id === selfId ? -1 : b.id === selfId ? 1 : a.name.localeCompare(b.name)));
      setPlayers(list);
    });

    ch.on("presence", { event: "join" }, ({ key, currentPresences, newPresences }) => {
      if (key === selfId || currentPresences.length > 0 || !settled()) return;
      const name = cleanText((newPresences[0] as unknown as PresenceMeta)?.name, NAME_MAX) || "someone";
      addSystem(`${maskProfanity(name)} joined the lounge`);
    });

    ch.on("presence", { event: "leave" }, ({ key, currentPresences, leftPresences }) => {
      if (key === selfId || currentPresences.length > 0) return;
      const name = names.get(key) ?? (cleanText((leftPresences[0] as unknown as PresenceMeta)?.name, NAME_MAX) || "someone");
      addSystem(`${name} left`);
    });

    ch.on("broadcast", { event: "move" }, ({ payload }) => {
      const id = typeof payload?.id === "string" ? payload.id : "";
      if (!id || id === selfId) return;
      const s = ensureSim(id, clampX(payload.x), clampY(payload.y), "right");
      const x = clampX(payload.x);
      const y = clampY(payload.y);
      // Snap if we drifted too far (lag, tab was hidden, etc).
      if (Math.hypot(s.x - x, s.y - y) > 120) {
        s.x = x;
        s.y = y;
      }
      s.tx = clampX(payload.tx);
      s.ty = clampY(payload.ty);
    });

    ch.on("broadcast", { event: "chat" }, ({ payload }) => {
      const id = typeof payload?.id === "string" ? payload.id : "";
      if (!id || id === selfId) return;
      // Remote rate-limit + mute check
      if (!remoteGuard.current!.allow(id)) return;
      if (mutedRef.current.has(id)) return;
      const now = Date.now();
      if (now - (lastRemoteChat.get(id) ?? 0) < CHAT_COOLDOWN_MS * 0.5) return;
      lastRemoteChat.set(id, now);
      const text = maskProfanity(cleanText(payload.text, CHAT_MAX));
      if (!text) return;
      const name = names.get(id) ?? (maskProfanity(cleanText(payload.name, NAME_MAX)) || "guest");
      pushMessage({ key: nextKey("m"), kind: "chat", id, name, text, ts: now });
      showBubble(id, text);
    });

    ch.on("broadcast", { event: "emote" }, ({ payload }) => {
      const id = typeof payload?.id === "string" ? payload.id : "";
      if (!id || id === selfId || !(EMOTES as readonly string[]).includes(payload.e)) return;
      showEmote(id, payload.e);
    });

    // Shared room effects from other players
    ch.on("broadcast", { event: "fx" }, ({ payload }) => {
      const id = typeof payload?.id === "string" ? payload.id : "";
      const itemId = typeof payload?.item === "string" ? payload.item : "";
      if (!id || id === selfId || !itemId) return;
      setRoomFx((prev) => ({ ...prev, [itemId]: Date.now() }));
    });

    ch.subscribe(async (st) => {
      if (st === "SUBSCRIBED") {
        subscribedAt = Date.now();
        liveRef.current = true;
        setStatus("live");
        await ch.track({ name: profile.name, avatar: profile.avatar, x: me.x, y: me.y, dir: me.dir } satisfies PresenceMeta);
      } else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") {
        liveRef.current = false;
        setStatus("error");
      }
    });

    return () => {
      liveRef.current = false;
      channelRef.current = null;
      ch.untrack();
      sb.removeChannel(ch);
      simMap.clear();
      setPlayers([]);
      setBubbles({});
      setEmotes({});
    };
  }, [joined, profile, selfId, ensureSim, addSystem, pushMessage, showBubble, showEmote]);

  // ---------- Game loop ----------
  useEffect(() => {
    if (!joined) return;
    let raf = 0;
    let last = performance.now();
    let lastSend = 0;
    let lastTrack = 0;
    let wasMoving = false;
    let needTrack = false;

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const me = sims.current.get(selfId);

      // Keyboard input keeps the target a little ahead of the player.
      if (me) {
        const k = keys.current;
        const kx = Number(k.right) - Number(k.left);
        const ky = Number(k.down) - Number(k.up);
        if (kx || ky) {
          const len = Math.hypot(kx, ky);
          me.tx = clampX(me.x + (kx / len) * 30);
          me.ty = clampY(me.y + (ky / len) * 30);
          // Cancel pending interaction if moving via keyboard
          pendingInteraction.current = null;
          if (me.sitting) me.sitting = false;
        }
      }

      for (const [id, s] of sims.current) {
        const dx = s.tx - s.x;
        const dy = s.ty - s.y;
        const d = Math.hypot(dx, dy);
        let vx = 0;
        let vy = 0;
        if (d < 1) {
          s.x = s.tx;
          s.y = s.ty;
          s.moving = false;
        } else {
          // Remote players walk slightly faster so they catch up after network delay.
          const speed = id === selfId ? SPEED : SPEED * 1.15;
          const step = Math.min(d, speed * dt);
          s.x += (dx / d) * step;
          s.y += (dy / d) * step;
          s.moving = true;
          vx = (dx / d) * speed;
          vy = (dy / d) * speed;
          if (Math.abs(dx) > 0.5) s.dir = dx < 0 ? "left" : "right";
        }
        animateRig(s, vx, vy, dt);
        paint(s);
      }

      // Check if our avatar has arrived at a pending interaction spot.
      if (me && !me.moving && pendingInteraction.current && !pendingInteraction.current.arrived) {
        pendingInteraction.current.arrived = true;
        const pi = pendingInteraction.current;
        pendingInteraction.current = null;
        executeAction(pi.item);
      }

      // Networking for our own avatar.
      if (me) {
        const now = Date.now();
        if (me.moving && now - lastSend >= SEND_INTERVAL_MS) {
          lastSend = now;
          send("move", { id: selfId, x: me.x, y: me.y, tx: me.tx, ty: me.ty, dir: me.dir });
        }
        if (wasMoving && !me.moving) {
          send("move", { id: selfId, x: me.x, y: me.y, tx: me.x, ty: me.y, dir: me.dir });
          needTrack = true;
        }
        wasMoving = me.moving;
        if (needTrack && liveRef.current && now - lastTrack >= TRACK_INTERVAL_MS) {
          needTrack = false;
          lastTrack = now;
          channelRef.current?.track({ name: profile.name, avatar: profile.avatar, x: me.x, y: me.y, dir: me.dir });
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [joined, profile, selfId, send, executeAction]);

  // ---------- Actions ----------
  const sendChat = useCallback(
    (raw: string): SendResult => {
      if (!profile || !chatGuard.current) return { ok: false, message: "" };
      const check = chatGuard.current.check(raw);
      if (!check.ok) {
        return { ok: false, message: check.reason };
      }
      const now = Date.now();
      pushMessage({ key: nextKey("m"), kind: "chat", id: selfId, name: profile.name, text: check.text, ts: now });
      showBubble(selfId, check.text);
      send("chat", { id: selfId, name: profile.name, text: check.text });
      return { ok: true, message: check.warning };
    },
    [profile, selfId, pushMessage, showBubble, send],
  );

  const sendEmote = useCallback(
    (e: string) => {
      const now = Date.now();
      if (now - lastEmote.current < EMOTE_COOLDOWN_MS) return;
      lastEmote.current = now;
      showEmote(selfId, e);
      send("emote", { id: selfId, e });
    },
    [selfId, showEmote, send],
  );

  // Keyboard: WASD/arrows to walk, Enter to chat, Esc to leave the chat box, 1-6 for emotes.
  useEffect(() => {
    if (!joined) return;
    const map: Record<string, keyof typeof keys.current> = {
      ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
      ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
    };
    const typing = (el: EventTarget | null) =>
      el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

    const down = (e: KeyboardEvent) => {
      if (typing(e.target)) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      const dir = map[e.code];
      if (dir) {
        e.preventDefault();
        keys.current[dir] = true;
      } else if (e.key === "Enter") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (/^Digit[1-6]$/.test(e.code)) {
        sendEmote(EMOTES[Number(e.code.slice(5)) - 1]);
      }
    };
    const up = (e: KeyboardEvent) => {
      const dir = map[e.code];
      if (!dir) return;
      keys.current[dir] = false;
      const k = keys.current;
      if (!k.up && !k.down && !k.left && !k.right) {
        const me = sims.current.get(selfId);
        if (me) {
          me.tx = me.x;
          me.ty = me.y;
        }
      }
    };
    const reset = () => (keys.current = { up: false, down: false, left: false, right: false });
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
    };
  }, [joined, selfId, sendEmote]);

  const onRoomPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joined) return;
    const me = sims.current.get(selfId);
    const rect = roomRef.current?.getBoundingClientRect();
    if (!me || !rect) return;
    me.tx = clampX(((e.clientX - rect.left) / rect.width) * WORLD.w);
    me.ty = clampY(((e.clientY - rect.top) / rect.height) * WORLD.h);
    // Cancel pending interactions and stand up on free-click
    pendingInteraction.current = null;
    if (me.sitting) me.sitting = false;
    inputRef.current?.blur();
  };

  const join = (p: Profile) => {
    saveProfile(p);
    setProfile(p);
    // Create our sim before the avatar mounts so its ref can paint it right away.
    ensureSim(selfId, SPAWN.x + Math.round(Math.random() * 120 - 60), SPAWN.y, "right");
    setPlayers([{ id: selfId, ...p }]);
    if (getSupabase()) {
      setStatus("connecting");
    } else {
      setStatus("offline");
      addSystem("Offline preview: real-time isn't set up yet, so it's just you in here.");
    }
    setJoined(true);
  };

  return (
    <section className="pt-6 pb-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="font-heading font-bold text-3xl md:text-4xl">
            The <span className="text-gradient-primary">Lounge</span>
          </h1>
          {joined && <StatusPill status={status} count={players.length} />}
          {joined && (
            <button
              type="button"
              onClick={() => setJoined(false)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] transition-colors"
            >
              <Pencil size={12} /> Edit avatar
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
          <div>
            <div
              ref={roomRef}
              onPointerDown={onRoomPointer}
              className="@container relative w-full aspect-[1000/625] rounded-2xl overflow-hidden border border-[var(--color-glass-border)] bg-[#14121b] select-none touch-none cursor-pointer"
            >
              <RoomDecor
                day={day}
                fx={roomFx}
                hourDeg={clockHands.hourDeg}
                minDeg={clockHands.minDeg}
              />
              {players.map((p) => (
                <PlayerAvatar
                  key={p.id}
                  player={p}
                  isSelf={p.id === selfId}
                  bubble={bubbles[p.id]}
                  emote={emotes[p.id]}
                  register={register}
                />
              ))}
              {/* Interactable hotspots */}
              {joined && ITEMS.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-label={item.label}
                  onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onItemClick(item); } }}
                  className="lounge-hotspot absolute cursor-pointer z-[950] pointer-events-auto"
                  style={{
                    left: `${(item.hit.x / WORLD.w) * 100}%`,
                    top: `${(item.hit.y / WORLD.h) * 100}%`,
                    width: `${(item.hit.w / WORLD.w) * 100}%`,
                    height: `${(item.hit.h / WORLD.h) * 100}%`,
                  }}
                >
                  <span className="lounge-tip absolute bottom-full left-1/2 mb-1 px-2 py-0.5 rounded-md bg-black/80 text-white text-[clamp(7px,1cqw,11px)] whitespace-nowrap font-mono pointer-events-none">
                    {item.hint}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {EMOTES.map((e, i) => (
                <button
                  key={e}
                  type="button"
                  disabled={!joined}
                  onClick={() => sendEmote(e)}
                  title={`Emote (${i + 1})`}
                  className="w-9 h-9 rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] hover:border-[var(--color-accent-primary)] hover:-translate-y-0.5 transition-all disabled:opacity-40"
                >
                  {e}
                </button>
              ))}
              <p className="ml-auto font-mono text-[11px] text-[var(--color-text-muted)]">
                click / WASD to walk · Enter to chat · 1-6 emotes
              </p>
            </div>
          </div>

          <ChatPanel
            messages={messages}
            players={players}
            selfId={selfId}
            inputRef={inputRef}
            onSend={sendChat}
            muted={mutedPlayers}
            onToggleMute={toggleMute}
          />
        </div>
      </div>

      <AnimatePresence>
        {!joined && <JoinModal initial={profile} onJoin={join} />}
      </AnimatePresence>

      {/* Exit door prompt */}
      <AnimatePresence>
        {showExitPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 10, scale: 0.98 }}
              className="w-full max-w-sm rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] p-6 shadow-2xl text-center"
            >
              <div className="text-3xl mb-3">🚪</div>
              <h3 className="font-heading font-bold text-lg mb-2">Leaving the lounge?</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-5">
                Want to take your robot avatar with you as a cursor?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleExit(true)}
                  className="w-full rounded-xl bg-gradient-primary text-white font-medium py-2.5 hover:brightness-110 transition"
                >
                  🤖 Keep avatar as cursor
                </button>
                <button
                  type="button"
                  onClick={() => handleExit(false)}
                  className="w-full rounded-xl border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] font-medium py-2.5 hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] transition-colors"
                >
                  Use normal pointer
                </button>
                <button
                  type="button"
                  onClick={() => setShowExitPrompt(false)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] mt-1"
                >
                  Stay in the lounge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function omit<T>(obj: Record<string, T>, key: string) {
  const next = { ...obj };
  delete next[key];
  return next;
}

const PlayerAvatar = memo(function PlayerAvatar({
  player, isSelf, bubble, emote, register,
}: {
  player: PlayerInfo;
  isSelf: boolean;
  bubble?: Bubble;
  emote?: Bubble;
  register: (id: string, el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={(el) => {
        register(player.id, el);
      }}
      className="lounge-avatar absolute pointer-events-none"
      style={{ width: "5.6%", transform: "translate(-50%, -100%)" }}
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble.key}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-[min(200px,38cqw)] px-2.5 py-1.5 rounded-xl rounded-bl-sm bg-white text-[#1a1a2e] text-[clamp(9px,1.25cqw,13px)] leading-snug break-words shadow-lg"
          >
            {bubble.text}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {emote && (
          <motion.span
            key={emote.key}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -28, scale: 1.2 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="absolute bottom-[85%] left-1/2 -translate-x-1/2 text-[clamp(14px,2.6cqw,28px)]"
          >
            {emote.text}
          </motion.span>
        )}
      </AnimatePresence>
      <AvatarSprite avatar={player.avatar} className="block w-full h-auto" />
      <span
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-0.5 whitespace-nowrap px-1.5 rounded font-mono text-[clamp(7px,1.05cqw,11px)] bg-black/55 ${
          isSelf ? "text-[var(--color-accent-secondary)]" : "text-[#e8e8e8]"
        }`}
      >
        {isSelf ? `▸ ${player.name}` : player.name}
      </span>
    </div>
  );
});

function StatusPill({ status, count }: { status: Status; count: number }) {
  const cfg = {
    live: { icon: <Wifi size={12} />, text: `live · ${count} online`, cls: "text-[var(--color-accent-secondary)] border-[var(--color-accent-secondary)]/40" },
    connecting: { icon: <Loader2 size={12} className="animate-spin" />, text: "connecting…", cls: "text-[var(--color-text-secondary)] border-[var(--color-glass-border)]" },
    offline: { icon: <WifiOff size={12} />, text: "offline preview", cls: "text-[#f5b942] border-[#f5b942]/40" },
    error: { icon: <WifiOff size={12} />, text: "connection lost", cls: "text-[var(--color-accent-tertiary)] border-[var(--color-accent-tertiary)]/40" },
  }[status];
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[11px] ${cfg.cls}`}>
      {cfg.icon} {cfg.text}
    </span>
  );
}

function JoinModal({ initial, onJoin }: { initial: Profile; onJoin: (p: Profile) => void }) {
  const [name, setName] = useState(initial.name);
  const [avatar, setAvatar] = useState(initial.avatar);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoin({ name: maskProfanity(cleanText(name, NAME_MAX)) || randomGuestName(), avatar });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <motion.form
        onSubmit={submit}
        initial={{ y: 20, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 10, scale: 0.98 }}
        className="w-full max-w-md rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)] p-6 shadow-2xl"
      >
        <p className="font-mono text-xs text-[var(--color-accent-primary)] mb-1">INSERT INTO lounge (name, avatar)</p>
        <h2 className="font-heading font-bold text-2xl mb-5">Pick your look</h2>

        <div className="flex justify-center mb-4">
          <div className="lounge-avatar w-20" data-dir="right" data-moving="false">
            <AvatarSprite avatar={avatar} className="block w-full h-auto" />
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2 mb-5">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAvatar(a.id)}
              title={a.label}
              aria-pressed={avatar === a.id}
              className={`aspect-square rounded-xl border-2 p-1 transition-all ${
                avatar === a.id
                  ? "border-[var(--color-accent-primary)] bg-[var(--color-bg-surface-hover)] scale-105"
                  : "border-transparent hover:bg-[var(--color-bg-surface-hover)]"
              }`}
            >
              <AvatarSprite avatar={a.id} className="block w-full h-full" />
            </button>
          ))}
        </div>

        <label className="block font-mono text-xs text-[var(--color-text-secondary)] mb-1.5" htmlFor="lounge-name">
          display name
        </label>
        <input
          id="lounge-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={NAME_MAX}
          autoComplete="off"
          className="w-full mb-5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-glass-border)] focus:border-[var(--color-accent-primary)] outline-none px-3 py-2.5 text-sm"
        />

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-white font-medium py-3 hover:brightness-110 transition"
        >
          <LogIn size={16} /> Enter the lounge
        </button>
        <p className="mt-3 text-center text-[11px] text-[var(--color-text-muted)]">
          Be nice. Chat isn&apos;t saved and disappears when everyone leaves.
        </p>
      </motion.form>
    </motion.div>
  );
}

