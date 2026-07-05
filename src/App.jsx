import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import Lenis from "lenis";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StartLights from "./components/StartLights";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import Scuderia from "./pages/Scuderia";
import Dashboard from "./pages/Dashboard";
import Races from "./pages/Races";
import Game from "./pages/Game";
import Heritage from "./pages/Heritage";
import Credits from "./pages/Credits";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.115, smoothWheel: true });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // прыжок наверх под панелями перехода, до появления новой страницы
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <StartLights />
      <CustomCursor />
      <ScrollProgress />
      {/* лёгкое «киношное» зерно поверх всего */}
      <div className="grain pointer-events-none fixed inset-0 z-[85] opacity-[0.05]" />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Scuderia />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/races" element={<Races />} />
          <Route path="/game" element={<Game />} />
          <Route path="/heritage" element={<Heritage />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </MotionConfig>
  );
}
