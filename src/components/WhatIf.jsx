import { useEffect, useMemo, useState } from "react";
import { Reveal } from "./ui";
import { PosChip } from "./racing";
import { api } from "../lib/api";
import { driverRu, teamColor } from "../lib/i18n";
import { POINT_SYSTEMS as SYSTEMS, recomputeStandings } from "../lib/points";

/* «Что если»: пересчёт личного зачёта по очковым системам разных эпох.
   Считаются только гонки (спринтов в старых системах не было). */

export default function WhatIf({ officialStandings, season = "current" }) {
  const [data, setData] = useState({ status: "loading" });
  const [systemId, setSystemId] = useState("classic");

  useEffect(() => {
    let alive = true;
    setData({ status: "loading" });
    api
      .seasonResults(season)
      .then((d) => alive && setData({ status: "ready", races: d.RaceTable.Races ?? [] }))
      .catch((e) => alive && setData({ status: "error", message: e.message }));
    return () => {
      alive = false;
    };
  }, [season]);

  const system = SYSTEMS.find((s) => s.id === systemId);

  const table = useMemo(() => {
    if (data.status !== "ready") return null;
    const officialPos = {};
    for (const s of officialStandings) officialPos[s.Driver.driverId] = +s.position;
    return recomputeStandings(data.races, system, officialPos);
  }, [data, system, officialStandings]);

  return (
    <div>
      <Reveal className="mb-8">
        <p className="mb-4 max-w-2xl text-dim">
          А каким был бы личный зачёт по правилам другой эпохи? Выбери систему начисления —
          пересчитаем весь сезон. Считаются только гонки: спринтов в старых системах не было,
          поэтому итог отличается от официального зачёта.
        </p>
        <div className="flex flex-wrap gap-2">
          {SYSTEMS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSystemId(s.id)}
              className={`rounded-md px-4 py-2.5 text-left transition-colors ${
                systemId === s.id ? "bg-rosso text-white" : "bg-panel text-dim hover:text-white"
              }`}
            >
              <span className="block text-sm font-black uppercase tracking-widest">{s.label}</span>
              <span className={`block font-digits text-[10px] ${systemId === s.id ? "text-white/70" : "text-dim/70"}`}>
                {s.points.join("-")}
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      {data.status === "loading" && <div className="h-96 animate-pulse rounded-xl bg-panel" />}
      {data.status === "error" && <p className="text-dim">Не удалось загрузить результаты сезона.</p>}

      {table && (
        <Reveal className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-panel2 text-[10px] uppercase tracking-[0.25em] text-dim">
              <tr>
                <th className="px-4 py-3">Место</th>
                <th className="px-4 py-3">Пилот</th>
                <th className="px-4 py-3 text-right">Очки ({system.label})</th>
                <th className="px-4 py-3 text-right">К официальному</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-panel">
              {table.map((row) => {
                const name = driverRu(row.driver);
                return (
                  <tr key={row.driver.driverId} className="transition-colors hover:bg-panel2/70">
                    <td className="px-4 py-3">
                      <PosChip position={row.position} />
                    </td>
                    <td className="px-4 py-3 font-bold uppercase tracking-wide">
                      <span
                        className="mr-3 inline-block h-4 w-1 rounded-full align-middle"
                        style={{ background: teamColor(row.constructorId) }}
                      />
                      {name.given} {name.family}
                    </td>
                    <td className="px-4 py-3 text-right font-digits text-giallo">{row.pts}</td>
                    <td className="px-4 py-3 text-right font-digits">
                      {row.delta > 0 ? (
                        <span className="text-giallo">▲ {row.delta}</span>
                      ) : row.delta < 0 ? (
                        <span className="text-rosso">▼ {-row.delta}</span>
                      ) : (
                        <span className="text-dim">=</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Reveal>
      )}
    </div>
  );
}
