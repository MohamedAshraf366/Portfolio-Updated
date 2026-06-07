import React from "react";
import { motion } from "framer-motion";
import logo from "../images/logo.png";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 py-10 relative">
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

         

          <a href="https://github.com/MohamedAshraf366?tab=repositories" target="_blank" className="text-slate-600 text-xs font-mono">
            © 2025 Mohamed Ashraf. All rights reserved.
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
