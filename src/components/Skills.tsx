"use client";

import { motion } from "framer-motion";
import { Wrench, Code2, Database, TerminalSquare, Bot, FileText } from "lucide-react";

const SKILL_CATEGORIES = [
  {
    title: "Languages & Web",
    icon: Code2,
    skills: [
      { name: "HTML", color: "#e44d26", level: "Foundational", width: 50 },
      { name: "CSS", color: "#264de4", level: "Foundational", width: 50 },
      { name: "Python", color: "#3776AB", level: "Learning", width: 30 },
      { name: "Java", color: "#f89820", level: "Learning", width: 30 },
    ],
  },
  {
    title: "Database",
    icon: Database,
    skills: [
      { name: "MySQL", color: "#00758f", level: "Basic", width: 45 },
    ],
  },
  {
    title: "Tools & Systems",
    icon: TerminalSquare,
    skills: [
      { name: "Linux Ubuntu", color: "#E95420", level: "Basic", width: 45 },
      { name: "Git & GitHub", color: "#F05032", level: "Basic", width: 45 },
      { name: "Computer Hardware", color: "#38bdf8", level: "Basic", width: 50 },
    ],
  },
  {
    title: "AI & Emerging Tech",
    icon: Bot,
    skills: [
      { name: "AI-Assisted Dev", color: "#a78bfa", level: "Basic", width: 50 },
      { name: "Prompt Engineering", color: "#10b981", level: "Basic", width: 45 },
    ],
  },
  {
    title: "Productivity",
    icon: FileText,
    skills: [
      { name: "Microsoft Word", color: "#2B579A", level: "Proficient", width: 70 },
      { name: "Microsoft PPT", color: "#D24726", level: "Proficient", width: 70 },
    ],
  },
];

const badgeColors: Record<string, string> = {
  Foundational: "bg-[var(--color-accent-secondary)]/15 text-[var(--color-accent-secondary)]",
  Basic: "bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)]",
  Learning: "bg-[var(--color-accent-tertiary)]/15 text-[var(--color-accent-tertiary)]",
  Proficient: "bg-[var(--color-accent-secondary)]/15 text-[var(--color-accent-secondary)]",
};

export default function Skills() {
  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section id="skills" className="py-24 bg-[var(--color-bg-surface)]">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-accent-primary)] text-sm uppercase tracking-wider mb-4">
              <Wrench size={16} />
              <span>Skills</span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="font-heading font-bold text-4xl md:text-5xl">
              My <span className="text-gradient-primary">Tech Stack</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SKILL_CATEGORIES.map((category) => (
              <motion.div
                key={category.title}
                variants={itemVariants}
                className="bg-[var(--color-bg-primary)] border border-[var(--color-glass-border)] rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-6 text-[var(--color-text-primary)]">
                  <category.icon size={24} className="text-[var(--color-accent-primary)]" />
                  <h3 className="font-heading font-bold text-xl">{category.title}</h3>
                </div>

                <div className="space-y-6">
                  {category.skills.map((skill) => (
                    <div key={skill.name} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium">
                          <span
                            className="w-3 h-3 rounded-full block"
                            style={{ backgroundColor: skill.color }}
                          />
                          <span>{skill.name}</span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            badgeColors[skill.level] || badgeColors.Basic
                          }`}
                        >
                          {skill.level}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--color-bg-surface-hover)] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-primary rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.width}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
