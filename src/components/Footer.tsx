"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

const SOCIALS = [
  { icon: FaGithub, href: "https://github.com/Zeshikiro", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/john-ryan-nicolas-21b058332/", label: "LinkedIn" },
  { icon: FaFacebook, href: "https://www.facebook.com/johnryan.nicolas.3/", label: "Facebook" },
  { icon: FaInstagram, href: "https://www.instagram.com/zeshikiro/", label: "Instagram" },
  { icon: FaTiktok, href: "https://www.tiktok.com/@zeshikiro", label: "TikTok" },
];

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Education", href: "#education" },
  { name: "Certifications", href: "#certifications" },
  { name: "Contact", href: "#contact" },
];

export default function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative border-t border-[var(--color-glass-border)] bg-[var(--color-bg-surface)]">
      <div className="container mx-auto px-6 max-w-6xl py-16">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {/* Branding */}
          <div>
            <button
              onClick={() => scrollToSection("hero")}
              className="font-heading font-bold text-3xl tracking-tighter mb-4 block"
            >
              JRN<span className="text-[var(--color-accent-primary)]">.</span>
            </button>
            <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm max-w-xs">
              IT Student & Developer at Pampanga State Agricultural University.
              Building meaningful digital experiences one project at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4 text-[var(--color-text-primary)]">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href.substring(1))}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4 text-[var(--color-text-primary)]">
              Connect
            </h4>
            <div className="flex gap-3 mb-6">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-bg-primary)] border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-primary)] hover:text-white hover:border-transparent transition-all duration-300"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
            <a
              href="mailto:johnryannicolas43@gmail.com"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors"
            >
              johnryannicolas43@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--color-glass-border)]">
        <div className="container mx-auto px-6 max-w-6xl py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} John Ryan Nicolas. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            Made with <Heart size={12} className="text-red-500 fill-red-500" /> using Next.js, Tailwind & Framer Motion
          </p>
        </div>
      </div>
    </footer>
  );
}
