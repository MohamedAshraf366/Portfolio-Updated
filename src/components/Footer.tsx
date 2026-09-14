import React from "react";
import { Download } from "lucide-react";
import logo from "../images/logo.png";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 py-10 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="#home" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md group-hover:blur-lg transition-all" />
              <img src={logo} alt="Logo" className="w-9 h-9 rounded-full relative z-10" />
            </div>
            <span className="font-display font-bold text-white">
              Mohamed<span className="gradient-text"> Ashraf</span>
            </span>
          </a>

          <div className="flex items-center gap-4">
            <a
              href="/Mohamed_Ashraf_CV.pdf"
              download
              className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-amber-400 transition-colors duration-300"
            >
              <Download size={12} />
              Download CV
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://github.com/MohamedAshraf366?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 text-xs font-mono hover:text-slate-400 transition-colors"
            >
              © {new Date().getFullYear()} Mohamed Ashraf. All rights reserved.
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
