import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LIGHT_COUNT = 5;
const STEP_MS = 260;
const HOLD_MS = 650;

/* F1 start-lights intro overlay, shown once per browser session */
export default function StartLights() {
  const [show, setShow] = useState(() => !sessionStorage.getItem("rc-intro-done"));
  const [lit, setLit] = useState(0);

  useEffect(() => {
    if (!show) return;
    const timers = [];
    for (let i = 1; i <= LIGHT_COUNT; i++) {
      timers.push(setTimeout(() => setLit(i), i * STEP_MS));
    }
    timers.push(
      setTimeout(() => {
        setLit(0); // lights out…
        timers.push(setTimeout(() => dismiss(), 420)); // …and away we go
      }, LIGHT_COUNT * STEP_MS + HOLD_MS),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const dismiss = () => {
    sessionStorage.setItem("rc-intro-done", "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-carbon"
          onClick={dismiss}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="rounded-xl border border-line bg-black px-5 py-4">
            <div className="flex gap-3 md:gap-4">
              {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full transition-colors duration-150 md:h-12 md:w-12 ${
                    i < lit ? "bg-rosso glow-rosso" : "bg-neutral-900"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-8 text-2xl font-black uppercase italic tracking-tight md:text-3xl">
            <span className="text-rosso">Ferrari</span> Strategy
          </p>
          <p className="mt-1 font-digits text-[10px] tracking-[0.4em] text-dim">
            ГАСНУТ ОГНИ…
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
