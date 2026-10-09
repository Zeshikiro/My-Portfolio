import type { Metadata } from "next";
import { Gamepad2, MessageCircle, Users, Footprints } from "lucide-react";

export const metadata: Metadata = { title: "Lounge" };

const FEATURES = [
  { icon: Users, title: "See who's here", desc: "Everyone browsing the portfolio shows up live in the same room." },
  { icon: Footprints, title: "Walk around", desc: "Pick an avatar and move it around the lounge, with walking animations." },
  { icon: MessageCircle, title: "Chat", desc: "Say hi. Messages pop up as speech bubbles above your avatar." },
];

// Placeholder until the real-time lounge (Phase 3) is built.
export default function PlayPage() {
  return (
    <section className="pt-6 pb-16">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center text-white shadow-glow">
          <Gamepad2 size={30} />
        </div>
        <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">
          The <span className="text-gradient-primary">Lounge</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto mb-12">
          A shared space where visitors can hang out, walk around as an avatar and chat with each other in real time.
          It&apos;s being built right now.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 text-left">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-2xl p-6"
            >
              <f.icon size={22} className="text-[var(--color-accent-primary)] mb-3" />
              <h2 className="font-heading font-bold mb-1">{f.title}</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
