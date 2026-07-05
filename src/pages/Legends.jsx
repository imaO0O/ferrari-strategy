import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrap from "../components/PageWrap";
import { Reveal, ImageReveal, KineticTitle, Marquee, EASE } from "../components/ui";
import { commonsFile } from "../lib/images";
import { LEGENDS } from "../data/legends";

function LegendCard({ legend, index, onOpen }) {
  return (
    <Reveal delay={(index % 3) * 0.07}>
      <button
        onClick={() => onOpen(legend)}
        className="group block w-full overflow-hidden rounded-xl border border-line bg-panel text-left transition-colors hover:border-rosso/60"
      >
        <ImageReveal
          src={commonsFile(legend.file, 800)}
          alt={legend.alt}
          className="aspect-[4/3]"
        />
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-digits text-xs text-dim">{legend.years}</p>
            {legend.titles.length > 0 && (
              <span className="-skew-x-12 bg-giallo px-2 py-0.5 font-digits text-[9px] font-bold tracking-[0.2em] text-carbon">
                ЧЕМПИОН ×{legend.titles.length}
              </span>
            )}
          </div>
          <h3 className="mt-2 text-2xl font-black uppercase italic leading-none tracking-tight">
            {legend.name}
          </h3>
          <p className="mt-2 text-sm text-dim">{legend.tagline}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-rosso opacity-0 transition-opacity group-hover:opacity-100">
            Читать досье →
          </p>
        </div>
      </button>
    </Reveal>
  );
}

function LegendModal({ legend, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[92] flex items-center justify-center bg-carbon/85 p-4 backdrop-blur-sm md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="grid max-h-full w-full max-w-4xl overflow-y-auto rounded-xl border border-line bg-panel md:grid-cols-[2fr_3fr]"
        initial={{ y: 48, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 48, scale: 0.97 }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative min-h-64">
          <img
            src={commonsFile(legend.file, 900)}
            alt={legend.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent md:bg-gradient-to-r" />
        </div>

        <div className="relative p-6 md:p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md bg-panel2 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-dim transition-colors hover:text-white"
          >
            Закрыть ✕
          </button>

          <p className="font-digits text-xs text-dim">
            {legend.country} · {legend.years}
          </p>
          <h2 className="mt-2 text-3xl font-black uppercase italic leading-none tracking-tight md:text-4xl">
            {legend.name}
          </h2>
          <p className="mt-2 font-bold text-rosso">{legend.tagline}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {legend.titles.map((year) => (
              <span
                key={year}
                className="-skew-x-12 bg-giallo px-2.5 py-1 font-digits text-[10px] font-bold tracking-[0.2em] text-carbon"
              >
                ЧЕМПИОН {year}
              </span>
            ))}
            <span className="rounded-md bg-panel2 px-2.5 py-1 font-digits text-[10px] tracking-[0.2em] text-dim">
              ПОБЕД ЗА FERRARI: {legend.wins}
            </span>
          </div>

          <p className="mt-6 leading-relaxed text-neutral-200">{legend.bio}</p>

          <div className="mt-6 rounded-lg border border-rosso/30 bg-rosso/5 p-4">
            <p className="text-[9px] font-bold tracking-[0.35em] text-rosso">ФАКТ</p>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-200">{legend.fact}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Legends() {
  const [open, setOpen] = useState(null);
  const champions = LEGENDS.filter((l) => l.titles.length > 0).length;

  return (
    <PageWrap>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-32 md:pt-40">
        <Reveal>
          <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
            <span className="inline-block h-px w-10 bg-giallo" />
            {champions} ЧЕМПИОНОВ МИРА · {LEGENDS.length} ДОСЬЕ
          </p>
        </Reveal>
        <h1 className="text-[13vw] font-black uppercase italic leading-[0.85] tracking-tight md:text-[8rem]">
          <KineticTitle text="ЛЕГЕНДЫ" />
        </h1>
        <Reveal delay={0.4}>
          <p className="mt-6 max-w-xl text-lg text-neutral-200">
            Все чемпионы мира за рулём Ferrari — и пилоты, без которых историю Скудерии
            не рассказать. Нажми на карточку, чтобы открыть досье.
          </p>
        </Reveal>
      </section>

      <Marquee
        items={["I PILOTI", "✦", "DELLA SCUDERIA", "✦", "FERRARI STRATEGY", "✦"]}
        speed={24}
        className="rotate-1 bg-rosso py-3 text-xl font-black uppercase italic text-carbon"
        itemClassName="mx-4"
      />

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LEGENDS.map((legend, i) => (
            <LegendCard key={legend.id} legend={legend} index={i} onOpen={setOpen} />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {open && <LegendModal legend={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </PageWrap>
  );
}
