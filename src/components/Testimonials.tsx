"use client";

import { motion } from "framer-motion";
import { Quote, MessageSquare } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  relationship: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "John Ryan is one of the most honest and dedicated brother I've encountered in our ministry. His maturity in thinking goes beyond his age, and his commitment to serving faithfully is something that truly inspires everyone around him.",
    name: "Church Brother",
    role: "Lifeguide Leader / Cell Group Leader",
    relationship: "Church Ministry",
  },
  {
    quote:
      "John Ryan was an outstanding leader in ROTC — a quick and critical thinker who always stayed composed under pressure. He was nominated to become the Battalion Commander of the cadets if we had made it to 1st Class Officer. That says everything about his leadership.",
    name: "ROTC Colleague",
    role: "Fellow Cadet, Advanced ROTC",
    relationship: "ROTC Mate",
  },
  {
    quote:
      "Among all the groups from different colleges, John Ryan stood out the most. His confidence, clear voice, and attitude during the IT Marketing presentation were outstanding. His communication and delivery were on another level — truly impressive for a student.",
    name: "Faculty Guide",
    role: "BSIT Department, PSAU",
    relationship: "IRCITE Faculty Guide",
  },
];

export default function Testimonials() {
  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section id="testimonials" className="py-24 bg-[var(--color-bg-surface)]">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-accent-primary)] text-sm uppercase tracking-wider mb-4"
            >
              <MessageSquare size={16} />
              <span>Testimonials</span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="font-heading font-bold text-4xl md:text-5xl"
            >
              What People{" "}
              <span className="text-gradient-primary">Say</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative bg-[var(--color-bg-primary)] border border-[var(--color-glass-border)] rounded-2xl p-8 hover:border-[var(--color-accent-primary)] hover:-translate-y-2 hover:shadow-glow transition-all duration-300"
              >
                {/* Quote icon */}
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-primary)]/15 flex items-center justify-center mb-6">
                  <Quote
                    size={18}
                    className="text-[var(--color-accent-primary)]"
                  />
                </div>

                {/* Quote text */}
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Attribution */}
                <div className="border-t border-[var(--color-glass-border)] pt-5">
                  <p className="font-heading font-bold text-[var(--color-text-primary)]">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {testimonial.role}
                  </p>
                  <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] font-medium">
                    {testimonial.relationship}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
