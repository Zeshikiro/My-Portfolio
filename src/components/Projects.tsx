"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Folder, Star, UserPlus, Globe, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export default function Projects() {
  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section id="projects" className="py-24">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-accent-primary)] text-sm uppercase tracking-wider mb-4">
              <Folder size={16} />
              <span>Projects</span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="font-heading font-bold text-4xl md:text-5xl">
              Featured <span className="text-gradient-primary">Work</span>
            </motion.h2>
          </div>

          {/* Featured Project */}
          <motion.div
            variants={itemVariants}
            className="relative bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-[var(--radius-xl)] overflow-hidden p-8 md:p-12 mb-12 shadow-lg"
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-accent-primary)]/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="absolute top-6 right-6 bg-[var(--color-accent-primary)] text-white text-sm font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5 z-10">
              <Star size={14} fill="currentColor" />
              <span>Capstone Project</span>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-3xl md:text-4xl text-gradient-primary mb-2">STEP-UP</h3>
                  <p className="text-[var(--color-text-secondary)] text-lg">
                    An Augmented Reality Mobile Application for Promoting Physical Activity Among University Students
                  </p>
                </div>
                
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  A gamified step tracker unlike any other — STEP-UP uses{" "}
                  <strong className="text-[var(--color-text-primary)] font-medium">Augmented Reality</strong> with an embedded avatar for a 
                  more entertaining and engaging approach to daily physical activities. 
                  Designed to motivate university students to stay active through 
                  interactive gameplay and real-time tracking.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {["Augmented Reality", "Mobile App", "Gamification", "Step Tracking"].map((tag) => (
                    <span key={tag} className="px-3.5 py-1.5 rounded-full bg-[var(--color-bg-surface-hover)] border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[var(--color-accent-primary)] font-medium pt-2">
                  <UserPlus size={18} />
                  <span>Lead Developer</span>
                </div>
              </div>

              <div className="flex-1 w-full flex justify-center items-center">
                <div className="w-[240px] h-[480px] bg-[var(--color-bg-surface)] border-4 border-[var(--color-border)] rounded-[40px] relative overflow-hidden shadow-2xl flex flex-col group">
                  {/* Image */}
                  <Image
                    src="/Photos/step-up.png"
                    alt="STEP-UP App Start Screen"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay for realism */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Other Projects */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Project 1 */}
            <motion.div variants={itemVariants} className="bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-2xl p-8 hover:-translate-y-2 hover:border-[var(--color-accent-primary)] hover:shadow-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 flex items-center justify-center text-[var(--color-accent-primary)]">
                  <Globe size={36} strokeWidth={1.5} />
                </div>
                <a href="https://step-up-actual.vercel.app/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-bg-surface-hover)] flex items-center justify-center hover:bg-[var(--color-accent-primary)] hover:text-white transition-colors text-[var(--color-text-secondary)]">
                  <ExternalLink size={18} />
                </a>
              </div>
              <h4 className="font-heading font-bold text-xl mb-3">Project Website</h4>
              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                Built project websites to showcase skills and experiment with web 
                technologies, focusing on modern design principles and responsive layouts.
              </p>
              <div className="flex flex-wrap gap-2">
                {["HTML", "CSS", "Web Design"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-[var(--color-bg-surface-hover)] border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Project 2 */}
            <motion.div variants={itemVariants} className="bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-2xl p-8 hover:-translate-y-2 hover:border-[var(--color-accent-primary)] hover:shadow-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 flex items-center justify-center text-[var(--color-accent-primary)]">
                  <FaGithub size={36} />
                </div>
                <a href="https://github.com/Zeshikiro" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-bg-surface-hover)] flex items-center justify-center hover:bg-[var(--color-accent-primary)] hover:text-white transition-colors text-[var(--color-text-secondary)]">
                  <ExternalLink size={18} />
                </a>
              </div>
              <h4 className="font-heading font-bold text-xl mb-3">GitHub Portfolio</h4>
              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                Actively contributing to projects and maintaining repositories on GitHub. 
                Exploring open source and version control workflows.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Git", "Open Source", "Collaboration"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-[var(--color-bg-surface-hover)] border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
