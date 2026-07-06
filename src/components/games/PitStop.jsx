import { useEffect, useRef, useState } from "react";
import { Reveal } from "../ui";
import ShareButton from "./ShareButton";
import DownloadCardButton from "./DownloadCardButton";

/* Пит-стоп: четыре колеса по очереди. Маркер бегает по шкале — попади
   в зелёную зону по центру. Чем точнее попадание, тем быстрее «открутилась
   гайка». Идеальный пит-стоп — 1.6 с (рекорд Red Bull — 1.82 с). */

const WHEELS = ["Переднее левое", "Переднее правое", "Заднее левое", "Заднее правое"];
const STORAGE_KEY = "fs-pitstop-records";
const ZONE = 0.12; // полуширина зелёной зоны

const loadRecords = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

const wheelTime = (offset) => 0.4 + offset * 2.2; // 0.40 с при идеале, до 2.6 с при промахе

export default function PitStop() {
  // idle | running | done
  const [phase, setPhase] = useState("idle");
  const [wheelIdx, setWheelIdx] = useState(0);
  const [pos, setPos] = useState(0.5);
  const [splits, setSplits] = useState([]);
  const [records, setRecords] = useState(loadRecords);
  const raf = useRef(null);
  const t0 = useRef(0);
  const actionRef = useRef(() => {});

  const stopLoop = () => cancelAnimationFrame(raf.current);
  useEffect(() => stopLoop, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        actionRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runLoop = (speed) => {
    stopLoop();
    t0.current = performance.now();
    const loop = (t) => {
      // маркер бегает туда-сюда; скорость растёт с каждым колесом
      const x = (Math.sin(((t - t0.current) / 1000) * speed) + 1) / 2;
      setPos(x);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };

  const start = () => {
    setSplits([]);
    setWheelIdx(0);
    setPhase("running");
    runLoop(3.2);
  };

  const hit = () => {
    const offset = Math.min(1, Math.abs(pos - 0.5) * 2);
    const time = wheelTime(offset);
    const nextSplits = [...splits, time];
    setSplits(nextSplits);
    if (nextSplits.length === WHEELS.length) {
      stopLoop();
      setPhase("done");
      const total = nextSplits.reduce((s, v) => s + v, 0);
      const next = [...records, { total: +total.toFixed(2), date: new Date().toISOString().slice(0, 10) }]
        .sort((a, b) => a.total - b.total)
        .slice(0, 10);
      setRecords(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* приватный режим */
      }
      return;
    }
    setWheelIdx(nextSplits.length);
    runLoop(3.2 + nextSplits.length * 0.7);
  };

  const action = () => {
    if (phase === "running") hit();
    else start();
  };
  actionRef.current = action;

  const total = splits.reduce((s, v) => s + v, 0);
  const best = records[0]?.total ?? null;
  const inZone = Math.abs(pos - 0.5) * 2 <= ZONE * 2;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <Reveal>
        <button
          onClick={action}
          className={`relative flex min-h-[26rem] w-full select-none flex-col items-center justify-center gap-8 rounded-xl border px-6 transition-colors md:min-h-[30rem] ${
            phase === "running"
              ? inZone
                ? "border-giallo bg-giallo/5"
                : "border-line bg-panel"
              : "border-line bg-panel hover:border-rosso/40"
          }`}
          aria-label="Игровая зона: пит-стоп"
        >
          {phase !== "done" && (
            <>
              <p className="text-[10px] font-bold tracking-[0.4em] text-dim">
                {phase === "running" ? `КОЛЕСО ${wheelIdx + 1} ИЗ 4 · ${WHEELS[wheelIdx]}` : "ПИТ-СТОП ЧЕЛЛЕНДЖ"}
              </p>

              {/* шкала с зелёной зоной и маркером */}
              <div className="relative h-14 w-full max-w-xl overflow-hidden rounded-lg border border-line bg-black">
                <div
                  className="absolute inset-y-0 bg-giallo/25"
                  style={{ left: `${(0.5 - ZONE) * 100}%`, width: `${ZONE * 2 * 100}%` }}
                />
                <div className="absolute inset-y-0 left-1/2 w-px bg-giallo" />
                <div
                  className="absolute inset-y-1 w-2 rounded-sm bg-rosso glow-rosso"
                  style={{ left: `calc(${pos * 100}% - 4px)` }}
                />
              </div>

              {/* сплиты по колёсам */}
              <div className="flex gap-2">
                {WHEELS.map((w, i) => (
                  <span
                    key={w}
                    className={`rounded-md px-2.5 py-1.5 font-digits text-xs font-bold ${
                      splits[i] != null
                        ? splits[i] < 0.7
                          ? "bg-giallo text-carbon"
                          : "bg-panel2 text-white"
                        : i === wheelIdx && phase === "running"
                          ? "bg-rosso text-white"
                          : "bg-panel2 text-dim"
                    }`}
                  >
                    {splits[i] != null ? `${splits[i].toFixed(2)}с` : `К${i + 1}`}
                  </span>
                ))}
              </div>

              <p className="text-sm font-bold uppercase tracking-[0.25em] text-dim">
                {phase === "running"
                  ? "Жми, когда маркер в жёлтой зоне!"
                  : "Клик или ПРОБЕЛ — начать. Смени 4 колеса как можно быстрее"}
              </p>
            </>
          )}

          {phase === "done" && (
            <>
              <p className="text-[10px] font-bold tracking-[0.4em] text-dim">ПИТ-СТОП ЗАВЕРШЁН</p>
              <p className="font-digits text-6xl font-black text-giallo md:text-8xl">
                {total.toFixed(2)}
                <span className="ml-2 text-2xl text-dim md:text-3xl">с</span>
              </p>
              <p className="text-lg font-bold">
                {total < 1.82
                  ? "Быстрее рекорда Red Bull (1.82 с)! Невероятно! 🏆"
                  : total < 2.5
                    ? "Уровень топ-команды. Маранелло аплодирует!"
                    : total < 4
                      ? "Крепкий пит-стоп, но механики Ferrari тренируются каждый день."
                      : "Кажется, гайковёрт заклинило… Ещё попытка?"}
              </p>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-dim">
                Клик или ПРОБЕЛ — ещё раз
              </p>
            </>
          )}
        </button>
      </Reveal>

      <Reveal delay={0.1} className="rounded-xl border border-line bg-panel p-6">
        <h2 className="text-xl font-black uppercase italic">Мои пит-стопы</h2>
        <p className="mt-2 text-sm text-dim">
          Реальный рекорд Ф1 — <span className="font-digits">1.82 с</span> (Red Bull, 2019).
          Идеал в этой игре — <span className="font-digits text-giallo">1.60 с</span>.
        </p>
        {best != null && (
          <p className="mt-1 text-sm text-dim">
            Мой рекорд: <span className="font-digits text-giallo">{best.toFixed(2)} с</span>
          </p>
        )}
        {best != null && (
          <div className="mt-4 flex flex-wrap gap-2">
            <ShareButton text={`Мой пит-стоп: ${best.toFixed(2)} с 🔧`} />
            <DownloadCardButton
              card={{
                label: "Пит-стоп челлендж",
                value: best.toFixed(2),
                unit: "с",
                sub: best < 1.82 ? "Быстрее рекорда Red Bull!" : "Личный рекорд",
              }}
            />
          </div>
        )}
        {records.length === 0 ? (
          <p className="mt-6 text-sm text-dim">Пока пусто. Рекорды сохраняются в этом браузере.</p>
        ) : (
          <ol className="mt-5 space-y-2">
            {records.map((rec, i) => (
              <li
                key={`${rec.total}-${i}`}
                className="flex items-center gap-3 rounded-md bg-panel2/60 px-3 py-2"
              >
                <span
                  className={`inline-flex min-w-8 justify-center rounded-md px-1.5 py-0.5 font-digits text-xs font-bold ${
                    i === 0 ? "bg-rosso text-white" : "bg-panel2 text-dim"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 font-digits text-lg">{rec.total.toFixed(2)} с</span>
                <span className="font-digits text-[10px] text-dim">{rec.date}</span>
              </li>
            ))}
          </ol>
        )}
      </Reveal>
    </div>
  );
}
