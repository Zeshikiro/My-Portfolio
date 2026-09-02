"use client";

import { motion } from "framer-motion";
import { User, Rocket, Users, Code, FolderOpen } from "lucide-react";

export default function About() {
  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section id="about" className="py-24">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-accent-primary)] text-sm uppercase tracking-wider mb-4">
              <User size={16} />
              <span>About Me</span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="font-heading font-bold text-4xl md:text-5xl">
              Get to Know <span className="text-gradient-primary">Me</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <motion.div variants={itemVariants} className="space-y-6 text-[var(--color-text-secondary)] text-lg leading-relaxed">
              <p>
                Hi there! I&apos;m <strong className="text-[var(--color-text-primary)] text-[var(--color-accent-primary)] font-medium">John Ryan Nicolas</strong>, an IT student at{" "}
                <strong className="text-[var(--color-text-primary)] font-medium">Pampanga State Agricultural University</strong> with a passion for
                building meaningful digital experiences. I served as the{" "}
                <strong className="text-[var(--color-text-primary)] font-medium">Lead Developer</strong> of STEP-UP — an Augmented Reality mobile
                application designed to promote physical activity among university students.
              </p>
              <p>
                My journey in tech started with HTML &amp; CSS, and I&apos;m continuously
                expanding my skillset into Python, Java, databases, and Linux systems.
                I believe in learning by doing — every project is an opportunity to grow
                and every bug is a lesson in disguise.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Rocket, number: 1, label: "Capstone Project" },
                { icon: Users, number: 1, label: "Lead Developer Role" },
                { icon: Code, number: 12, label: "Technologies" },
                { icon: FolderOpen, number: 3, label: "Projects" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-2xl p-6 text-center hover:border-[var(--color-accent-primary)] hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white mx-auto mb-4">
                    <stat.icon size={24} />
                  </div>
                  <div className="font-heading font-bold text-4xl text-gradient-primary mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
