import { teamColor } from "../lib/i18n";

/* Накопление очков по этапам: Ferrari против двух ближайших соперников.
   Чистый SVG без библиотек. series: [{ id, name, rounds[], points[] }] */
export default function SeasonChart({ series }) {
  const W = 800;
  const H = 320;
  const PAD = 44;

  const maxRound = Math.max(...series.flatMap((s) => s.rounds), 2);
  const maxPts = Math.max(...series.flatMap((s) => s.points), 10);
  const x = (r) => PAD + ((r - 1) / Math.max(maxRound - 1, 1)) * (W - PAD * 2);
  const y = (p) => H - PAD - (p / maxPts) * (H - PAD * 2);

  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => Math.round(maxPts * f));
  const tickStep = Math.max(1, Math.ceil(maxRound / 8));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="График очков сезона">
      {/* горизонтальная сетка */}
      {gridLines.map((p) => (
        <g key={p}>
          <line x1={PAD} x2={W - PAD} y1={y(p)} y2={y(p)} stroke="#26262c" strokeWidth="1" />
          <text x={PAD - 8} y={y(p) + 4} textAnchor="end" fontSize="12" fill="#8a8a93">
            {p}
          </text>
        </g>
      ))}
      {/* этапы по оси X */}
      {Array.from({ length: maxRound }, (_, i) => i + 1)
        .filter((r) => r === 1 || r % tickStep === 0)
        .map((r) => (
          <text key={r} x={x(r)} y={H - PAD + 22} textAnchor="middle" fontSize="12" fill="#8a8a93">
            R{r}
          </text>
        ))}

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
  );
}
