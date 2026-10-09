"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Calendar, X, Maximize2 } from "lucide-react";

type GalleryItem = {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  tags: string[];
};

// Add new photos here — newest first.
// Images live in /public/Gallery/
const GALLERY: GalleryItem[] = [
  {
    id: "system-unit-build",
    title: "Building & Troubleshooting a System Unit",
    date: "September 30, 2026",
    description:
      "First-hand experience assembling a new system unit from the ground up — mounting the AORUS motherboard, seating the AMD processor and Wraith cooler, routing cables, and troubleshooting the build until it ran properly.",
    image: "/Gallery/System-Unit-Build.jpg",
    tags: ["PC Assembly", "Hardware", "Troubleshooting"],
  },
];

export default function Gallery() {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
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
    <section id="gallery" className="pt-6 pb-16">
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
              <Camera size={16} />
              <span>Gallery</span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="font-heading font-bold text-4xl md:text-5xl mb-4"
            >
              Behind the <span className="text-gradient-primary">Scenes</span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-[var(--color-text-secondary)] max-w-xl mx-auto"
            >
              Moments from hands-on work, events, and the things I&apos;ve been building.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {GALLERY.map((item) => (
              <motion.button
                key={item.id}
                variants={itemVariants}
                onClick={() => setSelected(item)}
                className="group text-left bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-[var(--color-accent-primary)] hover:shadow-glow transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-surface-hover)]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Maximize2 size={16} />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-2">
                    <Calendar size={12} className="text-[var(--color-accent-primary)]" />
                    <span>{item.date}</span>
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2 text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-3 mb-4">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full bg-[var(--color-bg-surface-hover)] border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8"
          >
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />

            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-[var(--color-bg-surface)] text-white flex items-center justify-center hover:bg-[var(--color-accent-primary)] transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--color-bg-surface)] border border-[var(--color-glass-border)] rounded-2xl grid md:grid-cols-[1.2fr_1fr]"
            >
              <div className="relative aspect-square md:aspect-auto md:min-h-[480px] bg-black">
                <Image
                  src={selected.image}
                  alt={selected.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-contain"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-3">
                  <Calendar size={14} className="text-[var(--color-accent-primary)]" />
                  <span>{selected.date}</span>
                </div>
                <h3 className="font-heading font-bold text-2xl mb-4 text-[var(--color-text-primary)]">
                  {selected.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                  {selected.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
