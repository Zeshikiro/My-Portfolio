"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, Pencil, Wifi, WifiOff, Loader2 } from "lucide-react";
import AvatarSprite from "./AvatarSprite";
import RoomDecor from "./RoomDecor";
import ChatPanel from "./ChatPanel";
import { getSupabase } from "@/lib/supabase";
import {
  AVATARS, BUBBLE_MS, CHANNEL, CHAT_COOLDOWN_MS, CHAT_MAX, EMOTES, EMOTE_COOLDOWN_MS,
  NAME_MAX, SEND_INTERVAL_MS, SPEED, TRACK_INTERVAL_MS, WORLD,
  clampX, clampY, cleanText, getAvatar, getSessionId, loadProfile, maskProfanity, randomGuestName, saveProfile,
  type ChatMsg, type Dir, type PlayerInfo, type PresenceMeta, type Profile,
} from "@/lib/lounge";

/** Simulation state for one avatar. Lives in a ref so movement never re-renders React. */
type Sim = { x: number; y: number; tx: number; ty: number; dir: Dir; moving: boolean; el: HTMLDivElement | null };
type Bubble = { text: string; key: string };
type Status = "offline" | "connecting" | "live" | "error";

const SPAWN = { x: 500, y: 560 };
const MAX_MESSAGES = 100;
let keySeq = 0;
const nextKey = (p: string) => `${p}-${Date.now()}-${keySeq++}`;

function paint(s: Sim) {
  const el = s.el;
  if (!el) return;
  el.style.left = `${(s.x / WORLD.w) * 100}%`;
  el.style.top = `${(s.y / WORLD.h) * 100}%`;
  el.style.zIndex = String(Math.round(s.y));
  const moving = String(s.moving);
  if (el.dataset.moving !== moving) el.dataset.moving = moving;
  if (el.dataset.dir !== s.dir) el.dataset.dir = s.dir;
}

export default function Lounge() {
  // This component is client-only (loaded with ssr: false), so browser storage is safe here.
  const [selfId] = useState(getSessionId);
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState<Status>("connecting");
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [bubbles, setBubbles] = useState<Record<string, Bubble>>({});
  const [emotes, setEmotes] = useState<Record<string, Bubble>>({});

  const sims = useRef(new Map<string, Sim>());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const liveRef = useRef(false);
  const roomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keys = useRef({ up: false, down: false, left: false, right: false });
  const lastChat = useRef(0);
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
      s = { x, y, tx: x, ty: y, dir, moving: false, el: null };
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
        }
      }

      for (const [id, s] of sims.current) {
        const dx = s.tx - s.x;
        const dy = s.ty - s.y;
        const d = Math.hypot(dx, dy);
        if (d < 1) {
          s.x = s.tx;
          s.y = s.ty;
          s.moving = false;
        } else {
          // Remote players walk slightly faster so they catch up after network delay.
          const step = Math.min(d, (id === selfId ? SPEED : SPEED * 1.15) * dt);
          s.x += (dx / d) * step;
          s.y += (dy / d) * step;
          s.moving = true;
          if (Math.abs(dx) > 0.5) s.dir = dx < 0 ? "left" : "right";
        }
        paint(s);
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
  }, [joined, profile, selfId, send]);

  // ---------- Actions ----------
  const sendChat = useCallback(
    (raw: string) => {
      const text = maskProfanity(cleanText(raw, CHAT_MAX));
      if (!text || !profile) return false;
      const now = Date.now();
      if (now - lastChat.current < CHAT_COOLDOWN_MS) return false;
      lastChat.current = now;
      pushMessage({ key: nextKey("m"), kind: "chat", id: selfId, name: profile.name, text, ts: now });
      showBubble(selfId, text);
      send("chat", { id: selfId, name: profile.name, text });
      return true;
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
              <RoomDecor />
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

          <ChatPanel messages={messages} players={players} selfId={selfId} inputRef={inputRef} onSend={sendChat} />
        </div>
      </div>

      <AnimatePresence>
        {!joined && <JoinModal initial={profile} onJoin={join} />}
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

