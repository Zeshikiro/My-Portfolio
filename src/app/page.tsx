import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Terminal from "@/components/Terminal";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Education />
      <Certifications />
      <Contact />
      <Terminal />
      
      <footer className="py-8 text-center text-[var(--color-text-muted)] text-sm border-t border-[var(--color-glass-border)] bg-[var(--color-bg-primary)]">
        <p>&copy; {new Date().getFullYear()} John Ryan Nicolas. Built with Next.js, Tailwind & Framer Motion.</p>
      </footer>
    </main>
  );
}
