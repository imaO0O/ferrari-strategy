import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import Lenis from "lenis";
import Navbar from "./components/Navbar";
import WeekendStrip from "./components/WeekendStrip";
import Footer from "./components/Footer";
import StartLights from "./components/StartLights";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import ErrorBoundary from "./components/ErrorBoundary";

// Каждая страница — отдельный чанк: первый вход грузит только нужное
const Scuderia = lazy(() => import("./pages/Scuderia"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Races = lazy(() => import("./pages/Races"));
const Games = lazy(() => import("./pages/Games"));
const Telemetry = lazy(() => import("./pages/Telemetry"));
const Legends = lazy(() => import("./pages/Legends"));
const Heritage = lazy(() => import("./pages/Heritage"));
const Credits = lazy(() => import("./pages/Credits"));
const About = lazy(() => import("./pages/About"));
const Live = lazy(() => import("./pages/Live"));
const Academy = lazy(() => import("./pages/Academy"));
const Passport = lazy(() => import("./pages/Passport"));
const DriverProfile = lazy(() => import("./pages/DriverProfile"));
const TeamProfile = lazy(() => import("./pages/TeamProfile"));
const CircuitProfile = lazy(() => import("./pages/CircuitProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-rosso" />
    </div>
  );
}

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
      <a href="#main" className="skip-link">
        К основному содержимому
      </a>
      <StartLights />
      <CustomCursor />
      <ScrollProgress />
      {/* лёгкое «киношное» зерно поверх всего */}
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[85] opacity-[0.05]" />
      <Navbar />
      <WeekendStrip />
      <ErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Scuderia />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/races" element={<Races />} />
              <Route path="/games" element={<Games />} />
              <Route path="/game" element={<Navigate to="/games" replace />} />
              <Route path="/telemetry" element={<Telemetry />} />
              <Route path="/legends" element={<Legends />} />
              <Route path="/heritage" element={<Heritage />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/about" element={<About />} />
              <Route path="/live" element={<Live />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/passport" element={<Passport />} />
              <Route path="/driver/:driverId" element={<DriverProfile />} />
              <Route path="/team/:constructorId" element={<TeamProfile />} />
              <Route path="/circuit/:circuitId" element={<CircuitProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </MotionConfig>
  );
}
