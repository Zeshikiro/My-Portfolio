"use client";

import { motion } from "framer-motion";
import { GraduationCap, BookOpen, School, Book } from "lucide-react";

export default function Education() {
  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const timelineData = [
    {
      type: "College",
      school: "Pampanga State Agricultural University",
      subtitle: "Bachelor of Science in Information Technology",
      description: "Lead Developer of the STEP-UP capstone project. Building expertise in software development, database management, and systems administration. Actively learning and applying new technologies.",
      icon: GraduationCap,
      badgeColor: "bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)]",
    },
    {
      type: "Senior High School",
      school: "Gov. Rafael L. Lazatin Integrated School",
      description: "Completed secondary education in Angeles City, gaining essential academic skills and preparing for higher learning in technology.",
      icon: BookOpen,
      badgeColor: "bg-[var(--color-accent-secondary)]/15 text-[var(--color-accent-secondary)]",
    },
    {
      type: "Junior High School",
      school: "Holy Angel University",
      description: "Built a strong academic foundation and discovered a passion for technology and problem-solving that would shape my career path.",
      icon: School,
      badgeColor: "bg-[var(--color-accent-tertiary)]/15 text-[var(--color-accent-tertiary)]",
    },
    {
      type: "Elementary",
      school: "Marisol Bliss Elementary School",
      description: "Early education years where the foundation of continuous learning and curiosity was built.",
      icon: Book,
      badgeColor: "bg-[var(--color-text-muted)]/15 text-[var(--color-text-primary)]",
    },
  ];

  return (
    <section id="education" className="py-24 bg-[var(--color-bg-surface)]">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-accent-primary)] text-sm uppercase tracking-wider mb-4">
            <GraduationCap size={16} />
            <span>Education</span>
          </div>
          <h2 className="font-heading font-bold text-4xl md:text-5xl">
            My <span className="text-gradient-primary">Journey</span>
          </h2>
        </div>

        <motion.div
          className="relative pl-8 md:pl-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Vertical Line */}
          <div className="absolute left-[39px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-primary rounded-full opacity-30" />

          {timelineData.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={item.school}
                variants={itemVariants}
                className={`relative mb-12 md:mb-24 w-full flex flex-col md:flex-row items-start ${
                  isEven ? "md:justify-start" : "md:justify-end"
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-[-40px] md:left-1/2 md:-translate-x-1/2 top-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-glow z-10 border-4 border-[var(--color-bg-surface)]">
                  <item.icon size={18} />
                </div>

                {/* Content Card */}
                <div className={`w-full md:w-[45%] bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-2xl p-6 md:p-8 hover:border-[var(--color-accent-primary)] hover:shadow-glow transition-all duration-300 ${
                  isEven ? "md:text-right" : "md:text-left"
                }`}>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${item.badgeColor}`}>
                    {item.type}
                  </span>
                  <h3 className="font-heading font-bold text-xl md:text-2xl mb-2">{item.school}</h3>
                  {item.subtitle && (
                    <p className="text-[var(--color-accent-secondary)] font-medium mb-3">{item.subtitle}</p>
                  )}
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
