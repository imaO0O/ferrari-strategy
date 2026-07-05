import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./ui";
import { api } from "../lib/api";
import { driverRu, teamColor } from "../lib/i18n";

/* «Дуэль»: сравнение двух пилотов текущего сезона лицом к лицу.
   Очки и победы — из зачёта; подиумы, финишы и сходы считаем
   по погоночным результатам пилота. */

const A_COLOR = "#ff2800";
const B_COLOR = "#ffd400";

const isDnf = (res) =>
  res.status !== "Finished" && !/^\+\d+ Laps?$/.test(res.status);

function computeStats(mr) {
  const races = mr.RaceTable.Races ?? [];
  const rows = races.map((race) => ({ round: +race.round, res: race.Results[0] }));
  const classified = rows.filter((r) => !isDnf(r.res));
  const positions = classified.map((r) => +r.res.position);
  return {
    podiums: positions.filter((p) => p <= 3).length,
    best: positions.length ? Math.min(...positions) : null,
    avg: positions.length
      ? positions.reduce((s, p) => s + p, 0) / positions.length
      : null,
    dnf: rows.length - classified.length,
    last5: rows.slice(-5).map((r) => ({ round: r.round, position: +r.res.position, dnf: isDnf(r.res) })),
  };
}

/* Двусторонняя полоса: доля левого пилота против правого */
function StatBar({ label, a, b, format = (v) => v, lowerIsBetter = false }) {
  const missing = a == null || b == null;
  let ratio = 0.5;
  if (!missing) {
    const wa = lowerIsBetter ? 1 / Math.max(a, 0.01) : a;
    const wb = lowerIsBetter ? 1 / Math.max(b, 0.01) : b;
    ratio = wa + wb === 0 ? 0.5 : wa / (wa + wb);
  }
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-digits font-bold" style={{ color: A_COLOR }}>
          {missing || a == null ? "—" : format(a)}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-dim">{label}</span>
        <span className="font-digits font-bold" style={{ color: B_COLOR }}>
          {missing || b == null ? "—" : format(b)}
        </span>
      </div>
      <div className="mt-1.5 flex h-2 gap-1 overflow-hidden rounded-full">
        <motion.div
          className="rounded-full"
          style={{ background: A_COLOR }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="flex-1 rounded-full"
          style={{ background: B_COLOR }}
        />
      </div>
    </div>
  );
}

function DriverPicker({ standings, value, onChange, exclude, align = "left" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-md border border-line bg-panel px-3 py-2.5 font-bold uppercase tracking-wide outline-none transition-colors focus:border-rosso ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {standings
        .filter((s) => s.Driver.driverId !== exclude)
        .map((s) => {
          const name = driverRu(s.Driver);
          return (
            <option key={s.Driver.driverId} value={s.Driver.driverId}>
              {name.given} {name.family}
            </option>
          );
        })}
    </select>
  );
}

function Form5({ last5, color }) {
  return (
    <div className="flex gap-1.5">
      {last5.map(({ round, position, dnf }) => (
        <span
          key={round}
          className="rounded-md px-2 py-1 font-digits text-xs font-bold"
          style={
            dnf
              ? { background: "#1b1b21", color: "#8a8a93" }
              : position <= 3
                ? { background: color, color: "#0a0a0c" }
                : { background: "#1b1b21", color: "#fafafa" }
          }
        >
          {dnf ? "DNF" : `P${position}`}
        </span>
      ))}
    </div>
  );
}

export default function Duel({ standings }) {
  const ids = standings.map((s) => s.Driver.driverId);
  const [aId, setAId] = useState(ids.includes("leclerc") ? "leclerc" : ids[0]);
  const [bId, setBId] = useState(ids.includes("hamilton") ? "hamilton" : ids[1]);
  const [data, setData] = useState({ status: "loading" });

  const standingOf = (id) => standings.find((s) => s.Driver.driverId === id);

  useEffect(() => {
    let alive = true;
    setData({ status: "loading" });
    Promise.all([api.driverResults(aId), api.driverResults(bId)])
      .then(([ra, rb]) => alive && setData({ status: "ready", a: computeStats(ra), b: computeStats(rb) }))
      .catch((e) => alive && setData({ status: "error", message: e.message }));
    return () => {
      alive = false;
    };
  }, [aId, bId]);

  const [sa, sb] = [standingOf(aId), standingOf(bId)];
  const [na, nb] = [sa && driverRu(sa.Driver), sb && driverRu(sb.Driver)];

  const header = useMemo(
    () => (
      <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div>
          <DriverPicker standings={standings} value={aId} onChange={setAId} exclude={bId} />
          {sa && (
            <div className="mt-3">
              <span
                className="mr-2 inline-block h-4 w-1 rounded-full align-middle"
                style={{ background: teamColor(sa.Constructors.at(-1)?.constructorId) }}
              />
              <span className="text-sm text-dim">
                {sa.Constructors.at(-1)?.name} · P{sa.position} в зачёте
              </span>
            </div>
          )}
        </div>
        <p className="hidden pb-8 text-4xl font-black italic text-outline-rosso md:block">VS</p>
        <div className="md:text-right">
          <DriverPicker standings={standings} value={bId} onChange={setBId} exclude={aId} align="right" />
          {sb && (
            <div className="mt-3">
              <span className="text-sm text-dim">
                {sb.Constructors.at(-1)?.name} · P{sb.position} в зачёте
              </span>
              <span
                className="ml-2 inline-block h-4 w-1 rounded-full align-middle"
                style={{ background: teamColor(sb.Constructors.at(-1)?.constructorId) }}
              />
            </div>
          )}
        </div>
      </div>
    ),
    [standings, aId, bId, sa, sb],
  );

  return (
    <Reveal className="mx-auto max-w-3xl">
      {header}

      {data.status === "loading" && <div className="mt-8 h-72 animate-pulse rounded-xl bg-panel" />}
      {data.status === "error" && (
        <p className="mt-8 text-dim">Не удалось загрузить результаты пилотов — попробуй ещё раз.</p>
      )}

      {data.status === "ready" && sa && sb && (
        <div className="mt-8 space-y-5 rounded-xl border border-line bg-panel p-6 md:p-8">
          <div className="flex items-center justify-between text-lg font-black uppercase italic">
            <span style={{ color: A_COLOR }}>{na.family}</span>
            <span style={{ color: B_COLOR }}>{nb.family}</span>
          </div>

          <StatBar label="Очки" a={+sa.points} b={+sb.points} />
          <StatBar label="Победы" a={+sa.wins} b={+sb.wins} />
          <StatBar label="Подиумы" a={data.a.podiums} b={data.b.podiums} />
          <StatBar label="Лучший финиш" a={data.a.best} b={data.b.best} format={(v) => `P${v}`} lowerIsBetter />
          <StatBar
            label="Средний финиш"
            a={data.a.avg}
            b={data.b.avg}
            format={(v) => `P${v.toFixed(1)}`}
            lowerIsBetter
          />
          <StatBar label="Сходы" a={data.a.dnf} b={data.b.dnf} lowerIsBetter />

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
            <Form5 last5={data.a.last5} color={A_COLOR} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-dim">
              Последние 5 гонок
            </span>
            <Form5 last5={data.b.last5} color={B_COLOR} />
          </div>
        </div>
      )}
    </Reveal>
  );
}
