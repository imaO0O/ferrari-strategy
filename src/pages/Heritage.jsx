import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import PageWrap from "../components/PageWrap";
import { Reveal, ImageReveal, KineticTitle, Marquee } from "../components/ui";
import { commonsFile } from "../lib/images";
import { HERO_IMAGE, TIMELINE } from "../data/heritage";

function DecadeDivider({ decade }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  return (
    <div ref={ref} className="overflow-hidden py-10 md:py-16">
      <motion.p
        style={{ x }}
        className="whitespace-nowrap text-center text-[22vw] font-black italic leading-none text-outline md:text-[11rem]"
      >
        {decade}
      </motion.p>
    </div>
  );
}

function TimelineItem({ item, flip }) {
  return (
    <div className="relative md:grid md:grid-cols-2 md:gap-16">
      {/* red spine dot */}
      <span className="absolute left-1/2 top-10 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-rosso glow-rosso md:block" />

      <div className={`${flip ? "md:order-2" : ""}`}>
        <ImageReveal
          src={commonsFile(item.file, 1100)}
          alt={item.alt}
          className="aspect-[4/3] rounded-xl border border-line"
        />
      </div>

      <div className={`mt-6 md:mt-0 ${flip ? "md:order-1 md:text-right" : ""}`}>
        <Reveal>
          <p className="font-digits text-6xl font-black leading-none text-outline-rosso md:text-8xl">
            {item.year}
          </p>
          {item.badge && (
            <span className="mt-4 inline-block -skew-x-12 bg-giallo px-3 py-1 font-digits text-[10px] font-bold tracking-[0.25em] text-carbon">
              {item.badge}
            </span>
          )}
          <h3 className="mt-4 text-3xl font-black uppercase italic leading-tight tracking-tight md:text-4xl">
            {item.title}
          </h3>
          <p className={`mt-4 max-w-lg leading-relaxed text-dim ${flip ? "md:ml-auto" : ""}`}>
            {item.text}
          </p>
        </Reveal>
      </div>
    </div>
  );
}

export default function Heritage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);

  let lastDecade = null;

  return (
    <PageWrap>
      {/* HERO */}
      <section ref={heroRef} className="relative flex h-[92vh] min-h-[560px] items-end overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img
            src={commonsFile(HERO_IMAGE.file, 1800)}
            alt={HERO_IMAGE.alt}
            className="ken-burns h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-carbon/20" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16">
          <Reveal>
            <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
              <span className="inline-block h-px w-10 bg-giallo" />
              С 1947 ГОДА · LA STORIA DELLA SCUDERIA
            </p>
          </Reveal>
          <h1 className="text-[15vw] font-black uppercase italic leading-[0.82] tracking-tight md:text-[10rem]">
            <KineticTitle text="ИСТОРИЯ" />
          </h1>
          <Reveal delay={0.5}>
            <p className="mt-6 max-w-xl text-lg text-neutral-200">
              Почти восемь десятилетий побед, драм и страсти — история самого знаменитого
              имени в автоспорте в {TIMELINE.length} моментах.
            </p>
          </Reveal>
        </div>
      </section>

      <Marquee
        items={["LA STORIA", "✦", "MARANELLO", "✦", "SINCE 1947", "✦", "ROSSO CORSA", "✦"]}
        speed={24}
        reverse
        className="rotate-1 bg-rosso py-3 text-xl font-black uppercase italic text-carbon"
        itemClassName="mx-4"
      />

      {/* TIMELINE */}
      <section className="relative mx-auto max-w-7xl px-5 py-20 md:py-28">
        {/* central spine */}
        <span className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-rosso/40 to-transparent md:block" />

        <div className="space-y-24 md:space-y-32">
          {TIMELINE.map((item, i) => {
            const showDecade = item.decade !== lastDecade;
            lastDecade = item.decade;
            return (
              <div key={item.year + item.title}>
                {showDecade && <DecadeDivider decade={item.decade} />}
                <TimelineItem item={item} flip={i % 2 === 1} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ФИНАЛ */}
      <section className="border-t border-line">
        <Link to="/" className="group block overflow-hidden py-20 text-center md:py-28">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.4em] text-dim">
              ИСТОРИЯ ПРОДОЛЖАЕТСЯ КАЖДЫЙ ГОНОЧНЫЙ УИК-ЭНД
            </p>
            <p className="mt-4 text-5xl font-black uppercase italic tracking-tight text-outline transition-all duration-500 group-hover:text-rosso group-hover:[-webkit-text-stroke:0px] md:text-8xl">
              В Скудерию →
            </p>
          </Reveal>
        </Link>
      </section>
    </PageWrap>
  );
}
