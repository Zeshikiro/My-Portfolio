"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, User, MessageSquare, Send, MapPin } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate network request
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1500);
  };

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section id="contact" className="py-24 bg-[var(--color-bg-surface-light)]">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-accent-primary)] text-sm uppercase tracking-wider mb-4">
              <Mail size={16} />
              <span>Contact</span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="font-heading font-bold text-4xl md:text-5xl mb-4">
              Get in <span className="text-gradient-primary">Touch</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-[var(--color-text-secondary)]">
              Have a question or want to work together? Let&apos;s connect!
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <motion.div variants={itemVariants}>
              <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--color-bg-primary)] p-8 rounded-2xl border border-[var(--color-glass-border)] shadow-lg">
                <div className="relative">
                  <div className="absolute top-3.5 left-4 text-[var(--color-text-muted)]">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-glass-border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all"
                  />
                </div>
                <div className="relative">
                  <div className="absolute top-3.5 left-4 text-[var(--color-text-muted)]">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-glass-border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all"
                  />
                </div>
                <div className="relative">
                  <div className="absolute top-3.5 left-4 text-[var(--color-text-muted)]">
                    <MessageSquare size={20} />
                  </div>
                  <textarea
                    required
                    rows={5}
                    placeholder="Your Message"
                    className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-glass-border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className="w-full btn btn-primary py-4 rounded-xl flex items-center justify-center gap-2 bg-gradient-primary text-white font-medium hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 shadow-glow"
                >
                  {status === "idle" && (
                    <>
                      <Send size={18} />
                      <span>Send Message</span>
                    </>
                  )}
                  {status === "loading" && (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {status === "success" && (
                    <span>Message Sent!</span>
                  )}
                </button>
              </form>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col justify-center gap-8">
              <div>
                <h3 className="font-heading font-bold text-2xl mb-6">Contact Information</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8">
                  Whether you have a project idea, want to discuss technology, or just say hi, my inbox is always open. I&apos;ll try my best to get back to you!
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] flex items-center justify-center text-[var(--color-accent-primary)]">
                      <Mail size={20} />
                    </div>
                    <span>johnryannicolas43@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] flex items-center justify-center text-[var(--color-accent-primary)]">
                      <MapPin size={20} />
                    </div>
                    <span>Pampanga, Philippines</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-[var(--color-glass-border)]">
                <h4 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-6">Connect with me</h4>
                <div className="flex gap-4">
                  <a href="https://github.com/Zeshikiro" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white hover:-translate-y-1 hover:border-transparent transition-all shadow-lg">
                    <FaGithub size={20} />
                  </a>
                  <a href="https://www.linkedin.com/in/john-ryan-nicolas-21b058332/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white hover:-translate-y-1 hover:border-transparent transition-all shadow-lg">
                    <FaLinkedin size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
