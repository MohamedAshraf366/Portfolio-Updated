import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Skill {
  name: string;
  icon: string;
  level: number;
  color: string;
}

const skills: Skill[] = [
  { name: "HTML5", icon: "https://img.icons8.com/?size=100&id=20909&format=png", level: 95, color: "#E44D26" },
  { name: "CSS3", icon: "https://img.icons8.com/?size=100&id=21278&format=png", level: 90, color: "#1572B6" },
  { name: "JavaScript", icon: "https://img.icons8.com/?size=100&id=108784&format=png", level: 85, color: "#F7DF1E" },
  { name: "TypeScript", icon: "https://img.icons8.com/?size=100&id=uJM6fQYqDaZK&format=png", level: 75, color: "#3178C6" },
  { name: "React", icon: "https://img.icons8.com/?size=100&id=PndQWK6M1Hjo&format=png", level: 88, color: "#61DAFB" },
  { name: "Next.js", icon: "https://img.icons8.com/?size=100&id=yUdJlcKanVbh&format=png", level: 78, color: "#ffffff" },
  { name: "Node.js", icon: "https://img.icons8.com/?size=100&id=FQlr_bFSqEdG&format=png", level: 80, color: "#339933" },
  { name: "MongoDB", icon: "https://img.icons8.com/?size=100&id=bosfpvRzNOG8&format=png", level: 75, color: "#47A248" },
  { name: "Tailwind CSS", icon: "https://img.icons8.com/?size=100&id=4PiNHtUJVbLs&format=png", level: 90, color: "#06B6D4" },
  { name: "Bootstrap", icon: "https://img.icons8.com/?size=100&id=PndQWK6M1Hjo&format=png", level: 88, color: "#7952B3" },
  { name: "Git", icon: "https://img.icons8.com/?size=100&id=wPohyHO_qO1a&format=png", level: 82, color: "#F05032" },
  { name: "Figma", icon: "https://img.icons8.com/?size=100&id=SDVmtZ6VBGXt&format=png", level: 70, color: "#F24E1E" },
];

const SkillCard: React.FC<{ skill: Skill; index: number }> = ({ skill, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group glass rounded-2xl p-5 hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center p-2"
          style={{ backgroundColor: `${skill.color}15`, border: `1px solid ${skill.color}30` }}
        >
          <img src={skill.icon} alt={skill.name} className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-1">
          <p className="font-display font-semibold text-white text-sm">{skill.name}</p>
          <p className="text-xs text-slate-500 font-mono">{skill.level}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.level}%` } : {}}
          transition={{ duration: 1, delay: index * 0.07 + 0.3, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: skill.color, boxShadow: `0 0 8px ${skill.color}60` }}
        />
      </div>
    </motion.div>
  );
};

const Skills: React.FC = () => {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  return (
    <section id="skills" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="absolute top-1/2 -left-60 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-cyan-400 text-sm tracking-widest uppercase">What I work with</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mt-3">
            My <span className="gradient-text">Skills</span>
          </h2>
          <p className="text-slate-400 font-body mt-4 max-w-xl mx-auto">
            A curated set of technologies I've mastered building real-world fullstack applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {skills.map((skill, i) => (
            <SkillCard key={skill.name} skill={skill} index={i} />
          ))}
        </div>

        {/* Tech marquee */}
        <div className="mt-16 overflow-hidden">
          <p className="text-center text-slate-600 text-xs font-mono uppercase tracking-widest mb-6">Also familiar with</p>
          <div className="flex gap-6 items-center animate-[marquee_20s_linear_infinite]">
            {["Express.js", "PostgreSQL", "Redis", "Docker", "REST APIs", "GraphQL", "Jest", "Webpack", "Vite", "AWS S3"].map((tech) => (
              <span
                key={tech}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-white/10 text-slate-500 text-xs font-mono hover:text-slate-300 hover:border-white/20 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
