import { useEffect, useRef } from "react";

/* Конфетти в цветах итальянского флага (+ rosso и giallo) —
   салют в честь победы Ferrari в последней гонке */
export default function Confetti({ onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = (canvas.width = window.innerWidth * dpr);
    const H = (canvas.height = window.innerHeight * dpr);
    const COLORS = ["#009246", "#f4f5f0", "#ce2b37", "#ff2800", "#ffd400"];
    const parts = Array.from({ length: 170 }, () => ({
      x: Math.random() * W,
      y: -20 * dpr - Math.random() * H * 0.6,
      w: (5 + Math.random() * 6) * dpr,
      h: (9 + Math.random() * 8) * dpr,
      vy: (2.2 + Math.random() * 3.2) * dpr,
      vx: (Math.random() - 0.5) * 1.6 * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.22,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    }));

    let raf;
    const t0 = performance.now();
    const loop = (t) => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.y / (42 * dpr)) * 0.7 * dpr;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t - t0 < 3400) raf = requestAnimationFrame(loop);
      else onDone?.();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[94] h-full w-full"
      aria-hidden
    />
  );
}
