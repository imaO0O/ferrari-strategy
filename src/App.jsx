import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StartLights from "./components/StartLights";
import Scuderia from "./pages/Scuderia";
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
    // jump to top under the transition panels, before the new page reveals
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <>
      <StartLights />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Scuderia />} />
          <Route path="/heritage" element={<Heritage />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}
