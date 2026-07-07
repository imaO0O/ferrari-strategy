import { useMemo } from "react";
import { Reveal, SectionTitle } from "./ui";

/* «История гонки»: отставание от лидера по кругам. Строится по времени
   пересечения линии старта (date_start каждого круга из OpenF1 /laps) —
   видно обгоны, пит-стопы и то, как ковалась победа. */

const W = 860;
const H = 380;
const PAD = 46;

export default function RaceStory({ laps, drivers, finishOrder }) {
  const chart = useMemo(() => {
    if (!laps?.length) return null;

    // время начала каждого круга по пилотам
    const byDriver = {};
    for (const l of laps) {
      if (!l.date_start) continue;
      (byDriver[l.driver_number] ??= {})[l.lap_number] = Date.parse(l.date_start);
    }

    const maxLap = Math.max(...laps.map((l) => l.lap_number));
    // лидерское время на каждом круге
    const leaderAt = {};
    for (let lap = 1; lap <= maxLap; lap++) {
      const times = Object.values(byDriver)
        .map((m) => m[lap])
        .filter(Boolean);
      if (times.length) leaderAt[lap] = Math.min(...times);
    }

    // топ-10 финишёров + Ferrari всегда
    const shown = finishOrder
      .filter((n, i) => i < 10 || drivers[n]?.team === "Ferrari")
      .filter((n) => byDriver[n]);

    // потолок графика: гэп замыкающего из топ-10 на финише, минимум 30 с
    const lastLapGaps = shown
      .map((n) => {
        const lap = Math.max(...Object.keys(byDriver[n]).map(Number));
        return (byDriver[n][lap] - (leaderAt[lap] ?? byDriver[n][lap])) / 1000;
      })
      .sort((a, b) => a - b);
    const cap = Math.max(30, Math.ceil((lastLapGaps[Math.min(9, lastLapGaps.length - 1)] ?? 30) * 1.15));

    const x = (lap) => PAD + ((lap - 1) / Math.max(maxLap - 1, 1)) * (W - PAD * 2);
    const y = (gap) => PAD + (Math.min(gap, cap) / cap) * (H - PAD * 2);

    const series = shown.map((n) => {
      const pts = [];
      for (let lap = 1; lap <= maxLap; lap++) {
        const t = byDriver[n][lap];
        if (!t || !leaderAt[lap]) continue;
        pts.push(`${x(lap).toFixed(1)},${y((t - leaderAt[lap]) / 1000).toFixed(1)}`);
      }
      return { n, d: drivers[n], pts: pts.join(" ") };
    });

    const gridGaps = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(cap * f));
    const tickStep = Math.max(1, Math.ceil(maxLap / 10));
    return { series, gridGaps, cap, maxLap, x, y, tickStep };
  }, [laps, drivers, finishOrder]);

  if (!chart) return null;

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle kicker="IL RACCONTO" title="История гонки" className="mb-4" />
        <p className="mb-8 max-w-2xl text-dim">
          Отставание от лидера круг за кругом: резкий скачок вверх — пит-стоп,
          пересечение линий — обгон. Показаны первая десятка и пилоты Ferrari.
        </p>

        <Reveal className="rounded-xl border border-line bg-panel p-4 md:p-8">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="График гэпов гонки">
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
            {chart.series.map(({ n, d, pts }) => (
              <polyline
                key={n}
                points={pts}
                fill="none"
                stroke={d?.color ?? "#8a8a93"}
                strokeWidth={d?.team === "Ferrari" ? 3.2 : 1.8}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={d?.team === "Ferrari" ? 1 : 0.75}
              />
            ))}
          </svg>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
            {chart.series.map(({ n, d }) => (
              <span key={n} className="flex items-center gap-1.5 font-digits text-[11px] font-bold" style={{ color: d?.color ?? "#8a8a93" }}>
                <span className="inline-block h-2 w-4 rounded-sm" style={{ background: d?.color ?? "#8a8a93" }} />
                {d?.acronym ?? n}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
