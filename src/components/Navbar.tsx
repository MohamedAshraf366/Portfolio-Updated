import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "../images/logo.png";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);

  const whatsappUrl = `https://wa.me/201111166832?text=${encodeURIComponent("Hello, I need to contact with you")}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-cyan-500/10 py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-md group-hover:blur-lg transition-all duration-300" />
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-full relative z-10" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            Mohamed<span className="gradient-text"> Ashraf</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActive(link.label)}
              className={`relative font-body text-sm font-medium transition-colors duration-300 group ${
                active === link.label ? "text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300 ${
                  active === link.label ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </a>
          ))}
        </div>

        {/* CTA + Social */}
        <div className="hidden md:flex items-center gap-4">
          {/* Social icons */}
          <a href="https://www.facebook.com/mohamed.ashraf.791060/" target="_blank" rel="noreferrer"
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300">
            <i className="fab fa-facebook text-xs" />
          </a>
          <a href="https://www.linkedin.com/in/mohamed-ashraf-497a13170" target="_blank" rel="noreferrer"
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300">
            <i className="fab fa-linkedin text-xs" />
          </a>
          <a href="https://github.com/MohamedAshraf366" target="_blank" rel="noreferrer"
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300">
            <i className="fab fa-github text-xs" />
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-2 px-5 py-2 rounded-full text-sm font-medium font-body bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
          >
            Let's Talk
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => { setActive(link.label); setMenuOpen(false); }}
                  className="text-slate-300 hover:text-cyan-400 font-body font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 px-5 py-2 rounded-full text-sm font-medium text-center bg-gradient-to-r from-cyan-500 to-violet-600 text-white"
              >
                Let's Talk
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
