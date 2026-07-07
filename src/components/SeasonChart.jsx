import { useRef, useState } from "react";
import { teamColor } from "../lib/i18n";

/* Накопление очков по этапам: Ferrari против двух ближайших соперников.
   Наведение — курсор и тултип с очками на выбранном этапе. */
export default function SeasonChart({ series }) {
  const W = 800;
  const H = 320;
  const PAD = 44;
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null); // { round, ratio }

  const maxRound = Math.max(...series.flatMap((s) => s.rounds), 2);
  const maxPts = Math.max(...series.flatMap((s) => s.points), 10);
  const x = (r) => PAD + ((r - 1) / Math.max(maxRound - 1, 1)) * (W - PAD * 2);
  const y = (p) => H - PAD - (p / maxPts) * (H - PAD * 2);

  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => Math.round(maxPts * f));
  const tickStep = Math.max(1, Math.ceil(maxRound / 8));

  const onMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const round = Math.round(1 + ((ratio * W - PAD) / (W - PAD * 2)) * (maxRound - 1));
    if (round < 1 || round > maxRound) {
      setHover(null);
      return;
    }
    setHover({ round, ratio });
  };

  const ptsAt = (s, round) => {
    let val = null;
    for (let i = 0; i < s.rounds.length; i++) {
      if (s.rounds[i] > round) break;
      val = s.points[i];
    }
    return val;
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="График очков сезона"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {gridLines.map((p) => (
          <g key={p}>
            <line x1={PAD} x2={W - PAD} y1={y(p)} y2={y(p)} stroke="#26262c" strokeWidth="1" />
            <text x={PAD - 8} y={y(p) + 4} textAnchor="end" fontSize="12" fill="#8a8a93">
              {p}
            </text>
          </g>
        ))}
        {Array.from({ length: maxRound }, (_, i) => i + 1)
          .filter((r) => r === 1 || r % tickStep === 0)
          .map((r) => (
            <text key={r} x={x(r)} y={H - PAD + 22} textAnchor="middle" fontSize="12" fill="#8a8a93">
              R{r}
            </text>
          ))}
        {hover && (
          <line
            x1={x(hover.round)}
            x2={x(hover.round)}
            y1={PAD}
            y2={H - PAD}
            stroke="#8a8a93"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        )}

        {series.map((s, i) => {
          const color = teamColor(s.id);
          const pts = s.rounds.map((r, k) => `${x(r)},${y(s.points[k])}`).join(" ");
          const lastX = x(s.rounds.at(-1));
          const lastY = y(s.points.at(-1));
          return (
            <g key={s.id}>
              <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={s.id === "ferrari" ? 4 : 2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx={lastX} cy={lastY} r="5" fill={color} />
              <text
                x={lastX - 8}
                y={lastY - 10 - i * 4}
                textAnchor="end"
                fontSize="13"
                fontWeight="700"
                fill={color}
              >
                {s.name} · {s.points.at(-1)}
              </text>
            </g>
          );
        })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute top-4 z-10 rounded-lg border border-line bg-carbon/95 px-3 py-2 backdrop-blur"
          style={{ left: `min(max(${(hover.ratio * 100).toFixed(1)}%, 6%), 72%)` }}
        >
          <p className="mb-1 font-digits text-[10px] tracking-widest text-dim">
            ПОСЛЕ ЭТАПА {hover.round}
          </p>
          {series.map((s) => {
            const val = ptsAt(s, hover.round);
            return (
              <p key={s.id} className="flex items-center gap-2 font-digits text-xs">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: teamColor(s.id) }} />
                <span className="min-w-20 font-bold">{s.name}</span>
                <span className="text-dim">{val ?? 0} очк.</span>
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
