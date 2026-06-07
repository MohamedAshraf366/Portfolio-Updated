import React, { useEffect, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import heroImg from "../images/homeRightt.jpg";

const ROLES = [
  "Fullstack Developer",
  "React Specialist",
  "Node.js Engineer",
  "UI/UX Enthusiast",
];

const Hero: React.FC = () => {
  const [roleIndex, setRoleIndex] = React.useState(0);
  const [displayed, setDisplayed] = React.useState("");
  const [typing, setTyping] = React.useState(true);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const whatsappUrl = `https://wa.me/201111166832?text=${encodeURIComponent("Hello, I need to contact with you")}`;

  useEffect(() => {
    const current = ROLES[roleIndex];
    if (typing) {
      if (displayed.length < current.length) {
        timeout.current = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 70);
      } else {
        timeout.current = setTimeout(() => setTyping(false), 2000);
      }
    } else {
      if (displayed.length > 0) {
        timeout.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
      } else {
        setRoleIndex((i) => (i + 1) % ROLES.length);
        setTyping(true);
      }
    }
    return () => { if (timeout.current) clearTimeout(timeout.current); };
  }, [displayed, typing, roleIndex]);

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center grid-bg noise-bg overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16 w-full">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text Side */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Available for work
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-display font-bold text-5xl md:text-6xl leading-tight text-white">
              Hi, I'm{" "}
              <span className="gradient-text">Mohamed</span>
              <br />
              <span className="gradient-text">Ashraf</span>
            </motion.h1>

            <motion.div variants={itemVariants} className="h-10 flex items-center">
              <span className="font-mono text-xl md:text-2xl text-slate-300">
                &lt; <span className="text-cyan-400">{displayed}</span>
                <span className="inline-block w-0.5 h-6 bg-cyan-400 ml-1 animate-pulse" />
                &nbsp;/&gt;
              </span>
            </motion.div>

            <motion.p variants={itemVariants} className="text-slate-400 font-body text-lg leading-relaxed max-w-lg">
              Communication Engineer turned Fullstack Developer. I build performant, pixel-perfect web applications with React, Node.js, and modern tech stacks.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-3.5 rounded-full font-medium font-body bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Let's Connect →
              </a>
              <a
                href="#projects"
                className="px-8 py-3.5 rounded-full font-medium font-body border border-white/10 text-slate-300 hover:border-cyan-500/50 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                View Projects
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="flex gap-8 pt-4">
              {[
                { value: "25+", label: "Projects Built" },
                { value: "2+", label: "Years Learning" },
                { value: "10+", label: "Tech Skills" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-display font-bold text-3xl gradient-text">{stat.value}</span>
                  <span className="text-slate-500 text-sm font-body">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 60 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" as any, delay: 0.3 }}
            className="relative flex justify-center"
          >
            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 m-auto w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full border border-dashed border-cyan-500/20"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 m-auto w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full border border-dashed border-violet-500/20"
            />

            {/* Glow */}
            <div className="absolute inset-0 m-auto w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl" />

            {/* Image */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as any }}
              className="relative z-10"
            >
              <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
                <img
                  src={heroImg}
                  alt="Mohamed Ashraf"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -right-4 glass rounded-2xl px-4 py-2 border border-cyan-500/20"
              >
                <span className="text-xs text-slate-400 font-mono">stack</span>
                <div className="flex gap-2 mt-1">
                  {["⚛️", "🟢", "🍃", "🎨"].map((icon, i) => (
                    <span key={i} className="text-sm">{icon}</span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -top-4 -left-4 glass rounded-2xl px-4 py-2 border border-violet-500/20"
              >
                <span className="text-xs text-slate-400 font-mono">status</span>
                <p className="text-xs text-violet-400 font-medium mt-0.5">🚀 Open to work</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-cyan-400 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default Hero;
