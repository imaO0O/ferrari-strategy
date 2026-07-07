import { useMemo, useRef, useState } from "react";
import { Reveal, SectionTitle } from "./ui";

/* Сравнение темпа двух пилотов: времена кругов друг против друга.
   Данные уже загружены (все круги сессии), запросов не требуется. */

const W = 860;
const H = 340;
const PAD = 48;
const A_COLOR = "#ff2800";
const B_COLOR = "#ffd400";

export default function LapCompare({ laps, drivers, finishOrder }) {
  const withLaps = finishOrder.filter((n) =>
    laps.some((l) => l.driver_number === n && l.lap_duration),
  );
  const ferrari = withLaps.filter((n) => drivers[n]?.team === "Ferrari");
  const [a, setA] = useState(ferrari[0] ?? withLaps[0]);
  const [b, setB] = useState(ferrari[1] ?? withLaps.find((n) => n !== (ferrari[0] ?? withLaps[0])));
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);

  const chart = useMemo(() => {
    if (a == null || b == null) return null;
    const times = (n) => {
      const m = {};
      for (const l of laps) {
        if (l.driver_number === n && l.lap_duration) m[l.lap_number] = l.lap_duration;
      }
      return m;
    };
    const ta = times(a);
    const tb = times(b);
    const lapsNums = [...new Set([...Object.keys(ta), ...Object.keys(tb)].map(Number))].sort(
      (x, y) => x - y,
    );
    if (!lapsNums.length) return null;

    // потолок по медиане, чтобы пит-стопы не плющили график
    const all = [...Object.values(ta), ...Object.values(tb)].sort((x, y) => x - y);
    const median = all[Math.floor(all.length / 2)];
    const lo = Math.floor(all[0]);
    const hi = Math.ceil(median * 1.12);

    const maxLap = lapsNums.at(-1);
    const x = (lap) => PAD + ((lap - 1) / Math.max(maxLap - 1, 1)) * (W - PAD * 2);
    const y = (t) => PAD + ((Math.min(t, hi) - lo) / (hi - lo)) * (H - PAD * 2);
    const line = (m) =>
      lapsNums
        .filter((l) => m[l])
        .map((l) => `${x(l).toFixed(1)},${y(m[l]).toFixed(1)}`)
        .join(" ");

    return { ta, tb, lapsNums, maxLap, lo, hi, x, y, lineA: line(ta), lineB: line(tb) };
  }, [a, b, laps]);

  if (!chart || withLaps.length < 2) return null;

  const fmt = (t) => (t == null ? "—" : `${Math.floor(t / 60)}:${(t % 60).toFixed(3).padStart(6, "0")}`);
  const onMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const lap = Math.round(1 + ((ratio * W - PAD) / (W - PAD * 2)) * (chart.maxLap - 1));
    setHover(lap >= 1 && lap <= chart.maxLap ? { lap, ratio } : null);
  };

  const Select = ({ value, onChange, exclude }) => (
    <select
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      className="rounded-md border border-line bg-panel px-3 py-2 font-bold uppercase tracking-wide outline-none transition-colors focus:border-rosso"
    >
      {withLaps
        .filter((n) => n !== exclude)
        .map((n) => (
          <option key={n} value={n}>
            {drivers[n]?.acronym ?? n} · {drivers[n]?.team ?? ""}
          </option>
        ))}
    </select>
  );

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle kicker="PASSO GARA" title="Сравнение темпа" className="mb-4" />
        <p className="mb-6 max-w-2xl text-dim">
          Времена кругов двух пилотов друг против друга. Всплески — пит-стопы и трафик,
          они обрезаны сверху, чтобы читался чистый темп.
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="h-3 w-6 rounded-sm" style={{ background: A_COLOR }} />
          <Select value={a} onChange={setA} exclude={b} />
          <span className="font-black italic text-dim">VS</span>
          <span className="h-3 w-6 rounded-sm" style={{ background: B_COLOR }} />
          <Select value={b} onChange={setB} exclude={a} />
        </div>

        <Reveal className="relative rounded-xl border border-line bg-panel p-4 md:p-8">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          >
            {[0, 0.5, 1].map((f) => {
              const t = chart.lo + (chart.hi - chart.lo) * f;
              return (
                <g key={f}>
                  <line x1={PAD} x2={W - PAD} y1={chart.y(t)} y2={chart.y(t)} stroke="#26262c" />
                  <text x={PAD - 8} y={chart.y(t) + 4} textAnchor="end" fontSize="11" fill="#8a8a93">
                    {fmt(Math.round(t * 10) / 10).slice(0, 6)}
                  </text>
                </g>
              );
            })}
            {hover && (
              <line
                x1={chart.x(hover.lap)}
                x2={chart.x(hover.lap)}
                y1={PAD}
                y2={H - PAD}
                stroke="#8a8a93"
                strokeDasharray="4 4"
              />
            )}
            <polyline points={chart.lineA} fill="none" stroke={A_COLOR} strokeWidth="2.5" strokeLinejoin="round" />
            <polyline points={chart.lineB} fill="none" stroke={B_COLOR} strokeWidth="2.5" strokeLinejoin="round" />
          </svg>

          {hover && (
            <div
              className="pointer-events-none absolute top-6 z-10 rounded-lg border border-line bg-carbon/95 px-3 py-2 backdrop-blur"
              style={{ left: `min(max(${(hover.ratio * 100).toFixed(1)}%, 8%), 74%)` }}
            >
              <p className="mb-1 font-digits text-[10px] tracking-widest text-dim">КРУГ {hover.lap}</p>
              <p className="font-digits text-xs" style={{ color: A_COLOR }}>
                {drivers[a]?.acronym}: {fmt(chart.ta[hover.lap])}
              </p>
              <p className="font-digits text-xs" style={{ color: B_COLOR }}>
                {drivers[b]?.acronym}: {fmt(chart.tb[hover.lap])}
              </p>
              {chart.ta[hover.lap] && chart.tb[hover.lap] && (
                <p className="mt-1 font-digits text-xs text-dim">
                  Δ {(chart.ta[hover.lap] - chart.tb[hover.lap]).toFixed(3)}с
                </p>
              )}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
