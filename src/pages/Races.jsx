import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageWrap from "../components/PageWrap";
import { Reveal, KineticTitle, Marquee } from "../components/ui";
import { Countdown, PosChip, raceDate } from "../components/racing";
import { api } from "../lib/api";
import { gpRu, countryRu, driverRu, formatDateRu, teamColor } from "../lib/i18n";

const TABS = [
  { id: "calendar", label: "Календарь" },
  { id: "results", label: "Результаты" },
  { id: "drivers", label: "Личный зачёт" },
  { id: "teams", label: "Конструкторы" },
];

/* ── Календарь ─────────────────────────────────────────────── */

function Calendar({ races }) {
  const now = Date.now();
  const nextIdx = races.findIndex((r) => raceDate(r).getTime() > now);
  const done = nextIdx === -1 ? races.length : nextIdx;

  return (
    <>
      <Reveal className="mb-10">
        <p className="text-sm font-bold uppercase tracking-widest text-dim">
          Этап {Math.min(done + 1, races.length)} из {races.length}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel2">
          <div
            className="h-full rounded-full bg-rosso transition-all"
            style={{ width: `${(done / races.length) * 100}%` }}
          />
        </div>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {races.map((race, i) => {
          const isPast = i < nextIdx || nextIdx === -1;
          const isNext = i === nextIdx;
          return (
            <Reveal key={race.round} delay={(i % 3) * 0.05}>
              <div
                className={`relative h-full rounded-xl border p-5 transition-colors ${
                  isNext
                    ? "border-rosso bg-panel glow-rosso"
                    : isPast
                      ? "border-line bg-panel/50 opacity-60"
                      : "border-line bg-panel hover:border-rosso/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-digits text-xs text-dim">ЭТАП {race.round}</span>
                  <span className="flex gap-1.5">
                    {race.Sprint && (
                      <span className="rounded-sm bg-panel2 px-1.5 py-0.5 font-digits text-[9px] tracking-widest text-giallo">
                        СПРИНТ
                      </span>
                    )}
                    {isNext && (
                      <span className="rounded-sm bg-rosso px-1.5 py-0.5 font-digits text-[9px] tracking-widest">
                        СЛЕДУЮЩАЯ
                      </span>
                    )}
                    {isPast && (
                      <span className="rounded-sm bg-panel2 px-1.5 py-0.5 font-digits text-[9px] tracking-widest text-dim">
                        ФИНИШ
                      </span>
                    )}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-black uppercase italic leading-tight">
                  {gpRu(race.raceName)}
                </h3>
                <p className="mt-1 text-sm text-dim">
                  {race.Circuit.circuitName} · {countryRu(race.Circuit.Location.country)}
                </p>
                <p className="mt-2 text-xs font-semibold text-dim">
                  {formatDateRu(race.date, race.time)}
                </p>
                {isNext && (
                  <div className="mt-4">
                    <Countdown target={raceDate(race).getTime()} compact />
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

/* ── Результаты этапа ──────────────────────────────────────── */

function Results({ races }) {
  const now = Date.now();
  const finished = useMemo(() => races.filter((r) => raceDate(r).getTime() < now), [races, now]);
  const [round, setRound] = useState(finished.at(-1)?.round ?? null);
  const [data, setData] = useState({ status: "idle" });

  useEffect(() => {
    if (!round) return;
    let alive = true;
    setData({ status: "loading" });
    api
      .raceResults(round)
      .then((d) => alive && setData({ status: "ready", race: d.RaceTable.Races?.[0] ?? null }))
      .catch((e) => alive && setData({ status: "error", message: e.message }));
    return () => {
      alive = false;
    };
  }, [round]);

  if (!finished.length) return <p className="text-dim">В этом сезоне ещё не было гонок.</p>;

  const results = data.status === "ready" ? (data.race?.Results ?? []) : [];

  return (
    <>
      <Reveal className="mb-8 flex flex-wrap items-center gap-4">
        <label className="text-sm font-bold uppercase tracking-widest text-dim" htmlFor="round">
          Гран-при
        </label>
        <select
          id="round"
          value={round ?? ""}
          onChange={(e) => setRound(e.target.value)}
          className="rounded-md border border-line bg-panel px-4 py-2.5 font-bold uppercase tracking-wide outline-none transition-colors focus:border-rosso"
        >
          {finished.map((r) => (
            <option key={r.round} value={r.round}>
              {gpRu(r.raceName)}
            </option>
          ))}
        </select>
      </Reveal>

      {data.status === "loading" && <div className="h-96 animate-pulse rounded-xl bg-panel" />}
      {data.status === "error" && <p className="text-dim">Не удалось загрузить результаты.</p>}

      {data.status === "ready" && results.length > 0 && (
        <>
          {/* подиум */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {results.slice(0, 3).map((res, i) => {
              const name = driverRu(res.Driver);
              return (
                <Reveal
                  key={res.Driver.driverId}
                  delay={i * 0.08}
                  className={`relative overflow-hidden rounded-xl border border-line bg-panel p-5 ${
                    i === 0 ? "md:-translate-y-2" : ""
                  }`}
                >
                  <span className="pointer-events-none absolute -right-2 -top-7 font-digits text-[5.5rem] font-black leading-none text-outline-rosso opacity-70">
                    {res.position}
                  </span>
                  <span
                    className="inline-block h-7 w-1.5 rounded-full"
                    style={{ background: teamColor(res.Constructor.constructorId) }}
                  />
                  <p className="mt-3 font-semibold text-dim">{name.given}</p>
                  <h3 className="text-2xl font-black uppercase italic leading-none">{name.family}</h3>
                  <p className="mt-2 font-digits text-xs text-giallo">
                    {res.Time?.time ?? res.status}
                  </p>
                </Reveal>
              );
            })}
          </div>

          {/* полная таблица */}
          <Reveal className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-panel2 text-[10px] uppercase tracking-[0.25em] text-dim">
                <tr>
                  <th className="px-4 py-3">Место</th>
                  <th className="px-4 py-3">Пилот</th>
                  <th className="px-4 py-3">Команда</th>
                  <th className="px-4 py-3">Круги</th>
                  <th className="px-4 py-3">Время / статус</th>
                  <th className="px-4 py-3 text-right">Очки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-panel">
                {results.map((res) => {
                  const name = driverRu(res.Driver);
                  return (
                    <tr key={res.Driver.driverId} className="transition-colors hover:bg-panel2/70">
                      <td className="px-4 py-3">
                        <PosChip position={res.position} />
                      </td>
                      <td className="px-4 py-3 font-bold uppercase tracking-wide">
                        <span
                          className="mr-3 inline-block h-4 w-1 rounded-full align-middle"
                          style={{ background: teamColor(res.Constructor.constructorId) }}
                        />
                        {name.given} {name.family}
                      </td>
                      <td className="px-4 py-3 text-dim">{res.Constructor.name}</td>
                      <td className="px-4 py-3 font-digits text-dim">{res.laps}</td>
                      <td className="px-4 py-3 font-digits">
                        {res.Time?.time ?? <span className="text-dim">{res.status}</span>}
                        {res.FastestLap?.rank === "1" && (
                          <span className="ml-2 rounded-sm bg-purple-600/30 px-1.5 py-0.5 font-digits text-[9px] tracking-widest text-purple-300">
                            БЫСТРЫЙ КРУГ
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-digits text-giallo">{res.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Reveal>
        </>
      )}
    </>
  );
}

/* ── Зачёты ────────────────────────────────────────────────── */

function StandingsTable({ rows }) {
  return (
    <Reveal className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-panel2 text-[10px] uppercase tracking-[0.25em] text-dim">
          <tr>
            <th className="px-4 py-3">Место</th>
            <th className="px-4 py-3">Имя</th>
            <th className="px-4 py-3">Победы</th>
            <th className="px-4 py-3 text-right">Очки</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-panel">
          {rows.map((row) => (
            <tr key={row.key} className="transition-colors hover:bg-panel2/70">
              <td className="px-4 py-3">
                <PosChip position={row.position} />
              </td>
              <td className="px-4 py-3 font-bold uppercase tracking-wide">
                <span
                  className="mr-3 inline-block h-4 w-1 rounded-full align-middle"
                  style={{ background: row.color }}
                />
                {row.name}
                {row.sub && <span className="ml-2 text-xs font-normal text-dim">{row.sub}</span>}
              </td>
              <td className="px-4 py-3 font-digits text-dim">{row.wins}</td>
              <td className="px-4 py-3 text-right font-digits text-giallo">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  );
}

/* ── Страница ──────────────────────────────────────────────── */

export default function Races() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "calendar";
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [sched, ds, cs] = await Promise.all([
          api.schedule(),
          api.driverStandings(),
          api.constructorStandings(),
        ]);
        if (!alive) return;
        setState({
          status: "ready",
          races: sched.RaceTable.Races ?? [],
          drivers: ds.StandingsTable.StandingsLists[0]?.DriverStandings ?? [],
          teams: cs.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [],
          season: sched.RaceTable.season,
        });
      } catch (e) {
        if (alive) setState({ status: "error", message: e.message });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PageWrap>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-32 md:pt-40">
        <Reveal>
          <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
            <span className="inline-block h-px w-10 bg-giallo" />
            СЕЗОН {state.season ?? "…"} · ФОРМУЛА-1
          </p>
        </Reveal>
        <h1 className="text-[13vw] font-black uppercase italic leading-[0.85] tracking-tight md:text-[8rem]">
          <KineticTitle text="ГОНКИ" />
        </h1>

        {/* вкладки */}
        <div className="mt-10 flex flex-wrap gap-2">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setParams({ tab: id })}
              className={`rounded-md px-4 py-2.5 text-sm font-black uppercase tracking-widest transition-colors ${
                tab === id ? "bg-rosso text-white" : "bg-panel text-dim hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <Marquee
        items={["FERRARI STRATEGY", "✦", "GRAND PRIX", "✦", "FORMULA 1", "✦"]}
        speed={24}
        className="rotate-1 bg-rosso py-3 text-xl font-black uppercase italic text-carbon"
        itemClassName="mx-4"
      />

      <section className="mx-auto max-w-7xl px-5 py-14">
        {state.status === "loading" && <div className="h-96 animate-pulse rounded-xl bg-panel" />}
        {state.status === "error" && (
          <div className="text-center">
            <p className="text-xl font-bold">Живые данные сейчас недоступны.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-md bg-rosso px-6 py-3 text-sm font-black uppercase tracking-widest"
            >
              Повторить
            </button>
          </div>
        )}
        {state.status === "ready" && (
          <>
            {tab === "calendar" && <Calendar races={state.races} />}
            {tab === "results" && <Results races={state.races} />}
            {tab === "drivers" && (
              <StandingsTable
                rows={state.drivers.map((d) => {
                  const name = driverRu(d.Driver);
                  return {
                    key: d.Driver.driverId,
                    position: d.position,
                    name: `${name.given} ${name.family}`,
                    sub: d.Constructors.at(-1)?.name,
                    wins: d.wins,
                    points: d.points,
                    color: teamColor(d.Constructors.at(-1)?.constructorId),
                  };
                })}
              />
            )}
            {tab === "teams" && (
              <StandingsTable
                rows={state.teams.map((t) => ({
                  key: t.Constructor.constructorId,
                  position: t.position,
                  name: t.Constructor.name,
                  wins: t.wins,
                  points: t.points,
                  color: teamColor(t.Constructor.constructorId),
                }))}
              />
            )}
          </>
        )}
      </section>
    </PageWrap>
  );
}
