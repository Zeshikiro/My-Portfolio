"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Award, ChevronDown, Code, HeartHandshake, Shield, Building2, Calendar, ZoomIn } from "lucide-react";

type Cert = {
  id: string;
  title: string;
  org: string;
  date: string;
  desc: string;
  image: string;
};

type CertCategory = {
  id: string;
  title: string;
  icon: any;
  certs: Cert[];
};

const CERT_CATEGORIES: CertCategory[] = [
  {
    id: "technical",
    title: "Technical & Programming",
    icon: Code,
    certs: [
      {
        id: "sololearn-sql",
        title: "Introduction to SQL",
        org: "Sololearn",
        date: "October 5, 2024",
        desc: "Successfully completed the course by demonstrating theoretical and practical understanding of Introduction to SQL.",
        image: "/Photos/sololearn-sql.png",
      },
      {
        id: "sololearn-java",
        title: "Introduction to Java",
        org: "Sololearn",
        date: "September 25, 2024",
        desc: "Successfully completed the course by demonstrating theoretical and practical understanding of Introduction to Java.",
        image: "/Photos/sololearn-java.png",
      },
      {
        id: "google-workspace",
        title: "Google Workspace",
        org: "DICT Pampanga",
        date: "August 11, 2026",
        desc: "Successfully participated in the three-hour ICT Skills Training on Google Workspace conducted by the ICT Literacy and Competency Development Bureau.",
        image: "/Photos/Google-WorkSpace.jpeg",
      },
      {
        id: "game-dev",
        title: "Press Start: Game Development",
        org: "DICT",
        date: "2026",
        desc: "Participated in the Press Start: Game Development course covering fundamental concepts of game design and development.",
        image: "/Photos/Press_Start_GameDevelopment.jpeg",
      },
      {
        id: "psite",
        title: "IRCITE Participation Award",
        org: "PSITE",
        date: "2026",
        desc: "Awarded for active participation in the International Research Conference on Information Technology Education (IRCITE).",
        image: "/Photos/PSITE_ITMarketing.png",
      },
    ],
  },
  {
    id: "leadership",
    title: "Leadership & Civic Engagement",
    icon: HeartHandshake,
    certs: [
      {
        id: "kkdt",
        title: "Kabataan Kontra Droga at Terorismo (KKDT)",
        org: "PNP Angeles City Mobile Force Company",
        date: "May 9, 2023",
        desc: "Participated in the KKDT civic leadership program promoting a drug-free and peaceful society, demonstrating dedication to community service and youth advocacy.",
        image: "/Photos/(kkdt)Leadership Cert.png",
      },
    ],
  },
  {
    id: "military",
    title: "Military Training & ROTC",
    icon: Shield,
    certs: [
      {
        id: "basic-rotc",
        title: "Basic ROTC Certificate of Graduation",
        org: "ROTC",
        date: "2024",
        desc: "Completed the basic ROTC cadet training.",
        image: "/Photos/basic_cadet.png",
      },
      // Skipping other ROTC certs for brevity, I will add them if needed but we have basic_cadet
      {
        id: "rotc",
        title: "Advanced ROTC",
        org: "ROTC",
        date: "2025",
        desc: "Participated in Advanced ROTC.",
        image: "/Photos/ROTC cert.png",
      },
      {
        id: "rsct",
        title: "RSCT",
        org: "ROTC",
        date: "2025",
        desc: "Regional Summer Camp Training.",
        image: "/Photos/rsct-arapt.png",
      }
    ],
  },
];

export default function Certifications() {
  const [openCategory, setOpenCategory] = useState<string>("technical");

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section id="certifications" className="py-24">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-accent-primary)] text-sm uppercase tracking-wider mb-4">
              <Award size={16} />
              <span>Certifications</span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="font-heading font-bold text-4xl md:text-5xl">
              Certificates &amp; <span className="text-gradient-primary">Achievements</span>
            </motion.h2>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {CERT_CATEGORIES.map((category) => {
              const isOpen = openCategory === category.id;
              
              return (
                <motion.div key={category.id} variants={itemVariants} className="rounded-2xl overflow-hidden border border-[var(--color-glass-border)] bg-[var(--color-bg-surface)]">
                  <button
                    onClick={() => setOpenCategory(isOpen ? "" : category.id)}
                    className="w-full flex items-center justify-between p-6 bg-[var(--color-glass-bg)] hover:bg-[var(--color-bg-surface-hover)] transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-bg-surface-hover)] flex items-center justify-center text-[var(--color-accent-primary)]">
                        <category.icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg md:text-xl text-[var(--color-text-primary)]">
                          {category.title}
                        </h3>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {category.certs.length} Certificate{category.certs.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-[var(--color-text-secondary)]"
                    >
                      <ChevronDown size={24} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="border-t border-[var(--color-glass-border)]"
                      >
                        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
                          {category.certs.map((cert) => (
                            <div key={cert.id} className="bg-[var(--color-bg-primary)] rounded-xl overflow-hidden border border-[var(--color-glass-border)] hover:border-[var(--color-accent-primary)] transition-all duration-300 hover:-translate-y-1 hover:shadow-glow group cursor-pointer">
                              <div className="h-48 overflow-hidden bg-[var(--color-bg-surface-hover)] relative">
                                <img
                                  src={cert.image}
                                  alt={cert.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                  <ZoomIn size={32} className="text-white" />
                                </div>
                              </div>
                              <div className="p-5">
                                <h4 className="font-heading font-bold text-lg mb-2">{cert.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] mb-3">
                                  <div className="flex items-center gap-1">
                                    <Building2 size={14} className="text-[var(--color-accent-primary)]" />
                                    <span>{cert.org}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar size={14} className="text-[var(--color-accent-primary)]" />
                                    <span>{cert.date}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                                  {cert.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
