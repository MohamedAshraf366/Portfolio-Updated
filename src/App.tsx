import React, { lazy, Suspense } from "react";
import "./index.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

const Scene3D = lazy(() => import("./components/Scene3D"));

function App() {
  return (
    <div className="min-h-screen bg-[#040810] relative">
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Skills />
        <Projects />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}

export default App;
