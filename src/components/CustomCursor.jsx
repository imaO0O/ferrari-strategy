import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/* Точка + инерционное кольцо вместо системного курсора (только для мыши).
   Кольцо растёт над ссылками и кнопками. */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 24, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 24, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e) => setHot(Boolean(e.target.closest("a, button")));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[96] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rosso"
        style={{ x, y }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[95] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 mix-blend-difference"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hot ? 2 : 1, opacity: hot ? 0.9 : 0.6 }}
        transition={{ duration: 0.25 }}
      />
    </>
  );
}
