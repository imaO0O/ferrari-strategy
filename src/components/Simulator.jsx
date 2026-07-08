import { useMemo, useState } from "react";
import { Reveal } from "./ui";
import { PosChip, raceDate } from "./racing";
import DownloadCardButton from "./games/DownloadCardButton";
import { gpRu, driverRu, teamColor } from "../lib/i18n";

/* Симулятор чемпионата: расставь подиумы оставшихся этапов и смотри,
   как меняется личный зачёт. Базовая проекция — текущий средний темп
   каждого пилота; выбранный подиум заменяет его средний результат. */

const PODIUM_PTS = [25, 18, 15];

export default function Simulator({ races, standings }) {
  const now = Date.now();
  const remaining = useMemo(
    () => races.filter((r) => raceDate(r).getTime() > now),
    [races, now],
  );
  const completed = races.length - remaining.length;

  // picks[round] = [id|null, id|null, id|null]
  const [picks, setPicks] = useState({});
  const [baseline, setBaseline] = useState(true);

  const codeOf = (s) => s.Driver.code ?? s.Driver.familyName.slice(0, 3).toUpperCase();

  const projection = useMemo(() => {
    const avg = {};
    for (const s of standings) {
      avg[s.Driver.driverId] = completed > 0 ? +s.points / completed : 0;
    }
    const totals = {};
    for (const s of standings) {
      totals[s.Driver.driverId] = { standing: s, pts: +s.points };
    }
    for (const race of remaining) {
      const podium = picks[race.round] ?? [];
      for (const s of standings) {
        const id = s.Driver.driverId;
        const place = podium.indexOf(id);
        if (place >= 0) {
          totals[id].pts += PODIUM_PTS[place];
        } else if (baseline) {
          totals[id].pts += avg[id];
        }
      }
    }
    return Object.values(totals)
      .map((t) => ({ ...t, pts: Math.round(t.pts) }))
      .sort((a, b) => b.pts - a.pts)
      .map((t, i) => ({
        ...t,
        position: i + 1,
        delta: +t.standing.position - (i + 1),
      }));
  }, [standings, remaining, picks, baseline, completed]);

  if (!remaining.length) {
    return <p className="text-dim">Сезон завершён — симулировать больше нечего.</p>;
  }

  const champion = projection[0];
  const champName = champion && driverRu(champion.standing.Driver);
  const pickedCount = Object.values(picks).flat().filter(Boolean).length;

  const setPick = (round, place, id) => {
    setPicks((prev) => {
      const row = [...(prev[round] ?? [null, null, null])];
      row[place] = id || null;
      return { ...prev, [round]: row };
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* оставшиеся этапы */}
      <Reveal>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-black uppercase italic">
            Оставшиеся этапы · {remaining.length}
          </h3>
          {pickedCount > 0 && (
            <button
              onClick={() => setPicks({})}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-black uppercase tracking-widest text-dim transition-colors hover:text-white"
            >
              Сбросить
            </button>
          )}
        </div>
        <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
          {remaining.map((race) => (
            <div key={race.round} className="rounded-xl border border-line bg-panel p-4">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide">
                <span className="mr-2 font-digits text-xs text-dim">R{race.round}</span>
                {gpRu(race.raceName)}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((place) => (
                  <select
                    key={place}
                    value={picks[race.round]?.[place] ?? ""}
                    onChange={(e) => setPick(race.round, place, e.target.value)}
                    className="w-full rounded-md border border-line bg-panel2 px-2 py-1.5 font-digits text-xs font-bold outline-none transition-colors focus:border-rosso"
                    aria-label={`P${place + 1} на ${gpRu(race.raceName)}`}
                  >
                    <option value="">P{place + 1}</option>
                    {standings
                      .filter(
                        (s) =>
                          !(picks[race.round] ?? []).some(
                            (p, j) => j !== place && p === s.Driver.driverId,
                          ),
                      )
                      .map((s) => (
                        <option key={s.Driver.driverId} value={s.Driver.driverId}>
                          {codeOf(s)}
                        </option>
                      ))}
                  </select>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* проекция зачёта */}
      <Reveal delay={0.1}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-black uppercase italic">Прогнозный зачёт</h3>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-widest text-dim">
            <input
              type="checkbox"
              checked={baseline}
              onChange={(e) => setBaseline(e.target.checked)}
              className="accent-rosso"
            />
            Средний темп остальным
          </label>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-dim">
          Подиум даёт 25–18–15 очков. С включённым «средним темпом» каждый пилот без
          подиума получает за этап свой средний результат сезона — грубая, но честная
          модель.
        </p>
        <div className="max-h-[26rem] space-y-1.5 overflow-y-auto pr-1">
          {projection.slice(0, 12).map((row) => {
            const name = driverRu(row.standing.Driver);
            return (
              <div
                key={row.standing.Driver.driverId}
                className="flex items-center gap-3 rounded-md border border-line bg-panel px-4 py-2"
              >
                <PosChip position={row.position} />
                <span
                  className="h-5 w-1 rounded-full"
                  style={{
                    background: teamColor(row.standing.Constructors.at(-1)?.constructorId),
                  }}
                />
                <span className="flex-1 truncate text-sm font-bold uppercase tracking-wide">
                  {name.given} {name.family}
                </span>
                <span className="font-digits text-xs">
                  {row.delta > 0 ? (
                    <span className="text-giallo">▲{row.delta}</span>
                  ) : row.delta < 0 ? (
                    <span className="text-rosso">▼{-row.delta}</span>
                  ) : (
                    <span className="text-dim">=</span>
                  )}
                </span>
                <span className="min-w-12 text-right font-digits text-sm text-giallo">
                  {row.pts}
                </span>
              </div>
            );
          })}
        </div>
        {champion && pickedCount > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-sm text-dim">
              Чемпион сценария:{" "}
              <span className="font-bold text-white">
                {champName.given} {champName.family}
              </span>
            </p>
            <DownloadCardButton
              card={{
                label: "Мой сценарий чемпионата",
                value: codeOf(champion.standing),
                sub: `Чемпион с ${champion.pts} очками · ${pickedCount} подиумов расставлено`,
              }}
            />
          </div>
        )}
      </Reveal>
    </div>
  );
}
