import { useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1];

/* Fade-and-rise on scroll into view — snappier than before */
export function Reveal({ children, delay = 0, y = 20, className = "", once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
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
        <p className="mb-2 flex items-center gap-3 font-digits text-[11px] tracking-[0.3em] text-rosso">
          <span className="inline-block h-px w-8 bg-rosso" />
          {kicker}
        </p>
      )}
      <h2 className="text-3xl font-black uppercase italic leading-none tracking-tight md:text-5xl">
        {title}
      </h2>
    </Reveal>
  );
}

/* Компактный хедер утилитарных страниц: плотный, данные ближе к первому
   экрану. Кикер-хайрлайн, средний заголовок, опциональный контрол справа
   и подзаголовок. Главная и «История» сохраняют свой большой hero. */
export function PageHead({ kicker, title, lead, right, children, className = "" }) {
  return (
    <section className={`relative mx-auto max-w-7xl px-5 pb-6 pt-28 md:pt-32 ${className}`}>
      {kicker && (
        <Reveal>
          <p className="mb-2 flex items-center gap-3 font-digits text-[11px] tracking-[0.3em] text-rosso">
            <span className="inline-block h-px w-8 bg-rosso" />
            {kicker}
          </p>
        </Reveal>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <Reveal>
          <h1 className="text-4xl font-black uppercase italic leading-[0.9] tracking-tight md:text-6xl">
            {title}
          </h1>
        </Reveal>
        {right && <Reveal delay={0.05}>{right}</Reveal>}
      </div>
      {lead && (
        <Reveal delay={0.08}>
          <p className="mt-3 max-w-2xl text-dim">{lead}</p>
        </Reveal>
      )}
      {children}
    </section>
  );
}

/* Единый ряд вкладок */
export function TabBar({ tabs, active, onSelect, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          aria-pressed={active === id}
          className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition-colors ${
            active === id
              ? "bg-rosso text-white"
              : "border border-line bg-panel/60 text-dim hover:border-line hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* Показатель «значение + подпись». accent — только для действительно
   важных чисел (лидер, рекорд, «моё»); по умолчанию нейтральный белый. */
export function Stat({ value, label, accent = false, className = "" }) {
  return (
    <div className={`border-l-2 border-line pl-4 ${className}`}>
      <span
        className={`block font-digits text-3xl font-bold md:text-4xl ${
          accent ? "text-giallo" : "text-white"
        }`}
      >
        {value}
      </span>
      <p className="mt-1 text-[9px] font-bold tracking-[0.3em] text-dim">{label}</p>
    </div>
  );
}
