import { useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1];

/* Fade-and-rise on scroll into view */
export function Reveal({ children, delay = 0, y = 28, className = "", once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* Image that un-clips and settles from a slight zoom; keeps zooming subtly on hover */
export function ImageReveal({ src, alt, className = "", imgClassName = "" }) {
  return (
    <div className={`group overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] ${imgClassName}`}
        initial={{ scale: 1.18, clipPath: "inset(12% 0% 12% 0%)" }}
        whileInView={{ scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.1, ease: EASE }}
      />
    </div>
  );
}

/* Big display word with letters rising in one by one.
   The in-view trigger must live on the (unclipped) parent: the letters start
   translated below the overflow-hidden box, so their own visible area is 0
   and IntersectionObserver never fires for them. */
export function KineticTitle({ text, className = "", delay = 0 }) {
  return (
    <motion.span
      className={`inline-flex overflow-hidden ${className}`}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{
        show: { transition: { staggerChildren: 0.045, delayChildren: delay } },
      }}
    >
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          variants={{
            hidden: { y: "112%" },
            show: { y: 0, transition: { duration: 0.8, ease: EASE } },
          }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* Number that counts up when scrolled into view */
export function Counter({ value, className = "", duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || value == null) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("en-US");
      },
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {value == null ? "—" : "0"}
    </span>
  );
}

/* Endless horizontal ticker */
export function Marquee({ items, speed = 28, reverse = false, className = "", itemClassName = "" }) {
  const sequence = (
    <span className="inline-flex shrink-0 items-center">
      {Array.from({ length: 6 }).flatMap((_, r) =>
        items.map((item, i) => (
          <span key={`${r}-${i}`} className={`inline-flex items-center ${itemClassName}`}>
            {item}
          </span>
        )),
      )}
    </span>
  );
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="marquee-track"
        style={{
          "--marquee-speed": `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {sequence}
        <span aria-hidden>{sequence}</span>
      </div>
    </div>
  );
}

/* Section heading with a red slash accent */
export function SectionTitle({ kicker, title, className = "" }) {
  return (
    <Reveal className={className}>
      {kicker && (
        <p className="mb-2 flex items-center gap-3 font-digits text-xs tracking-[0.35em] text-rosso">
          <span className="inline-block h-px w-10 bg-rosso" />
          {kicker}
        </p>
      )}
      <h2 className="text-4xl font-black uppercase italic leading-none tracking-tight md:text-6xl">
        {title}
      </h2>
    </Reveal>
  );
}
