import { useEffect, useState } from "react";

/* Общие гоночные элементы, используемые на нескольких страницах */

export const raceDate = (race) => new Date(`${race.date}T${race.time ?? "12:00:00Z"}`);

/* Живой обратный отсчёт ДД:ЧЧ:ММ:СС в Orbitron */
export function Countdown({ target, compact = false }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const cells = [
    [Math.floor(diff / 86_400_000), "ДНИ"],
    [Math.floor(diff / 3_600_000) % 24, "ЧАС"],
    [Math.floor(diff / 60_000) % 60, "МИН"],
    [Math.floor(diff / 1_000) % 60, "СЕК"],
  ];
  const num = compact ? "text-2xl md:text-3xl" : "text-4xl md:text-6xl";
  const sep = compact ? "text-xl md:text-2xl" : "text-3xl md:text-5xl";
  return (
    <div className="flex items-start gap-2 md:gap-4">
      {cells.map(([v, label], i) => (
        <div key={label} className="flex items-start gap-2 md:gap-4">
          {i > 0 && <span className={`pt-1 font-digits text-rosso ${sep}`}>:</span>}
          <div className="text-center">
            <span className={`font-digits font-bold tabular-nums ${num}`}>
              {String(v).padStart(2, "0")}
            </span>
            <p className="mt-1 text-[9px] font-bold tracking-[0.35em] text-dim">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Сортировка таблиц: клик по заголовку меняет ключ/направление */
export function useSort(defaultKey) {
  const [sort, setSort] = useState({ key: defaultKey, dir: 1 });
  const toggle = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }));
  return [sort, toggle];
}

export function SortTh({ label, k, sort, onSort, className = "" }) {
  const active = sort.key === k;
  return (
    <th className={`px-4 py-3 ${className}`}>
      <button
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 uppercase tracking-[0.25em] transition-colors hover:text-white ${
          active ? "text-giallo" : ""
        }`}
      >
        {label}
        <span className="font-digits">{active ? (sort.dir > 0 ? "↑" : "↓") : ""}</span>
      </button>
    </th>
  );
}

/* Чип позиции: топ-3 — красный */
export function PosChip({ position, children }) {
  return (
    <span
      className={`inline-flex min-w-9 items-center justify-center rounded-md px-2 py-1 font-digits text-xs font-bold ${
        +position <= 3 ? "bg-rosso text-white" : "bg-panel2 text-dim"
      }`}
    >
      {children ?? `P${position}`}
    </span>
  );
}
