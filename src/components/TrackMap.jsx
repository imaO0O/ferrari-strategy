import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal, SectionTitle } from "./ui";
import { of1 } from "../lib/openf1";

/* Карта трассы: контур рисуется по реальной траектории круга Ferrari,
   машины — точки в цветах команд, движущиеся по координатам OpenF1.
   Данные /location очень тяжёлые, поэтому реплей работает отрезками
   по WINDOW_S секунд, которые загружаются по запросу. */

const WINDOW_S = 150;
const PAD = 40;
const VIEW = 1000;

const fmtSeg = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export default function TrackMap({ session, drivers }) {
  // idle → base (круги+контур) → seg-loading → ready | error
  const [status, setStatus] = useState("idle");
  const [outline, setOutline] = useState(null);
  const [laps, setLaps] = useState(null);
  const [segOffset, setSegOffset] = useState(0);
  const [points, setPoints] = useState(null);
  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(null);
  const last = useRef(0);

  const ferrariNum =
    Object.values(drivers).find((d) => d.team === "Ferrari")?.number ??
    Object.values(drivers)[0]?.number;

  const raceStart = laps?.length ? Date.parse(laps[0].date_start) : null;
  const raceLenS = useMemo(() => {
    if (!laps?.length) return 0;
    const lastLap = laps.at(-1);
    return (Date.parse(lastLap.date_start) + (lastLap.lap_duration ?? 100) * 1000 - raceStart) / 1000;
  }, [laps, raceStart]);

  /* Шаг 1 по клику: круги Ferrari → контур трассы по чистому кругу → стартовый отрезок */
  const init = async () => {
    setStatus("base-loading");
    try {
      const lapRows = await of1.laps(session.session_key, ferrariNum);
      if (!lapRows?.length) throw new Error("нет кругов");
      setLaps(lapRows);
      const clean = lapRows.find((l) => l.lap_number >= 3 && l.lap_duration) ?? lapRows[0];
      const from = clean.date_start;
      const to = new Date(Date.parse(from) + ((clean.lap_duration ?? 100) + 1) * 1000).toISOString();
      const rows = await of1.locationWindow(session.session_key, from, to, ferrariNum);
      const pts = rows.filter((r) => r.x !== 0 || r.y !== 0);
      if (pts.length < 50) throw new Error("мало точек контура");
      setOutline(pts.map((r) => ({ x: r.x, y: r.y })));
      await loadSegment(0, Date.parse(lapRows[0].date_start));
    } catch {
      setStatus("error");
    }
  };

  const loadSegment = async (offsetS, startMs = raceStart) => {
    setStatus("seg-loading");
    setPlaying(false);
    setClock(0);
    setSegOffset(offsetS);
    try {
      const from = new Date(startMs + offsetS * 1000).toISOString();
      const to = new Date(startMs + (offsetS + WINDOW_S) * 1000).toISOString();
      const rows = await of1.locationWindow(session.session_key, from, to);
      const byDriver = {};
      for (const r of rows) {
        if (r.x === 0 && r.y === 0) continue;
        (byDriver[r.driver_number] ??= []).push({ t: Date.parse(r.date), x: r.x, y: r.y });
      }
      for (const arr of Object.values(byDriver)) arr.sort((a, b) => a.t - b.t);
      if (!Object.keys(byDriver).length) throw new Error("нет координат");
      setPoints({ byDriver, t0: startMs + offsetS * 1000 });
      setStatus("ready");
      setPlaying(true);
    } catch {
      setStatus("error");
    }
  };

  /* воспроизведение */
  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const loop = (t) => {
      const dt = t - last.current;
      last.current = t;
      setClock((c) => {
        const next = c + dt;
        if (next >= WINDOW_S * 1000) {
          setPlaying(false);
          return WINDOW_S * 1000;
        }
        return next;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  /* нормализация координат трассы в квадрат VIEW×VIEW */
  const view = useMemo(() => {
    if (!outline?.length) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of outline) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const s = (VIEW - PAD * 2) / Math.max(maxX - minX, maxY - minY);
    const ox = (VIEW - (maxX - minX) * s) / 2;
    const oy = (VIEW - (maxY - minY) * s) / 2;
    const map = (p) => ({
      X: (p.x - minX) * s + ox,
      Y: VIEW - ((p.y - minY) * s + oy),
    });
    const d =
      outline
        .map((p, i) => {
          const { X, Y } = map(p);
          return `${i ? "L" : "M"}${X.toFixed(1)},${Y.toFixed(1)}`;
        })
        .join(" ") + " Z";
    return { map, d };
  }, [outline]);

  /* позиции машин на текущий момент (линейная интерполяция между сэмплами) */
  const cars = useMemo(() => {
    if (!points || !view) return [];
    const tNow = points.t0 + clock;
    return Object.entries(points.byDriver)
      .map(([n, arr]) => {
        const d = drivers[n];
        if (!d || !arr.length) return null;
        let i = arr.findIndex((p) => p.t > tNow);
        if (i === -1) i = arr.length;
        const a = arr[Math.max(0, i - 1)];
        const b = arr[Math.min(arr.length - 1, i)];
        const f = b.t === a.t ? 0 : Math.min(1, Math.max(0, (tNow - a.t) / (b.t - a.t)));
        const { X, Y } = view.map({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
        return { n, d, X, Y };
      })
      .filter(Boolean)
      // Ferrari поверх остальных
      .sort((a, b) => (a.d.team === "Ferrari") - (b.d.team === "Ferrari"));
  }, [points, clock, view, drivers]);

  const segments = raceLenS
    ? [
        { label: "Старт", offset: 0 },
        { label: "Середина", offset: Math.max(0, Math.round(raceLenS / 2 - WINDOW_S / 2)) },
        { label: "Финиш", offset: Math.max(0, Math.round(raceLenS - WINDOW_S)) },
      ]
    : [];

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle kicker="LA PISTA" title="Карта трассы" className="mb-4" />
        <p className="mb-10 max-w-2xl text-dim">
          Контур — реальная траектория круга Ferrari, точки — все машины по координатам
          OpenF1. Реплей идёт отрезками по {fmtSeg(WINDOW_S)} мин: координаты слишком
          тяжёлые, чтобы грузить гонку целиком.
        </p>

        {status === "idle" && (
          <Reveal>
            <button
              onClick={init}
              className="rounded-md bg-rosso px-8 py-4 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
            >
              Показать карту →
            </button>
          </Reveal>
        )}

        {(status === "base-loading" || status === "seg-loading") && (
          <div className="h-[28rem] animate-pulse rounded-xl bg-panel" />
        )}

        {status === "error" && (
          <div>
            <p className="text-dim">
              Не удалось загрузить координаты — вероятно, лимит запросов OpenF1. Подожди
              минуту и попробуй ещё раз.
            </p>
            <button
              onClick={init}
              className="mt-4 rounded-md bg-rosso px-6 py-3 text-sm font-black uppercase tracking-widest"
            >
              Повторить
            </button>
          </div>
        )}

        {status === "ready" && view && (
          <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
            {/* управление */}
            <Reveal className="h-fit rounded-xl border border-line bg-panel p-6 lg:sticky lg:top-24">
              <p className="font-digits text-4xl font-bold tabular-nums text-giallo">
                {fmtSeg(segOffset + clock / 1000)}
              </p>
              <p className="mt-1 text-[10px] font-bold tracking-[0.35em] text-dim">
                ВРЕМЯ ГОНКИ · ОТРЕЗОК {fmtSeg(segOffset)}–{fmtSeg(segOffset + WINDOW_S)}
              </p>

              <button
                onClick={() => {
                  if (clock >= WINDOW_S * 1000) setClock(0);
                  setPlaying((p) => !p);
                }}
                className="mt-6 rounded-md bg-rosso px-6 py-3 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
              >
                {playing ? "Пауза" : clock >= WINDOW_S * 1000 ? "Сначала" : "Пуск"}
              </button>

              <input
                type="range"
                min={0}
                max={WINDOW_S * 1000}
                value={clock}
                onChange={(e) => setClock(+e.target.value)}
                className="mt-6 w-full accent-rosso"
                aria-label="Перемотка отрезка"
              />

              <p className="mt-6 text-[10px] font-bold tracking-[0.35em] text-dim">ОТРЕЗОК ГОНКИ</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {segments.map(({ label, offset }) => (
                  <button
                    key={label}
                    onClick={() => loadSegment(offset)}
                    className={`rounded-md px-3 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                      segOffset === offset ? "bg-rosso text-white" : "bg-panel2 text-dim hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Reveal>

            {/* сама карта */}
            <Reveal className="rounded-xl border border-line bg-panel p-4">
              <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="mx-auto max-h-[70vh] w-full">
                <path d={view.d} fill="none" stroke="#26262c" strokeWidth={18} strokeLinejoin="round" />
                <path d={view.d} fill="none" stroke="#3c3c46" strokeWidth={10} strokeLinejoin="round" />
                {cars.map(({ n, d, X, Y }) => {
                  const isFerrari = d.team === "Ferrari";
                  return (
                    <g key={n} transform={`translate(${X.toFixed(1)},${Y.toFixed(1)})`}>
                      <circle
                        r={isFerrari ? 12 : 8}
                        fill={d.color}
                        stroke="#0a0a0c"
                        strokeWidth={2.5}
                      />
                      <text
                        y={-16}
                        textAnchor="middle"
                        fontSize={isFerrari ? 26 : 17}
                        fontWeight="700"
                        fill={isFerrari ? "#ffd400" : "#8a8a93"}
                        style={{ fontFamily: "Orbitron, 'Exo 2', sans-serif" }}
                      >
                        {d.acronym}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
