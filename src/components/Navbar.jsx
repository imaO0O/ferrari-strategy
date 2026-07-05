import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Marquee, EASE } from "./ui";
import Magnetic from "./Magnetic";

const LINKS = [
  { to: "/", label: "Скудерия" },
  { to: "/dashboard", label: "Дашборд" },
  { to: "/races", label: "Гонки" },
  { to: "/telemetry", label: "Телеметрия" },
  { to: "/games", label: "Игры" },
  { to: "/heritage", label: "История" },
  { to: "/credits", label: "Источники" },
];

const SOON = [];

function Wordmark() {
  return (
    <NavLink to="/" className="text-xl font-black uppercase italic tracking-tight">
      <span className="text-rosso">Ferrari</span> Strategy
    </NavLink>
  );
}

/* Ссылка с «прокруткой» текста вверх при наведении */
function RollingLabel({ label, active }) {
  return (
    <span className="relative block h-[1.25em] overflow-hidden">
      <span
        className={`block transition-transform duration-300 ease-out group-hover:-translate-y-full ${
          active ? "text-white" : "text-dim"
        }`}
      >
        {label}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full text-rosso transition-transform duration-300 ease-out group-hover:translate-y-0"
      >
        {label}
      </span>
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-carbon/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Magnetic strength={0.2}>
            <Wordmark />
          </Magnetic>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === "/"} className="group relative py-2">
                {({ isActive }) => (
                  <>
                    <span className="text-sm font-bold uppercase tracking-[0.18em]">
                      <RollingLabel label={label} active={isActive} />
                    </span>
                    <span
                      className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-rosso transition-transform duration-300 ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
            {SOON.map((label) => (
              <span
                key={label}
                className="flex cursor-default items-center gap-1.5 text-sm font-bold uppercase tracking-[0.18em] text-dim/40"
              >
                {label}
                <span className="rounded-sm bg-panel2 px-1 py-0.5 font-digits text-[8px] tracking-widest text-giallo/70">
                  СКОРО
                </span>
              </span>
            ))}
          </nav>

          <button
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Открыть меню"
          >
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-rosso" />
          </button>
        </div>
      </header>

      {/* Полноэкранное мобильное меню */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col bg-rosso-deep md:hidden"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="flex h-16 items-center justify-between px-5">
              <Wordmark />
              <button
                className="text-sm font-black uppercase tracking-[0.2em]"
                onClick={() => setOpen(false)}
              >
                Закрыть ✕
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
              {LINKS.map(({ to, label }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: -32 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: EASE }}
                >
                  <NavLink
                    to={to}
                    end={to === "/"}
                    onClick={() => setOpen(false)}
                    className="text-5xl font-black uppercase italic leading-tight tracking-tight"
                  >
                    {label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.p
                className="mt-6 font-digits text-[10px] tracking-[0.35em] text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ПРОГНОЗЫ — СКОРО
              </motion.p>
            </nav>
            <Marquee
              items={["FORZA FERRARI", "✦", "TIFOSI", "✦", "MARANELLO", "✦"]}
              speed={18}
              className="border-t border-white/20 py-3 text-sm font-black uppercase italic"
              itemClassName="mx-3"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
