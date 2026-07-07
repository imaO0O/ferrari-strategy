import { useEffect, useRef, useState } from "react";
import { Reveal, SectionTitle } from "./ui";
import { of1 } from "../lib/openf1";

/* Live-карта: контур строится по уже проеханному кругу, машины — точки
   из свежего окна координат, обновление раз в 45 секунд (бережём лимит OpenF1). */

export default function LiveTrackMap({ sessionKey, drivers }) {
  const [outline, setOutline] = useState(null);
  const [cars, setCars] = useState([]);
  const [updated, setUpdated] = useState(null);
  const mapRef = useRef(null);

  // контур трассы: чистый круг пилота Ferrari (или первого попавшегося)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = Object.values(drivers);
        const pilot = (list.find((d) => d.team === "Ferrari") ?? list[0])?.number;
        if (!pilot) return;
        const laps = await of1.laps(sessionKey, pilot);
        const lap = laps.find((l) => l.lap_number >= 2 && l.lap_duration);
        if (!lap) return; // ещё не проехали полный круг — карта появится позже
        const to = new Date(Date.parse(lap.date_start) + (lap.lap_duration + 1) * 1000).toISOString();
        const rows = await of1.locationWindow(sessionKey, lap.date_start, to, pilot);
        const pts = rows.filter((r) => r.x || r.y);
        if (pts.length < 50 || !alive) return;
        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const s = 900 / Math.max(maxX - minX, maxY - minY);
        const offX = (1000 - (maxX - minX) * s) / 2;
        const offY = (1000 - (maxY - minY) * s) / 2;
        mapRef.current = (p) => ({
          X: (p.x - minX) * s + offX,
          Y: 1000 - ((p.y - minY) * s + offY),
        });
        const d =
          pts
            .filter((_, i) => i % 2 === 0)
            .map((p, i) => {
              const m = mapRef.current(p);
              return `${i ? "L" : "M"}${m.X.toFixed(0)} ${m.Y.toFixed(0)}`;
            })
            .join("") + "Z";
        setOutline(d);
      } catch {
        /* без контура карту не показываем */
      }
    })();
    return () => {
      alive = false;
    };
  }, [sessionKey, drivers]);

  // машины: последняя точка каждого пилота из окна в 12 секунд
  useEffect(() => {
    if (!outline) return;
    let alive = true;
    const load = async () => {
      try {
        const from = new Date(Date.now() - 12_000).toISOString();
        const to = new Date().toISOString();
        const rows = await of1.locationWindow(sessionKey, from, to);
        if (!alive || !mapRef.current) return;
        const last = {};
        for (const r of rows) if (r.x || r.y) last[r.driver_number] = r;
        setCars(
          Object.entries(last)
            .map(([n, p]) => ({ n: +n, d: drivers[n], ...mapRef.current(p) }))
            .filter((c) => c.d),
        );
        setUpdated(new Date());
      } catch {
        /* тик пропущен — попробуем через 45 с */
      }
    };
    load();
    const id = setInterval(load, 45_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [outline, sessionKey, drivers]);

  if (!outline) return null;

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle kicker="LA PISTA" title="Машины на трассе" className="mb-4" />
        <p className="mb-8 max-w-2xl text-dim">
          Положение машин на трассе прямо сейчас — снимок раз в 45 секунд
          {updated &&
            ` (обновлено ${updated.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })})`}
          .
        </p>
        <Reveal className="rounded-xl border border-line bg-panel p-4 md:p-8">
          <svg viewBox="0 0 1000 1000" className="mx-auto max-h-[70vh] w-full">
            <path d={outline} fill="none" stroke="#26262c" strokeWidth={16} strokeLinejoin="round" />
            <path d={outline} fill="none" stroke="#3a3a42" strokeWidth={9} strokeLinejoin="round" />
            {cars.map((c) => (
              <g key={c.n} transform={`translate(${c.X},${c.Y})`}>
                <circle
                  r={c.d.team === "Ferrari" ? 12 : 8}
                  fill={c.d.color}
                  stroke="#0a0a0c"
                  strokeWidth={2}
                />
                <text
                  y={-14}
                  textAnchor="middle"
                  fontSize={c.d.team === "Ferrari" ? 22 : 15}
                  fontWeight="700"
                  fill={c.d.team === "Ferrari" ? "#ffd400" : "#8a8a93"}
                >
                  {c.d.acronym}
                </text>
              </g>
            ))}
          </svg>
        </Reveal>
      </div>
    </section>
  );
}
