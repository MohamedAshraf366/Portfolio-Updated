import React, { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";

import project1 from "../images/projrct1.png";
import project2 from "../images/projrct2.png";
import project3 from "../images/projrct3.png";
import project4 from "../images/projrct4.png";
import project5 from "../images/projrct5.png";
import project6 from "../images/projrct6.png";
import project7 from "../images/projrct7.png";
import project8 from "../images/projrct8.png";
import project9 from "../images/projrct9.png";
import project12 from "../images/projrct12.png";
import project13 from "../images/projrct13.png";
import project14 from "../images/projrct14.jpeg";
import project15 from "../images/projrct15.jpeg";
import project16 from "../images/projrct16.jpeg";
import project17 from "../images/project17.jpeg";
import project18 from "../images/project18.jpeg";
import project19 from "../images/project19.jpeg";
import project20 from "../images/project20.jpeg";
import project21 from "../images/Agile-architect-aura.jpeg";
import project22 from "../images/supplyq.jpeg";
import project23 from "../images/HR.jpeg";
import project24 from "../images/EduGrid.jpeg";
import project25 from "../images/ironforge-gym.jpeg";
import project26 from "../images/Nooe-El-Quran.jpg";
import project27 from "../images/Currency-stramline.jpg";
import project28 from "../images/QR-Creator.jpg";
import project29 from "../images/Adalah Law Firm and Legal Consulations.jpg";
import project30 from "../images/FintechOS.jpg";
import project31 from "../images/cafe.jpg";
import project32 from "../images/PasswordGenerator.jpg";
import project33 from "../images/Visore Image Generator.jpg";
import project34 from "../images/AutoElite - Car Dealrship.jpg";
import project35 from "../images/Egypt Tourism.jpg";
import project36 from "../images/Anwar.jpg";
import project37 from "../images/Mehrap for researching.jpg";
import project38 from "../images/Frostworks.jpg";
import project39 from "../images/Clinic MediCare.jpg";
import project40 from "../images/Project3-update.jpg";
import project41 from "../images/ResumeAce.jpg";
import project42 from "../images/Birthday-Wish-Generator.jpg";


interface Project {
  id: number;
  img: string;
  url: string;
  title: string;
  tags: string[];
  category: string;
}

const allProjects: Project[] = [
  { id: 42, img: project42, url: "https://birthday-wish-generator-rose.vercel.app/", title: "Birthday Wish Generator",  tags: ["Next.js", "Tailwind"], category: "Next" },
  { id: 41, img: project41, url: "https://resume-ace-neon.vercel.app/", title: "ResumeAce", tags: ["React", "Tailwind","Supabase"], category: "Fullstack" },
  { id: 39, img: project39, url: "https://clinic-medi-care-bent.vercel.app/", title: "Clinic MediCare", tags: ["React", "Tailwind"], category: "React" },
  { id: 38, img: project38, url: "https://frostworks.vercel.app/", title: "Frostworks",  tags: ["Next.js", "Tailwind"], category: "Next" },
  { id: 37, img: project37, url: "https://mehrap-for-researching-rx27.vercel.app/", title: "Mehrap For Researching", tags: ["React", "Tailwind"], category: "React" },
  { id: 36, img: project36, url: "https://anwar-egypt-journey.vercel.app/", title: "Anwar Egypt Journey", tags: ["React", "Tailwind"], category: "React" },
  { id: 34, img: project34, url: "https://car-dealership-xi-ruddy.vercel.app/en", title: "AutoElite - Car Dealrship",  tags: ["Next.js", "Tailwind"], category: "Next" },
  { id: 33, img: project33, url: "https://visora-image-generator.vercel.app/", title: "Visore Image Generator",  tags: ["Next.js", "Tailwind"], category: "Next" },
  { id: 32, img: project32, url: "https://mohamedashraf366.github.io/PasswordGenerator/", title: "Password Generator", tags: ["HTML", "CSS"], category: "HTML/CSS" },
  { id: 31, img: project31, url: "https://cafe-sage-eight.vercel.app/", title: "Cafe", tags: ["Next.js", "Tailwind"], category: "Next" },
  { id: 30, img: project30, url: "https://fintech-os-six.vercel.app/", title: "FintechOS", tags: ["Next.js", "Tailwind"], category: "Next" },
  { id: 29, img: project29, url: "https://legal-ledger-craft.vercel.app/", title: "Adalah Law Firm and Legal Consulations", tags: ["React.js", "Tailwind"], category: "React" },
  { id: 28, img: project28, url: "https://qr-creator-delta.vercel.app/en", title: "QR Creator", tags: ["React", "Tailwind"], category: "React" },
  { id: 27, img: project27, url: "https://currency-streamline-main-5dqbrpg55-moahmed-ashrafs-projects.vercel.app/", title: "Cuurency Stream", tags: ["React", "Tailwind"], category: "React" },
  { id: 26, img: project26, url: "https://noor-el-quran-gevk.vercel.app/", title: "Noor El Quran", tags: ["React", "Tailwind"], category: "React" },
  { id: 25, img: project25, url: "https://ironforge-eqje7nj2z-moahmed-ashrafs-projects.vercel.app/", title: "IronForge Gym", tags: ["React", "Tailwind"], category: "React" },
  { id: 24, img: project24, url: "https://edu-grid-bgg4poock-moahmed-ashrafs-projects.vercel.app/", title: "EduGrid Platform", tags: ["React", "Node.js"], category: "Fullstack" },
  { id: 23, img: project23, url: "https://frontend-4oxgbua8n-moahmed-ashrafs-projects.vercel.app/login", title: "HR Dashboard", tags: ["React", "Dashboard"], category: "React" },
  { id: 22, img: project22, url: "https://supplyq-e4d8h2m5d-moahmed-ashrafs-projects.vercel.app/", title: "SupplyQ", tags: ["Next.js", "MongoDB"], category: "Fullstack" },
  { id: 21, img: project21, url: "https://agile-architect-aura-main.vercel.app/", title: "Agile Architect Aura", tags: ["React", "UI"], category: "React" },
  { id: 20, img: project20, url: "https://dashboard-eqvs7fxnt-moahmed-ashrafs-projects.vercel.app/", title: "Admin Dashboard", tags: ["React", "Charts"], category: "React" },
  { id: 35, img: project35, url: "https://egypt-tourism-666l.vercel.app/", title: "Egypt Tourism",  tags: ["Next.js", "Tailwind"], category: "Next" },
  { id: 14, img: project14, url: "https://ecommerce-nextjs-7kvwxo78x-moahmed-ashrafs-projects.vercel.app/", title: "E-Commerce Next", tags: ["Next.js", "Stripe"], category: "Fullstack" },
  { id: 15, img: project15, url: "https://limitless-nextjs-fveaaaezp-moahmed-ashrafs-projects.vercel.app/", title: "Limitless", tags: ["Next.js", "Tailwind"], category: "React" },
  { id: 17, img: project17, url: "https://project20-filter-p2b4ijw15-moahmed-ashrafs-projects.vercel.app/", title: "Product Filter", tags: ["React", "State"], category: "React" },
  { id: 18, img: project18, url: "https://project7-web-auth-bsyt-route-protection-mduj1j723.vercel.app/", title: "Auth System", tags: ["React", "JWT"], category: "Fullstack" },
  { id: 19, img: project19, url: "https://project9-web-sfht-landing-responsive-4qizjpmwq.vercel.app/", title: "Landing Page", tags: ["HTML", "CSS"], category: "HTML/CSS" },
  { id: 1, img: project1, url: "https://mohamedashraf366.github.io/pro1/", title: "Project One", tags: ["HTML", "CSS"], category: "HTML/CSS" },
  { id: 2, img: project2, url: "https://mohamedashraf366.github.io/pro2/", title: "Project Two", tags: ["HTML", "CSS"], category: "HTML/CSS" },
  { id: 3, img: project3, url: "https://mohamedashraf366.github.io/pro3/", title: "Project Three", tags: ["HTML", "JS"], category: "HTML/CSS" },
  { id: 40, img: project40, url: "https://mohamedashraf366.github.io/Rocker-For-Furnature/", title: "Rocker For Furnature", tags: ["HTML", "JS"], category: "HTML/CSS" },
  { id: 4, img: project4, url: "https://mohamedashraf366.github.io/Project4/", title: "Project Four", tags: ["HTML", "JS"], category: "HTML/CSS" },
  { id: 5, img: project5, url: "https://mohamedashraf366.github.io/Project5/", title: "Project Five", tags: ["Bootstrap"], category: "HTML/CSS" },
  { id: 6, img: project7, url: "https://mohamedashraf366.github.io/Project6/", title: "Project Six", tags: ["Bootstrap"], category: "HTML/CSS" },
  { id: 7, img: project6, url: "https://mohamedashraf366.github.io/Project7/", title: "Project Seven", tags: ["Bootstrap"], category: "HTML/CSS" },
  { id: 8, img: project8, url: "https://mohamedashraf366.github.io/Project8-React-Portfolio/", title: "Portfolio v1", tags: ["React"], category: "React" },
  { id: 9, img: project9, url: "https://mohamedashraf366.github.io/Project10-React-Roberto/", title: "Roberto App", tags: ["React"], category: "React" },
  { id: 12, img: project12, url: "https://mohamedashraf366.github.io/Project12-Ecommerce/", title: "E-Commerce v1", tags: ["React"], category: "React" },
  { id: 13, img: project13, url: "https://mohamedashraf366.github.io/Project13-Resturan-redboa/", title: "Red Boa Restaurant", tags: ["React"], category: "React" },
  { id: 16, img: project16, url: "https://project15-next-da737c8nv-moahmed-ashrafs-projects.vercel.app/", title: "Zain Fundamental", tags: ["React, Bootstrap"], category: "React" },
];

const FILTERS = ["All", "React","Next", "Fullstack", "HTML/CSS"] as const;
type Filter = typeof FILTERS[number];

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative group rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-video overflow-hidden bg-dark-800">
        <motion.img
          src={project.img}
          alt={project.title}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-dark-900/95 via-dark-900/70 to-transparent flex flex-col justify-end p-5"
          >
            <h3 className="font-display font-bold text-white text-lg">{project.title}</h3>
            <div className="flex gap-2 mt-2 flex-wrap">
              {project.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono border border-cyan-500/30">
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium w-fit hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              Live Demo <ExternalLink size={14} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Projects: React.FC = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  const filtered = filter === "All" ? allProjects : allProjects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      <div className="absolute top-1/3 -right-60 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="font-mono text-violet-400 text-sm tracking-widest uppercase">What I've built</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mt-3">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-slate-400 font-body mt-4 max-w-xl mx-auto">
            {allProjects.length}+ projects across frontend, fullstack, and UI/UX — each one a step forward.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium font-body transition-all duration-300 ${
                filter === f
                  ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20"
                  : "border border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
