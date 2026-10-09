"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import { Hash, Send, Users } from "lucide-react";
import { CHAT_MAX, getAvatar, type ChatMsg, type PlayerInfo } from "@/lib/lounge";

type Props = {
  messages: ChatMsg[];
  players: PlayerInfo[];
  selfId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  /** Returns false when the message was rejected (empty or on cooldown). */
  onSend: (text: string) => boolean;
};

const time = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatPanel({ messages, players, selfId, inputRef, onSend }: Props) {
  const [text, setText] = useState("");
  const [slowDown, setSlowDown] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (onSend(text)) {
      setText("");
    } else {
      setSlowDown(true);
      setTimeout(() => setSlowDown(false), 1200);
    }
  };

  return (
    // On desktop the inner panel is absolutely positioned so it matches the room's
    // height instead of growing with the message list.
    <div className="relative h-[380px] lg:h-auto">
      <div className="absolute inset-0 flex flex-col rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 h-11 border-b border-[var(--color-glass-border)] font-mono text-xs">
          <Hash size={14} className="text-[var(--color-accent-primary)]" />
          <span className="text-[var(--color-text-primary)]">lounge-chat</span>
          <button
            type="button"
            onClick={() => setShowPeople((v) => !v)}
            className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-hover)] transition-colors"
            aria-expanded={showPeople}
          >
            <Users size={13} /> {players.length} here
          </button>
        </div>

        {/* Who's online */}
        {showPeople && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="border-b border-[var(--color-glass-border)] px-4 py-2 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto"
          >
            {players.map((p) => (
              <span
                key={p.id}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--color-bg-surface-hover)] text-[11px] font-mono"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: getAvatar(p.avatar).body }} />
                {p.name}
                {p.id === selfId && <span className="text-[var(--color-text-muted)]">(you)</span>}
              </span>
            ))}
          </motion.div>
        )}

        {/* Messages */}
        <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2 text-sm">
          {messages.length === 0 && (
            <p className="text-center text-xs text-[var(--color-text-muted)] font-mono mt-6 leading-relaxed">
              No messages yet. Say hi!
              <br />
              Chat isn&apos;t saved; it disappears when you leave.
            </p>
          )}
          {messages.map((m) =>
            m.kind === "system" ? (
              <p key={m.key} className="text-center font-mono text-[11px] text-[var(--color-text-muted)]">
                {m.text}
              </p>
            ) : (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="leading-snug break-words"
              >
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] mr-1.5">{time(m.ts)}</span>
                <span className="font-semibold mr-1.5" style={{ color: getAvatar(players.find((p) => p.id === m.id)?.avatar).body }}>
                  {m.id === selfId ? "you" : m.name}
                </span>
                <span className="text-[var(--color-text-primary)]">{m.text}</span>
              </motion.div>
            )
          )}
        </div>

        {/* Input */}
        <form onSubmit={submit} className="p-3 border-t border-[var(--color-glass-border)]">
          <motion.div
            animate={slowDown ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-glass-border)] focus-within:border-[var(--color-accent-primary)] transition-colors pl-3 pr-1.5"
          >
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={CHAT_MAX}
              placeholder="Press Enter to chat…"
              aria-label="Chat message"
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent py-2.5 text-sm outline-none placeholder:text-[var(--color-text-muted)]"
            />
            {text.length > CHAT_MAX - 40 && (
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{CHAT_MAX - text.length}</span>
            )}
            <button
              type="submit"
              aria-label="Send"
              className="w-8 h-8 rounded-lg bg-gradient-primary text-white flex items-center justify-center disabled:opacity-40"
              disabled={!text.trim()}
            >
              <Send size={14} />
            </button>
          </motion.div>
          <p className="h-4 mt-1 font-mono text-[10px] text-[var(--color-accent-tertiary)]">
            {slowDown ? "Slow down a little…" : ""}
          </p>
        </form>
      </div>
    </div>
  );
}
