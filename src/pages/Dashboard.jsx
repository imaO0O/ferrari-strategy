import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrap from "../components/PageWrap";
import OnThisDay from "../components/OnThisDay";
import Predictions from "../components/Predictions";
import { Reveal, KineticTitle, SectionTitle, Marquee } from "../components/ui";
import { Countdown, PosChip, raceDate } from "../components/racing";
import { api } from "../lib/api";
import { useWeekend, sessionRu, fmtSessionTime } from "../lib/useWeekend";
import { usePageMeta } from "../lib/usePageMeta";
import { GaugeMotif } from "../components/motifs";
import EmptyState from "../components/EmptyState";
import { loadFav } from "../lib/favorite";
import DataNote from "../components/DataNote";
import { gpRu, countryRu, driverRu, formatDateRu, teamColor, circuitGpRu } from "../lib/i18n";

/* Расписание сессий текущего гоночного уик-энда (появляется только в дни ГП) */
function WeekendSchedule() {
  const weekend = useWeekend();
  if (!weekend) return null;
  const now = Date.now();
  return (
    <Reveal className="mb-8 rounded-xl border border-rosso/40 bg-rosso/[0.04] p-6 md:p-8">
      <p className="flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-rosso">
        <span className="inline-block h-px w-10 bg-rosso" />
        ГОНОЧНЫЙ УИК-ЭНД · {circuitGpRu(weekend.circuit).toUpperCase()}
      </p>
      <div className="mt-4 grid gap-2">
        {weekend.sessions.map((s) => {
          const started = Date.parse(s.date_start) <= now;
          const ended = Date.parse(s.date_end) < now;
          const live = started && !ended;
          return (
            <div
              key={s.session_key}
              className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md px-4 py-2.5 ${
                live ? "bg-rosso/15" : ended ? "bg-panel2/40 opacity-50" : "bg-panel2/60"
              }`}
            >
              <span className="min-w-44 font-bold uppercase tracking-wide">
                {sessionRu(s.session_name)}
              </span>
              <span className="flex-1 text-sm text-dim">
                {fmtSessionTime(s.date_start)} · твоё местное время
              </span>
              {live && (
                <span className="animate-pulse font-digits text-xs font-bold text-rosso">● LIVE</span>
              )}
              {ended && <span className="font-digits text-[10px] text-dim">ЗАВЕРШЕНА</span>}
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}

function StandingsCard({ title, rows, linkTab }) {
  return (
    <Reveal className="rounded-xl border border-line bg-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-black uppercase italic">{title}</h3>
        <Link
          to={`/races?tab=${linkTab}`}
          className="text-xs font-bold uppercase tracking-widest text-dim transition-colors hover:text-rosso"
        >
          Вся таблица →
        </Link>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className={`flex items-center gap-3 rounded-md px-3 py-2 ${
              loadFav()?.id === row.key ? "bg-giallo/[0.08]" : "bg-panel2/60"
            }`}
          >
            <PosChip position={row.position} />
            <span className="h-6 w-1 rounded-full" style={{ background: row.color }} />
            <span className="min-w-0 flex-1 truncate font-bold uppercase tracking-wide">
              {row.name}
            </span>
            <span className="font-digits text-sm text-giallo">{row.points}</span>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

export default function Dashboard() {
  usePageMeta(
    "Дашборд Формулы-1 — зачёты, прогнозы, следующая гонка",
    "Обзор сезона Ф1: положение в чемпионате, подиум последней гонки, прогнозы на Гран-при и расписание гоночного уик-энда.",
  );
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [ds, cs, sched, last] = await Promise.all([
          api.driverStandings(),
          api.constructorStandings(),
          api.schedule(),
          api.lastRaceResults(),
        ]);
        if (!alive) return;
        const now = Date.now();
        const driversAll = ds.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
        setState({
          status: "ready",
          loadedAt: Date.now(),
          driversAll,
          drivers: driversAll.slice(0, 5),
          teams: (cs.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []).slice(0, 5),
          nextRace:
            (sched.RaceTable.Races ?? []).find((r) => raceDate(r).getTime() > now) ?? null,
          lastRace: last.RaceTable.Races?.[0] ?? null,
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

  const { drivers, driversAll, teams, nextRace, lastRace, season } =
    state.status === "ready" ? state : {};

  return (
    <PageWrap>
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-32 md:pt-40">
        <GaugeMotif />
        <Reveal>
          <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
            <span className="inline-block h-px w-10 bg-giallo" />
            СЕЗОН {season ?? "…"} · ЖИВЫЕ ДАННЫЕ
          </p>
        </Reveal>
        <h1 className="text-[13vw] font-black uppercase italic leading-[0.85] tracking-tight md:text-[8rem]">
          <KineticTitle text="ДАШБОРД" />
        </h1>
      </section>

      <Marquee
        items={["FERRARI STRATEGY", "✦", "LIVE", "✦", "FORMULA 1", "✦"]}
        speed={24}
        className="border-y border-line bg-panel py-2.5 text-sm font-bold uppercase tracking-wider text-dim"
        itemClassName="mx-4"
      />

      {state.status === "error" && (
        <div className="mx-auto max-w-7xl px-5 py-16">
          <EmptyState
            title="Живые данные сейчас недоступны"
            note="Jolpica F1 API не ответил — обычно это ненадолго."
            actionLabel="Повторить"
            onAction={() => window.location.reload()}
          />
        </div>
      )}

      {state.status === "loading" && (
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-panel" />
          ))}
        </div>
      )}

      {state.status === "ready" && (
        <>
          {/* СЛЕДУЮЩАЯ ГОНКА */}
          <section className="mx-auto max-w-7xl px-5 py-16">
            <WeekendSchedule />
            {nextRace ? (
              <Reveal className="rounded-xl border border-line bg-panel p-8 md:p-10">
                <div className="flex flex-wrap items-end justify-between gap-8">
                  <div>
                    <span className="rounded-md bg-panel2 px-2.5 py-1 font-digits text-xs text-giallo">
                      ЭТАП {nextRace.round} · СЛЕДУЮЩАЯ ГОНКА
                    </span>
                    <h2 className="mt-4 text-4xl font-black uppercase italic leading-none md:text-6xl">
                      {gpRu(nextRace.raceName)}
                    </h2>
                    <p className="mt-3 text-dim">
                      {nextRace.Circuit.circuitName} — {nextRace.Circuit.Location.locality},{" "}
                      {countryRu(nextRace.Circuit.Location.country)} ·{" "}
                      {formatDateRu(nextRace.date, nextRace.time)}
                    </p>
                  </div>
                  <Countdown target={raceDate(nextRace).getTime()} />
                </div>
              </Reveal>
            ) : (
              <p className="text-dim">Сезон завершён — увидимся на зимних тестах.</p>
            )}
            <Predictions nextRace={nextRace} standings={driversAll} season={season} />
            <div className="mt-8">
              <OnThisDay />
            </div>
          </section>

          {/* ЗАЧЁТЫ */}
          <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 md:grid-cols-2">
            <StandingsCard
              title="Личный зачёт · топ-5"
              linkTab="drivers"
              rows={drivers.map((d) => {
                const name = driverRu(d.Driver);
                return {
                  key: d.Driver.driverId,
                  position: d.position,
                  name: `${name.given} ${name.family}`,
                  points: d.points,
                  color: teamColor(d.Constructors.at(-1)?.constructorId),
                };
              })}
            />
            <StandingsCard
              title="Кубок конструкторов · топ-5"
              linkTab="teams"
              rows={teams.map((t) => ({
                key: t.Constructor.constructorId,
                position: t.position,
                name: t.Constructor.name,
                points: t.points,
                color: teamColor(t.Constructor.constructorId),
              }))}
            />
            <div className="-mt-2 md:col-span-2">
              <DataNote updatedAt={state.loadedAt} />
            </div>
          </section>

          {/* ПОДИУМ ПОСЛЕДНЕЙ ГОНКИ */}
          {lastRace && (
            <section className="border-t border-line">
              <div className="mx-auto max-w-7xl px-5 py-16">
                <SectionTitle
                  kicker="ULTIMA GARA"
                  title={`Подиум · ${gpRu(lastRace.raceName)}`}
                  className="mb-10"
                />
                <div className="grid gap-6 md:grid-cols-3">
                  {(lastRace.Results ?? []).slice(0, 3).map((res, i) => {
                    const name = driverRu(res.Driver);
                    return (
                      <Reveal
                        key={res.Driver.driverId}
                        delay={i * 0.1}
                        className={`relative overflow-hidden rounded-xl border border-line bg-panel p-6 ${
                          i === 0 ? "md:-translate-y-3" : ""
                        }`}
                      >
                        <span className="pointer-events-none absolute -right-3 -top-9 font-digits text-[7rem] font-black leading-none text-outline-rosso opacity-70">
                          {res.position}
                        </span>
                        <span className="h-8 w-1.5 rounded-full" style={{ background: teamColor(res.Constructor.constructorId), display: "inline-block" }} />
                        <p className="mt-4 text-lg font-semibold text-dim">{name.given}</p>
                        <h3 className="text-3xl font-black uppercase italic leading-none">
                          {name.family}
                        </h3>
                        <p className="mt-2 text-sm text-dim">{res.Constructor.name}</p>
                        <p className="mt-4 font-digits text-sm text-giallo">
                          {res.Time?.time ?? res.status} · +{res.points} очк.
                        </p>
                      </Reveal>
                    );
                  })}
                </div>

                {/* авто-итоги: что решило гонку */}
                {(() => {
                  const results = lastRace.Results ?? [];
                  const fl = results.find((r) => r.FastestLap?.rank === "1");
                  const flName = fl && driverRu(fl.Driver);
                  const mover = results
                    .filter((r) => +r.grid > 0)
                    .map((r) => ({ r, delta: +r.grid - +r.position }))
                    .sort((a, b) => b.delta - a.delta)[0];
                  const moverName = mover && driverRu(mover.r.Driver);
                  const ferrariPts = results
                    .filter((r) => r.Constructor.constructorId === "ferrari")
                    .reduce((s, r) => s + +r.points, 0);
                  const facts = [
                    fl && {
                      label: "БЫСТРЕЙШИЙ КРУГ",
                      value: fl.FastestLap?.Time?.time ?? "—",
                      sub: `${flName.given} ${flName.family}`,
                    },
                    mover &&
                      mover.delta > 0 && {
                        label: "ПРОРЫВ ГОНКИ",
                        value: `+${mover.delta}`,
                        sub: `${moverName.given} ${moverName.family}: ${mover.r.grid} → ${mover.r.position}`,
                      },
                    {
                      label: "ОЧКИ FERRARI ЗА ГОНКУ",
                      value: `+${ferrariPts}`,
                      sub: ferrariPts >= 25 ? "Отличный урожай!" : ferrariPts > 0 ? "В копилку Кубка конструкторов" : "Бывает и такое…",
                    },
                  ].filter(Boolean);
                  return (
                    <div className="mt-8 grid gap-5 sm:grid-cols-3">
                      {facts.map((f, i) => (
                        <Reveal key={f.label} delay={i * 0.07}>
                          <div className="h-full rounded-xl border border-line bg-panel p-5">
                            <p className="text-[9px] font-bold tracking-[0.35em] text-dim">{f.label}</p>
                            <p className="mt-2 font-digits text-3xl font-bold text-giallo">{f.value}</p>
                            <p className="mt-1 text-sm text-dim">{f.sub}</p>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  );
                })()}

                {/* решётка → финиш: кто отыграл, кто провалился */}
                <Reveal className="mt-8">
                  <p className="mb-3 text-[9px] font-bold tracking-[0.35em] text-dim">
                    РЕШЁТКА → ФИНИШ
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(lastRace.Results ?? [])
                      .filter((r) => +r.grid > 0)
                      .map((r) => ({ r, delta: +r.grid - +r.position }))
                      .sort((a, b) => b.delta - a.delta)
                      .map(({ r, delta }) => (
                        <span
                          key={r.Driver.driverId}
                          className={`rounded-md px-2.5 py-1.5 font-digits text-xs font-bold ${
                            delta > 0
                              ? "bg-giallo/10 text-giallo"
                              : delta < 0
                                ? "bg-rosso/10 text-rosso"
                                : "bg-panel2 text-dim"
                          }`}
                          title={`Старт ${r.grid}, финиш ${r.position}`}
                        >
                          {r.Driver.code ?? r.Driver.familyName.slice(0, 3).toUpperCase()}{" "}
                          {r.grid}→{r.position} {delta > 0 ? `▲${delta}` : delta < 0 ? `▼${-delta}` : "="}
                        </span>
                      ))}
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          {/* ПЛИТКИ-ССЫЛКИ */}
          <section className="border-t border-line">
            <div className="mx-auto grid max-w-7xl gap-5 px-5 py-16 sm:grid-cols-3">
              {[
                { to: "/", label: "Скудерия", sub: "Всё о Ferrari" },
                { to: "/telemetry", label: "Телеметрия", sub: "Реплей гонки и радио" },
                { to: "/games", label: "Игры", sub: "Реакция · Пит-стоп · Викторина · Трассы" },
              ].map(({ to, label, sub }, i) => (
                <Reveal key={to} delay={i * 0.08}>
                  <Link
                    to={to}
                    className="group block rounded-xl border border-line bg-panel p-6 transition-colors hover:border-rosso/60"
                  >
                    <p className="text-2xl font-black uppercase italic transition-colors group-hover:text-rosso">
                      {label} →
                    </p>
                    <p className="mt-1 text-sm text-dim">{sub}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        </>
      )}
    </PageWrap>
  );
}
