import { useEffect, useState } from "react";
import { Reveal } from "./ui";
import DownloadCardButton from "./games/DownloadCardButton";
import { raceDate } from "./racing";
import { api } from "../lib/api";
import { gpRu, driverRu } from "../lib/i18n";

/* Прогнозы без сервера: подиум выбирается до старта, хранится в браузере,
   после гонки сайт сам сверяет с результатами и начисляет очки.
   Точное попадание в место — 5 очков, пилот на подиуме не на своём месте — 2. */

const STORAGE_KEY = "fs-predictions";

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
};

const persist = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* приватный режим */
  }
};

const codeOf = (standing) =>
  standing.Driver.code ?? standing.Driver.familyName.slice(0, 3).toUpperCase();

export default function Predictions({ nextRace, standings, season }) {
  const [store, setStore] = useState(load);
  const [picks, setPicks] = useState(() => {
    const key = nextRace ? `${season}-${nextRace.round}` : null;
    return key && load()[key] ? load()[key].picks : [null, null, null];
  });
  const [saved, setSaved] = useState(false);

  const key = nextRace ? `${season}-${nextRace.round}` : null;
  const locked = nextRace ? raceDate(nextRace).getTime() <= Date.now() : true;
  const current = key ? store[key] : null;

  // подсчёт очков за прошедшие гонки
  useEffect(() => {
    let alive = true;
    (async () => {
      const data = load();
      let changed = false;
      for (const [k, entry] of Object.entries(data)) {
        if (entry.points != null || k === key) continue;
        const round = k.split("-")[1];
        try {
          const d = await api.raceResults(round);
          const results = d.RaceTable.Races?.[0]?.Results;
          if (!results?.length) continue; // результатов ещё нет — проверим позже
          const actual = results.slice(0, 3).map((r) => r.Driver.driverId);
          entry.points = entry.picks.reduce(
            (sum, id, i) => sum + (actual[i] === id ? 5 : actual.includes(id) ? 2 : 0),
            0,
          );
          changed = true;
        } catch {
          /* сеть подвела — досчитаем в следующий раз */
        }
      }
      if (alive && changed) {
        persist(data);
        setStore({ ...data });
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    if (!key || picks.some((p) => !p)) return;
    const next = {
      ...store,
      [key]: { picks, points: null, raceName: gpRu(nextRace.raceName) },
    };
    setStore(next);
    persist(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const scored = Object.entries(store)
    .filter(([, e]) => e.points != null)
    .reverse();
  const total = scored.reduce((s, [, e]) => s + e.points, 0);

  const nameOf = (id) => {
    const st = standings.find((s) => s.Driver.driverId === id);
    return st ? codeOf(st) : "—";
  };

  return (
    <Reveal className="mt-8 rounded-xl border border-line bg-panel p-6 md:p-8">
      <p className="flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
        <span className="inline-block h-px w-10 bg-giallo" />
        МОЙ ПРОГНОЗ · ХРАНИТСЯ В ТВОЁМ БРАУЗЕРЕ
      </p>

      {nextRace && !locked && (
        <>
          <p className="mt-4 font-bold">
            Кто будет на подиуме {gpRu(nextRace.raceName)}?
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <p className="mb-1.5 font-digits text-xs text-dim">P{i + 1}</p>
                <select
                  value={picks[i] ?? ""}
                  onChange={(e) => {
                    const next = [...picks];
                    next[i] = e.target.value || null;
                    setPicks(next);
                  }}
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2.5 font-bold uppercase tracking-wide outline-none transition-colors focus:border-rosso"
                >
                  <option value="">— выбери пилота —</option>
                  {standings
                    .filter((s) => !picks.some((p, j) => j !== i && p === s.Driver.driverId))
                    .map((s) => {
                      const name = driverRu(s.Driver);
                      return (
                        <option key={s.Driver.driverId} value={s.Driver.driverId}>
                          {name.given} {name.family}
                        </option>
                      );
                    })}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={save}
              disabled={picks.some((p) => !p)}
              className="rounded-md bg-rosso px-6 py-2.5 text-sm font-black uppercase tracking-widest transition-transform enabled:hover:scale-105 disabled:opacity-40"
            >
              {saved ? "Сохранено ✓" : current ? "Обновить прогноз" : "Сохранить прогноз"}
            </button>
            {current && (
              <DownloadCardButton
                className="py-2.5"
                card={{
                  label: `Мой прогноз · ${gpRu(nextRace.raceName)}`,
                  value: current.picks.map(nameOf).join(" · "),
                  sub: "Точное место — 5 очков, подиум — 2",
                }}
              />
            )}
            <span className="text-xs text-dim">
              Точное место — 5 очков · пилот на подиуме — 2
            </span>
          </div>
        </>
      )}

      {nextRace && locked && current && current.points == null && (
        <p className="mt-4 text-dim">
          Прогноз на {gpRu(nextRace.raceName)} принят:{" "}
          <span className="font-digits text-white">{current.picks.map(nameOf).join(" · ")}</span> —
          очки посчитаются после финиша.
        </p>
      )}

      {scored.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-dim">
            Мои очки: <span className="font-digits text-giallo">{total}</span> за {scored.length}{" "}
            {scored.length === 1 ? "гонку" : scored.length < 5 ? "гонки" : "гонок"}
          </p>
          <div className="space-y-1.5">
            {scored.slice(0, 5).map(([k, e]) => (
              <div key={k} className="flex items-center gap-3 rounded-md bg-panel2/60 px-3 py-2 text-sm">
                <span className="flex-1 truncate font-bold uppercase">{e.raceName}</span>
                <span className="font-digits text-dim">{e.picks.map(nameOf).join(" · ")}</span>
                <span className="font-digits font-bold text-giallo">+{e.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Reveal>
  );
}
