import { useMemo, useRef, useState } from "react";
import { Reveal, SectionTitle } from "./ui";
import { loadFav, isFavOpenF1 } from "../lib/favorite";

/* «История гонки»: отставание от лидера по кругам. Интерактив: наведение —
   вертикальный курсор и тултип с гэпами, клик по пилоту в легенде —
   изоляция его линии. */

const W = 860;
const H = 380;
const PAD = 46;

export default function RaceStory({ laps, drivers, finishOrder }) {
  const [hover, setHover] = useState(null); // { lap, px }
  const [focus, setFocus] = useState(null); // driver_number | null
  const svgRef = useRef(null);
  const fav = loadFav();

  const chart = useMemo(() => {
    if (!laps?.length) return null;

    const byDriver = {};
    for (const l of laps) {
      if (!l.date_start) continue;
      (byDriver[l.driver_number] ??= {})[l.lap_number] = Date.parse(l.date_start);
    }

    const maxLap = Math.max(...laps.map((l) => l.lap_number));
    const leaderAt = {};
    for (let lap = 1; lap <= maxLap; lap++) {
      const times = Object.values(byDriver)
        .map((m) => m[lap])
        .filter(Boolean);
      if (times.length) leaderAt[lap] = Math.min(...times);
    }

    const shown = finishOrder
      .filter((n, i) => i < 10 || drivers[n]?.team === "Ferrari")
      .filter((n) => byDriver[n]);

    const lastLapGaps = shown
      .map((n) => {
        const lap = Math.max(...Object.keys(byDriver[n]).map(Number));
        return (byDriver[n][lap] - (leaderAt[lap] ?? byDriver[n][lap])) / 1000;
      })
      .sort((a, b) => a - b);
    const cap = Math.max(30, Math.ceil((lastLapGaps[Math.min(9, lastLapGaps.length - 1)] ?? 30) * 1.15));

    const x = (lap) => PAD + ((lap - 1) / Math.max(maxLap - 1, 1)) * (W - PAD * 2);
    const y = (gap) => PAD + (Math.min(gap, cap) / cap) * (H - PAD * 2);

    const gaps = {}; // n -> {lap: gapSeconds}
    const series = shown.map((n) => {
      const pts = [];
      gaps[n] = {};
      for (let lap = 1; lap <= maxLap; lap++) {
        const t = byDriver[n][lap];
        if (!t || !leaderAt[lap]) continue;
        const gap = (t - leaderAt[lap]) / 1000;
        gaps[n][lap] = gap;
        pts.push(`${x(lap).toFixed(1)},${y(gap).toFixed(1)}`);
      }
      return { n, d: drivers[n], pts: pts.join(" ") };
    });

    const gridGaps = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(cap * f));
    const tickStep = Math.max(1, Math.ceil(maxLap / 10));
    return { series, gaps, gridGaps, cap, maxLap, x, y, tickStep };
  }, [laps, drivers, finishOrder]);

  if (!chart) return null;

  const onMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const px = ratio * W;
    const lap = Math.round(1 + ((px - PAD) / (W - PAD * 2)) * (chart.maxLap - 1));
    if (lap < 1 || lap > chart.maxLap) {
      setHover(null);
      return;
    }
    setHover({ lap, ratio });
  };

  const tooltipRows = hover
    ? chart.series
        .map(({ n, d }) => ({ n, d, gap: chart.gaps[n][hover.lap] }))
        .filter((r) => r.gap != null)
        .sort((a, b) => a.gap - b.gap)
        .slice(0, 8)
    : [];

  const emphasis = (n, d) => {
    if (focus != null) return focus === n ? 1 : 0.1;
    return d?.team === "Ferrari" || isFavOpenF1(fav, d) ? 1 : 0.75;
  };

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle kicker="IL RACCONTO" title="История гонки" className="mb-4" />
        <p className="mb-8 max-w-2xl text-dim">
          Отставание от лидера круг за кругом: скачок вверх — пит-стоп, пересечение линий —
          обгон. Наведи курсор на график, кликни по пилоту в легенде — изолируешь его линию.
        </p>

        <Reveal className="relative rounded-xl border border-line bg-panel p-4 md:p-8">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label="График гэпов гонки"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          >
            {chart.gridGaps.map((g) => (
              <g key={g}>
                <line x1={PAD} x2={W - PAD} y1={chart.y(g)} y2={chart.y(g)} stroke="#26262c" strokeWidth="1" />
                <text x={PAD - 8} y={chart.y(g) + 4} textAnchor="end" fontSize="11" fill="#8a8a93">
                  {g === chart.cap ? `${g}с+` : `${g}с`}
                </text>
              </g>
            ))}
            {Array.from({ length: chart.maxLap }, (_, i) => i + 1)
              .filter((l) => l === 1 || l % chart.tickStep === 0)
              .map((l) => (
                <text key={l} x={chart.x(l)} y={H - PAD + 24} textAnchor="middle" fontSize="11" fill="#8a8a93">
                  {l}
                </text>
              ))}
            {hover && (
              <line
                x1={chart.x(hover.lap)}
                x2={chart.x(hover.lap)}
                y1={PAD}
                y2={H - PAD}
                stroke="#8a8a93"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            )}
            {chart.series.map(({ n, d, pts }) => (
              <polyline
                key={n}
                points={pts}
                fill="none"
                stroke={d?.color ?? "#8a8a93"}
                strokeWidth={focus === n || d?.team === "Ferrari" ? 3.2 : 1.8}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={emphasis(n, d)}
              />
            ))}
          </svg>

          {hover && tooltipRows.length > 0 && (
            <div
              className="pointer-events-none absolute top-6 z-10 rounded-lg border border-line bg-carbon/95 px-3 py-2 backdrop-blur"
              style={{
                left: `min(max(${(hover.ratio * 100).toFixed(1)}%, 8%), 78%)`,
              }}
            >
              <p className="mb-1 font-digits text-[10px] tracking-widest text-dim">
                КРУГ {hover.lap}
              </p>
              {tooltipRows.map(({ n, d, gap }) => (
                <p key={n} className="flex items-center gap-2 font-digits text-xs">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: d?.color ?? "#8a8a93" }} />
                  <span className="w-9 font-bold">{d?.acronym ?? n}</span>
                  <span className="text-dim">{gap === 0 ? "лидер" : `+${gap.toFixed(1)}с`}</span>
                </p>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
            {chart.series.map(({ n, d }) => (
              <button
                key={n}
                onClick={() => setFocus(focus === n ? null : n)}
                className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-digits text-[11px] font-bold transition-opacity ${
                  focus != null && focus !== n ? "opacity-30" : ""
                } ${focus === n ? "bg-panel2" : ""}`}
                style={{ color: d?.color ?? "#8a8a93" }}
              >
                <span className="inline-block h-2 w-4 rounded-sm" style={{ background: d?.color ?? "#8a8a93" }} />
                {d?.acronym ?? n}
              </button>
            ))}
            {focus != null && (
              <button
                onClick={() => setFocus(null)}
                className="rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-dim hover:text-white"
              >
                Сбросить
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
