"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Code2, Folder, Mail } from "lucide-react";
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";

const TITLES = [
  "IT Student",
  "Tech Explorer"
];

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentTitle = TITLES[titleIndex];
      
      if (!isDeleting) {
        setText(currentTitle.substring(0, text.length + 1));
        if (text === currentTitle) {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setText(currentTitle.substring(0, text.length - 1));
        if (text === "") {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % TITLES.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, titleIndex]);

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Glow Effects */}
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[var(--color-accent-primary)]/15 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-[var(--color-accent-tertiary)]/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 text-center max-w-3xl px-6"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-sm mb-8">
          <Code2 size={16} className="text-[var(--color-accent-primary)]" />
          <span>IT Student &amp; Developer</span>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h1 className="font-heading font-bold text-5xl md:text-7xl leading-tight mb-4">
            John Ryan<br />
            <span className="text-gradient-primary">Nicolas</span>
          </h1>
        </motion.div>

        <motion.div variants={itemVariants} className="text-xl md:text-2xl text-[var(--color-text-secondary)] min-h-[2.5rem] mb-6">
          <span>{text}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="text-[var(--color-accent-primary)]"
          >
            |
          </motion.span>
        </motion.div>

        <motion.p variants={itemVariants} className="text-[var(--color-text-muted)] italic tracking-wide mb-10">
          &ldquo;Head in the clouds. Grounded in data.&rdquo;
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a href="#projects" className="btn btn-primary w-full sm:w-auto px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 bg-gradient-primary text-white shadow-glow hover:scale-105 transition-transform duration-300 font-medium">
            <Folder size={18} />
            <span>View Projects</span>
          </a>
          <a href="#contact" className="btn btn-outline w-full sm:w-auto px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 border-2 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white transition-all duration-300 font-medium">
            <Mail size={18} />
            <span>Contact Me</span>
          </a>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-6">
          {[
            { icon: FaGithub, href: "https://github.com/Zeshikiro", label: "GitHub" },
            { icon: FaLinkedin, href: "https://www.linkedin.com/in/john-ryan-nicolas-21b058332/", label: "LinkedIn" },
            { icon: FaFacebook, href: "https://www.facebook.com/johnryan.nicolas.3/", label: "Facebook" },
            { icon: FaInstagram, href: "https://www.instagram.com/zeshikiro/", label: "Instagram" },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white hover:scale-110 hover:border-transparent transition-all duration-300"
            >
              <social.icon size={20} />
            </a>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
