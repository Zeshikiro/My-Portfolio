"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { Terminal as TerminalIcon, X } from "lucide-react";

const COMMANDS: Record<string, string> = {
  help: `Available commands:
 - <span class="text-[var(--color-accent-primary)]">whoami</span>: About me
 - <span class="text-[var(--color-accent-primary)]">skills</span>: My tech stack
 - <span class="text-[var(--color-accent-primary)]">projects</span>: View projects
 - <span class="text-[var(--color-accent-primary)]">contact</span>: Get email
 - <span class="text-[var(--color-accent-primary)]">socials</span>: View social links
 - <span class="text-[var(--color-accent-primary)]">clear</span>: Clear terminal`,
  whoami: `John Ryan Nicolas
IT Student & Developer
Lead Developer of STEP-UP AR App.`,
  skills:
    "Core Competencies: MySQL, Ubuntu Linux, CLI, Prompt Engineering, AI-Assisted Dev, Git.",
  projects: `Featured:
 - STEP-UP (AR Step Tracker)
 - Project Website
 - GitHub Open Source`,
  contact: "Email: johnryannicolas43@gmail.com",
  socials: `GitHub: github.com/Zeshikiro
LinkedIn: linkedin.com/in/john-ryan-nicolas-21b058332`,
};

type Line = { id: number; html: string };

export default function Terminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    { id: 0, html: "Welcome to JRN OS v1.0.0" },
    {
      id: 1,
      html: `Type <span class="text-[var(--color-accent-primary)]">'help'</span> to see available commands.`,
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const addLine = (html: string) => {
    setLines((prev) => [...prev, { id: nextId.current++, html }]);
  };

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const cmd = input.trim().toLowerCase();
    setInput("");

    // Echo the prompt
    addLine(
      `<span class="text-[var(--color-accent-secondary)]">guest@jrn-portfolio:~$</span> ${cmd}`
    );

    if (!cmd) return;

    if (cmd === "clear") {
      setLines([]);
      return;
    }

    const response = COMMANDS[cmd];
    if (response) {
      addLine(response);
    } else {
      addLine(
        `Command not found: ${cmd}. Type <span class="text-[var(--color-accent-primary)]">'help'</span> for available commands.`
      );
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow hover:scale-110 transition-transform"
        aria-label="Open Terminal"
      >
        <TerminalIcon size={22} />
      </button>

      {/* Terminal overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-glass-border)]"
            >
              {/* Title bar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-bg-surface-hover)] border-b border-[var(--color-glass-border)]">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
                  />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="flex-1 text-center text-xs text-[var(--color-text-muted)] font-mono">
                  guest@jrn-portfolio:~
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Terminal body */}
              <div
                ref={bodyRef}
                onClick={() => inputRef.current?.focus()}
                className="bg-[var(--color-bg-primary)] h-[400px] overflow-y-auto p-5 font-mono text-sm leading-relaxed cursor-text"
              >
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="text-[var(--color-text-secondary)] mb-1 whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: line.html }}
                  />
                ))}

                {/* Input line */}
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-accent-secondary)] whitespace-nowrap">
                    guest@jrn-portfolio:~$
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    className="flex-1 bg-transparent text-[var(--color-text-primary)] outline-none caret-[var(--color-accent-primary)] font-mono text-sm"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
