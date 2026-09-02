"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Education", href: "#education" },
  { name: "Certifications", href: "#certifications" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Scrollspy logic
      const sections = ["hero", ...NAV_LINKS.map(link => link.href.substring(1))];
      let current = "hero";

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the top of the element is near the top of the viewport
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth"
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--color-bg-primary)]/90 backdrop-blur-md shadow-md py-4 border-b border-[var(--color-border)]"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center max-w-6xl">
        <button
          onClick={() => scrollToSection("hero")}
          className="font-heading font-bold text-2xl tracking-tighter cursor-pointer"
        >
          JRN<span className="text-[var(--color-accent-primary)]">.</span>
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-2 relative">
          {NAV_LINKS.map((link) => {
            const sectionId = link.href.substring(1);
            return (
              <li key={link.name}>
                <button
                  onClick={() => scrollToSection(sectionId)}
                  className={`relative px-4 py-2 rounded-md text-sm transition-colors ${
                    activeSection === sectionId
                      ? "text-[var(--color-accent-primary)] font-medium"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)]"
                  }`}
                >
                  {activeSection === sectionId && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-accent-primary)]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {link.name}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[var(--color-text-primary)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 w-full bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] shadow-lg"
        >
          <ul className="flex flex-col py-4">
            {NAV_LINKS.map((link) => {
              const sectionId = link.href.substring(1);
              return (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(sectionId)}
                    className={`w-full text-left px-6 py-4 border-l-4 transition-colors ${
                      activeSection === sectionId
                        ? "border-[var(--color-accent-primary)] bg-[var(--color-bg-surface-hover)] text-[var(--color-accent-primary)]"
                        : "border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-hover)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {link.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </nav>
  );
}
