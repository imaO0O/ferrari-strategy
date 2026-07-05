import { useEffect, useRef, useState } from "react";
import PageWrap from "../components/PageWrap";
import { Reveal, KineticTitle, Marquee } from "../components/ui";

/* Реакция на старт: пять огней зажигаются по одному, гаснут после случайной
   паузы — жми как можно быстрее. Клик до того, как огни погасли, — фальстарт. */

const LIGHTS = 5;
const STEP_MS = 900;
const STORAGE_KEY = "fs-reaction-records";
const ATTEMPTS_KEY = "fs-reaction-attempts";

const loadRecords = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

const loadAttempts = () => {
  const n = Number(localStorage.getItem(ATTEMPTS_KEY));
  return Number.isFinite(n) ? n : 0;
};

export default function Game() {
  // idle | arming | armed | go | result | jump
  const [phase, setPhase] = useState("idle");
  const [lit, setLit] = useState(0);
  const [reaction, setReaction] = useState(null);
  const [records, setRecords] = useState(loadRecords);
  const [attempts, setAttempts] = useState(loadAttempts);
  const timers = useRef([]);
  const goAt = useRef(0);
  const stageClickRef = useRef(() => {});

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  // реагировать можно и с клавиатуры — пробел или Enter
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        stageClickRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const bumpAttempts = () => {
    setAttempts((n) => {
      const next = n + 1;
      try {
        localStorage.setItem(ATTEMPTS_KEY, String(next));
      } catch {
        /* приватный режим */
      }
      return next;
    });
  };

  const start = () => {
    clearTimers();
    setReaction(null);
    setLit(0);
    setPhase("arming");
    for (let i = 1; i <= LIGHTS; i++) {
      timers.current.push(setTimeout(() => setLit(i), i * STEP_MS));
    }
    // случайная пауза 0.8–3 с после пятого огня — как у настоящего стартёра
    const hold = LIGHTS * STEP_MS + 800 + Math.random() * 2200;
    timers.current.push(
      setTimeout(() => {
        setPhase("go");
        setLit(0);
        goAt.current = performance.now();
      }, hold),
    );
    timers.current.push(setTimeout(() => setPhase("armed"), LIGHTS * STEP_MS));
  };

  const saveRecord = (ms) => {
    const next = [...records, { ms, date: new Date().toISOString().slice(0, 10) }]
      .sort((a, b) => a.ms - b.ms)
      .slice(0, 10);
    setRecords(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* приватный режим — рекорды не сохранятся */
    }
  };

  const stageClick = () => {
    if (phase === "idle" || phase === "result" || phase === "jump") {
      start();
      return;
    }
    if (phase === "arming" || phase === "armed") {
      clearTimers();
      setLit(0);
      setPhase("jump");
      bumpAttempts();
      return;
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - goAt.current);
      setReaction(ms);
      setPhase("result");
      saveRecord(ms);
      bumpAttempts();
    }
  };
  stageClickRef.current = stageClick;

  const best = records[0]?.ms ?? null;
  const average = records.length
    ? Math.round(records.reduce((s, r) => s + r.ms, 0) / records.length)
    : null;

  const hint = {
    idle: "Нажми или жми ПРОБЕЛ, чтобы начать",
    arming: "Жди, когда погаснут огни…",
    armed: "Жди…",
    go: "ЖМИ!",
    result: "Ещё раз? Клик или ПРОБЕЛ",
    jump: "Фальстарт! Клик или ПРОБЕЛ — заново",
  }[phase];

  return (
    <PageWrap>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-32 md:pt-40">
        <Reveal>
          <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
            <span className="inline-block h-px w-10 bg-giallo" />
            РЕАКЦИЯ НА СТАРТ · У ПИЛОТОВ Ф1 — ОКОЛО 200 МС
          </p>
        </Reveal>
        <h1 className="text-[13vw] font-black uppercase italic leading-[0.85] tracking-tight md:text-[8rem]">
          <KineticTitle text="ИГРА" />
        </h1>
      </section>

      <Marquee
        items={["IT'S LIGHTS OUT", "✦", "AND AWAY WE GO", "✦", "FERRARI STRATEGY", "✦"]}
        speed={24}
        className="-rotate-1 bg-rosso py-3 text-xl font-black uppercase italic text-carbon"
        itemClassName="mx-4"
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[1fr_20rem]">
        {/* сцена */}
        <Reveal>
          <button
            onClick={stageClick}
            className={`relative flex min-h-[28rem] w-full select-none flex-col items-center justify-center gap-10 rounded-xl border transition-colors md:min-h-[32rem] ${
              phase === "go"
                ? "border-rosso bg-rosso/10"
                : phase === "jump"
                  ? "border-giallo bg-giallo/5"
                  : "border-line bg-panel hover:border-rosso/40"
            }`}
            aria-label="Игровая зона: реакция на старт"
          >
            {/* стартовая ферма */}
            <div className="rounded-xl border border-line bg-black px-6 py-5">
              <div className="flex gap-3 md:gap-5">
                {Array.from({ length: LIGHTS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 w-10 rounded-full transition-colors duration-100 md:h-16 md:w-16 ${
                      i < lit ? "bg-rosso glow-rosso" : "bg-neutral-900"
                    }`}
                  />
                ))}
              </div>
            </div>

            {phase === "result" && (
              <p className="font-digits text-6xl font-black text-giallo md:text-8xl">
                {reaction}
                <span className="ml-2 text-2xl text-dim md:text-3xl">мс</span>
              </p>
            )}
            {phase === "jump" && (
              <p className="text-4xl font-black uppercase italic text-giallo md:text-6xl">
                Фальстарт!
              </p>
            )}
            {phase === "go" && (
              <p className="text-4xl font-black uppercase italic text-rosso md:text-6xl">ЖМИ!</p>
            )}

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-dim">{hint}</p>
          </button>
        </Reveal>

        {/* рекорды */}
        <Reveal delay={0.1} className="rounded-xl border border-line bg-panel p-6">
          <h2 className="text-xl font-black uppercase italic">Мои рекорды</h2>
          {best != null && (
            <p className="mt-2 text-sm text-dim">
              Лучшее время: <span className="font-digits text-giallo">{best} мс</span>
              {best < 200 && " — быстрее пилота Ф1! 🏆"}
            </p>
          )}
          {average != null && (
            <p className="mt-1 text-sm text-dim">
              Среднее (топ-10): <span className="font-digits">{average} мс</span> · Попыток:{" "}
              <span className="font-digits">{attempts}</span>
            </p>
          )}
          {records.length === 0 ? (
            <p className="mt-6 text-sm text-dim">
              Пока пусто. Рекорды сохраняются в этом браузере.
            </p>
          ) : (
            <ol className="mt-5 space-y-2">
              {records.map((rec, i) => (
                <li
                  key={`${rec.ms}-${i}`}
                  className="flex items-center gap-3 rounded-md bg-panel2/60 px-3 py-2"
                >
                  <span
                    className={`inline-flex min-w-8 justify-center rounded-md px-1.5 py-0.5 font-digits text-xs font-bold ${
                      i === 0 ? "bg-rosso text-white" : "bg-panel2 text-dim"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 font-digits text-lg">{rec.ms} мс</span>
                  <span className="font-digits text-[10px] text-dim">{rec.date}</span>
                </li>
              ))}
            </ol>
          )}
        </Reveal>
      </section>
    </PageWrap>
  );
}
