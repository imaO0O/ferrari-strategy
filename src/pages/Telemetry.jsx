import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import PageWrap from "../components/PageWrap";
import TrackMap from "../components/TrackMap";
import TyreStrategy, { compoundOf } from "../components/TyreStrategy";
import RaceStory from "../components/RaceStory";
import LapCompare from "../components/LapCompare";
import PitStops from "../components/PitStops";
import LiveTrackMap from "../components/LiveTrackMap";

/* Погода сессии: последние показания метеостанции */
function WeatherChips({ sessionKey }) {
  const [w, setW] = useState(null);
  useEffect(() => {
    let alive = true;
    of1
      .weather(sessionKey)
      .then((rows) => alive && setW(rows.at(-1) ?? null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [sessionKey]);
  if (!w) return null;
  const chips = [
    w.track_temperature != null && `Трасса ${Math.round(w.track_temperature)}°`,
    w.air_temperature != null && `Воздух ${Math.round(w.air_temperature)}°`,
    w.humidity != null && `Влажность ${Math.round(w.humidity)}%`,
    w.rainfall ? "Дождь" : "Сухо",
  ].filter(Boolean);
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {chips.map((c) => (
        <span
          key={c}
          className="rounded-md border border-line bg-panel px-3 py-1.5 font-digits text-xs text-dim"
        >
          {c}
        </span>
      ))}
    </div>
  );
}
import { Reveal, KineticTitle, Marquee, SectionTitle, EASE } from "../components/ui";
import { of1 } from "../lib/openf1";
import { circuitGpRu } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";
import { WaveMotif } from "../components/motifs";
import EmptyState from "../components/EmptyState";
import DataNote from "../components/DataNote";
import { loadFav, isFavOpenF1 } from "../lib/favorite";

/* Стиль строки башни: «мой пилот» — жёлтый, Ferrari — красный */
const towerRowStyle = (driver) =>
  isFavOpenF1(loadFav(), driver)
    ? "border-giallo/60 bg-giallo/[0.06]"
    : driver.team === "Ferrari"
      ? "border-rosso/50 bg-rosso/5"
      : "border-line bg-panel";

/* Телеметрия: браузерный реплей любой прошедшей гонки сезона на данных
   OpenF1 — башня позиций со счётчиком кругов, карта трассы и радио Ferrari. */

const SPEEDS = [60, 120, 300]; // секунд гонки за секунду реального времени

const fmtClock = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor(total / 60) % 60;
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const sessionDateRu = (session) =>
  new Date(session.date_start).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function ReplayTower({ drivers, events, t0, duration, lapMarks }) {
  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(SPEEDS[1]);
  const raf = useRef(null);
  const last = useRef(0);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const loop = (t) => {
      const dt = t - last.current;
      last.current = t;
      setClock((c) => {
        const next = c + dt * speed;
        if (next >= duration) {
          setPlaying(false);
          return duration;
        }
        return next;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, speed, duration]);

  // расстановка на текущий момент реплея
  const order = useMemo(() => {
    const cutoff = t0 + clock;
    const pos = {};
    for (const e of events) {
      if (e.t > cutoff) break;
      pos[e.n] = e.p;
    }
    return Object.entries(pos)
      .map(([n, p]) => ({ driver: drivers[n], p }))
      .filter((r) => r.driver)
      .sort((a, b) => a.p - b.p);
  }, [clock, events, t0, drivers]);

  // текущий круг — по времени старта кругов пилота Ferrari
  const currentLap = useMemo(() => {
    if (!lapMarks?.length) return null;
    const cutoff = t0 + clock;
    let lap = lapMarks[0].n;
    for (const m of lapMarks) {
      if (m.t > cutoff) break;
      lap = m.n;
    }
    return lap;
  }, [clock, lapMarks, t0]);

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      {/* управление */}
      <Reveal className="h-fit rounded-xl border border-line bg-panel p-6 lg:sticky lg:top-24">
        <p className="font-digits text-4xl font-bold tabular-nums text-giallo">{fmtClock(clock)}</p>
        <p className="mt-1 text-[10px] font-bold tracking-[0.35em] text-dim">
          ВРЕМЯ ГОНКИ
          {currentLap != null && lapMarks?.length ? (
            <span className="ml-3 text-giallo">КРУГ {currentLap}/{lapMarks.length}</span>
          ) : null}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => {
              if (clock >= duration) setClock(0);
              setPlaying((p) => !p);
            }}
            className="rounded-md bg-rosso px-6 py-3 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
          >
            {playing ? "Пауза" : clock >= duration ? "Сначала" : "Пуск"}
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={duration}
          value={clock}
          onChange={(e) => setClock(+e.target.value)}
          className="mt-6 w-full accent-rosso"
          aria-label="Перемотка реплея"
        />

        <p className="mt-6 text-[10px] font-bold tracking-[0.35em] text-dim">
          СКОРОСТЬ · ×РЕАЛЬНОГО ВРЕМЕНИ
        </p>
        <div className="mt-2 flex gap-2">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded-md px-3 py-2 font-digits text-xs font-bold transition-colors ${
                speed === s ? "bg-rosso text-white" : "bg-panel2 text-dim hover:text-white"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-dim">
          На скорости 120× двухчасовая гонка пролетает за минуту. Перематывай слайдером —
          расстановка пересчитается мгновенно.
        </p>
      </Reveal>

      {/* башня позиций */}
      <div className="space-y-1.5">
        {order.length === 0 && (
          <p className="text-dim">Нажми «Пуск» — машины выстроятся на стартовой решётке.</p>
        )}
        {order.map(({ driver, p }) => (
          <motion.div
            key={driver.number}
            layout
            transition={{ duration: 0.5, ease: EASE }}
            className={`flex items-center gap-3 rounded-md border px-4 py-2.5 ${towerRowStyle(driver)}`}
          >
            <span
              className={`inline-flex min-w-9 justify-center rounded-md px-2 py-1 font-digits text-xs font-bold ${
                p <= 3 ? "bg-rosso text-white" : "bg-panel2 text-dim"
              }`}
            >
              P{p}
            </span>
            <span className="h-6 w-1 rounded-full" style={{ background: driver.color }} />
            <span className="font-digits text-sm text-dim">{driver.number}</span>
            <span className="flex-1 truncate font-bold uppercase tracking-wide">
              {driver.acronym} <span className="hidden text-dim sm:inline">· {driver.team}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* Live-режим: во время сессии показываем текущую расстановку,
   обновляя её раз в 60 секунд (без кэша) */
function LiveTower({ sessionKey, drivers }) {
  const [order, setOrder] = useState(null);
  const [extra, setExtra] = useState({});
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [rows, intervalRows, stintRows] = await Promise.all([
          of1.positionsFresh(sessionKey),
          of1.intervalsFresh(sessionKey).catch(() => []),
          of1.stintsFresh(sessionKey).catch(() => []),
        ]);
        if (!alive) return;
        const pos = {};
        for (const r of rows.sort((a, b) => Date.parse(a.date) - Date.parse(b.date))) {
          pos[r.driver_number] = r.position;
        }
        // последний интервал и текущий комплект резины по каждому пилоту
        const info = {};
        for (const r of intervalRows.sort((a, b) => Date.parse(a.date) - Date.parse(b.date))) {
          (info[r.driver_number] ??= {}).gap = r.gap_to_leader;
        }
        for (const s of stintRows.sort((a, b) => a.stint_number - b.stint_number)) {
          (info[s.driver_number] ??= {}).compound = s.compound;
        }
        setOrder(
          Object.entries(pos)
            .map(([n, p]) => ({ driver: drivers[n], p }))
            .filter((r) => r.driver)
            .sort((a, b) => a.p - b.p),
        );
        setExtra(info);
        setUpdated(new Date());
      } catch {
        /* пропускаем тик — попробуем через минуту */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [sessionKey, drivers]);

  return (
    <div>
      <p className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
        <span className="animate-pulse text-rosso">● LIVE</span>
        <span className="text-dim">
          обновление раз в 60 с
          {updated &&
            ` · последнее: ${updated.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
        </span>
      </p>
      {order == null && <div className="h-96 animate-pulse rounded-xl bg-panel" />}
      <div className="space-y-1.5">
        {order?.map(({ driver, p }) => {
          const info = extra[driver.number] ?? {};
          const comp = info.compound ? compoundOf(info.compound) : null;
          return (
            <motion.div
              key={driver.number}
              layout
              transition={{ duration: 0.5, ease: EASE }}
              className={`flex items-center gap-3 rounded-md border px-4 py-2.5 ${
                driver.team === "Ferrari" ? "border-rosso/50 bg-rosso/5" : "border-line bg-panel"
              }`}
            >
              <span
                className={`inline-flex min-w-9 justify-center rounded-md px-2 py-1 font-digits text-xs font-bold ${
                  p <= 3 ? "bg-rosso text-white" : "bg-panel2 text-dim"
                }`}
              >
                P{p}
              </span>
              <span className="h-6 w-1 rounded-full" style={{ background: driver.color }} />
              <span className="font-digits text-sm text-dim">{driver.number}</span>
              <span className="flex-1 truncate font-bold uppercase tracking-wide">
                {driver.acronym} <span className="hidden text-dim sm:inline">· {driver.team}</span>
              </span>
              {comp && (
                <span
                  title={comp.ru}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-carbon"
                  style={{ background: comp.color }}
                >
                  {comp.letter}
                </span>
              )}
              <span className="min-w-16 text-right font-digits text-xs text-dim">
                {p === 1
                  ? "ЛИДЕР"
                  : typeof info.gap === "number"
                    ? `+${info.gap.toFixed(1)}`
                    : (info.gap ?? "")}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function FerrariRadio({ sessionKey, drivers }) {
  const [clips, setClips] = useState(null);

  useEffect(() => {
    let alive = true;
    const ferrariNumbers = Object.values(drivers)
      .filter((d) => d.team === "Ferrari")
      .map((d) => d.number);
    if (!ferrariNumbers.length) {
      setClips([]);
      return;
    }
    Promise.all(ferrariNumbers.map((n) => of1.teamRadio(sessionKey, n).catch(() => [])))
      .then((lists) => {
        if (!alive) return;
        const all = lists
          .flat()
          .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
          .slice(-8)
          .reverse();
        setClips(all);
      })
      .catch(() => alive && setClips([]));
    return () => {
      alive = false;
    };
  }, [sessionKey, drivers]);

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle kicker="BOX BOX" title="Радио Ferrari" className="mb-4" />
        <p className="mb-10 max-w-2xl text-dim">
          Настоящие переговоры пилотов Ferrari с командным мостиком в этой гонке. Нажми
          play — услышишь то же, что слышал гоночный инженер. Записи публикует OpenF1.
        </p>
        {clips == null && <div className="h-40 animate-pulse rounded-xl bg-panel" />}
        {clips?.length === 0 && (
          <p className="text-dim">
            Для этой гонки записей радио пока нет — OpenF1 выкладывает их с задержкой.
          </p>
        )}
        {clips?.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {clips.map((clip, i) => {
              const d = drivers[clip.driver_number];
              return (
                <Reveal key={clip.recording_url} delay={(i % 2) * 0.06}>
                  <div className="flex items-center gap-4 rounded-xl border border-line bg-panel p-4">
                    <span className="rounded-md bg-rosso px-2.5 py-1.5 font-digits text-xs font-bold">
                      {d?.acronym ?? clip.driver_number}
                    </span>
                    <span className="font-digits text-[10px] text-dim">
                      {new Date(clip.date).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <audio controls preload="none" src={clip.recording_url} className="h-10 w-full" />
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Telemetry() {
  usePageMeta(
    "Телеметрия — реплей гонок Ф1, стратегия шин и радио Ferrari",
    "Браузерный реплей любой гонки сезона: башня позиций, стратегия шин, история гонки, карта трассы и радиопереговоры Ferrari.",
  );
  const [sessions, setSessions] = useState(null);
  const [sessionKey, setSessionKey] = useState(null);
  const [state, setState] = useState({ status: "loading" });

  // список прошедших гонок сезона (или прошлого, если сезон ещё не начался)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const year = new Date().getFullYear();
        let list = await of1.raceSessions(year);
        let past = list.filter((s) => Date.parse(s.date_start) < Date.now());
        if (!past.length) {
          list = await of1.raceSessions(year - 1);
          past = list.filter((s) => Date.parse(s.date_start) < Date.now());
        }
        if (!past.length) throw new Error("Нет доступных гонок");
        if (alive) {
          setSessions(past);
          setSessionKey(past.at(-1).session_key);
        }
      } catch (e) {
        if (alive) setState({ status: "error", message: e.message });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // данные выбранной гонки
  useEffect(() => {
    if (!sessionKey || !sessions) return;
    let alive = true;
    setState({ status: "loading" });
    (async () => {
      try {
        const session = sessions.find((s) => s.session_key === sessionKey);
        const [driverList, positionRows] = await Promise.all([
          of1.drivers(sessionKey),
          of1.positions(sessionKey),
        ]);

        const drivers = {};
        for (const d of driverList) {
          drivers[d.driver_number] = {
            number: d.driver_number,
            acronym: d.name_acronym,
            name: d.full_name,
            color: d.team_colour ? `#${d.team_colour}` : "#8a8a93",
            team: d.team_name,
          };
        }

        const events = positionRows
          .map((r) => ({ t: Date.parse(r.date), n: r.driver_number, p: r.position }))
          .sort((a, b) => a.t - b.t);
        if (!events.length) throw new Error("Нет данных о позициях");

        // все круги сессии: счётчик «КРУГ N/M» + «история гонки»
        const allLaps = await of1.lapsAll(sessionKey).catch(() => []);
        const ferrari = driverList.find((d) => d.team_name === "Ferrari") ?? driverList[0];
        const lapMarks = allLaps
          .filter((l) => l.driver_number === ferrari?.driver_number && l.date_start)
          .map((l) => ({ n: l.lap_number, t: Date.parse(l.date_start) }))
          .sort((a, b) => a.n - b.n);

        // финишный порядок — последняя известная позиция каждого пилота
        const finalPos = {};
        for (const e of events) finalPos[e.n] = e.p;
        const finishOrder = Object.entries(finalPos)
          .sort((a, b) => a[1] - b[1])
          .map(([n]) => +n);

        if (!alive) return;
        setState({
          status: "ready",
          loadedAt: Date.now(),
          session,
          drivers,
          events,
          lapMarks,
          laps: allLaps,
          finishOrder,
          t0: events[0].t,
          duration: events.at(-1).t - events[0].t,
        });
      } catch (e) {
        if (alive) setState({ status: "error", message: e.message });
      }
    })();
    return () => {
      alive = false;
    };
  }, [sessionKey, sessions]);

  return (
    <PageWrap>
      <section className="relative mx-auto max-w-7xl px-5 pb-10 pt-32 md:pt-40">
        <WaveMotif />
        <Reveal>
          <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
            <span className="inline-block h-px w-10 bg-giallo" />
            БРАУЗЕРНЫЙ РЕПЛЕЙ ГОНОК · ДАННЫЕ OPENF1
          </p>
        </Reveal>
        <h1 className="text-[13vw] font-black uppercase italic leading-[0.85] tracking-tight md:text-[8rem]">
          <KineticTitle text="ТЕЛЕМЕТРИЯ" />
        </h1>

        {sessions && (
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <label
                className="text-sm font-bold uppercase tracking-widest text-dim"
                htmlFor="race-session"
              >
                Гонка
              </label>
              <select
                id="race-session"
                value={sessionKey ?? ""}
                onChange={(e) => setSessionKey(+e.target.value)}
                className="rounded-md border border-line bg-panel px-4 py-2.5 font-bold uppercase tracking-wide outline-none transition-colors focus:border-rosso"
              >
                {[...sessions].reverse().map((s) => {
                  const live =
                    Date.parse(s.date_start) <= Date.now() &&
                    Date.now() <= Date.parse(s.date_end);
                  return (
                    <option key={s.session_key} value={s.session_key}>
                      {circuitGpRu(s.circuit_short_name)} · {sessionDateRu(s)}
                      {live ? " · LIVE" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            {sessionKey && <WeatherChips sessionKey={sessionKey} />}
          </Reveal>
        )}
      </section>

      <Marquee
        items={["LIVE TIMING", "✦", "BOX BOX", "✦", "FERRARI STRATEGY", "✦"]}
        speed={24}
        className="border-y border-line bg-panel py-2.5 text-sm font-bold uppercase tracking-wider text-dim"
        itemClassName="mx-4"
      />

      <section className="mx-auto max-w-7xl px-5 py-14">
        {state.status === "loading" && <div className="h-96 animate-pulse rounded-xl bg-panel" />}
        {state.status === "error" && (
          <EmptyState
            title="Телеметрия сейчас недоступна"
            note="У OpenF1 строгий лимит запросов, а данные появляются с задержкой после финиша. Подожди минуту и попробуй снова."
            actionLabel="Повторить"
            onAction={() => window.location.reload()}
          />
        )}
        {state.status === "ready" &&
          (() => {
            const isLive =
              Date.parse(state.session.date_start) <= Date.now() &&
              Date.now() <= Date.parse(state.session.date_end);
            return isLive ? (
              <>
                <SectionTitle kicker="LA GARA" title="Гонка сейчас" className="mb-4" />
                <p className="mb-10 max-w-2xl text-dim">
                  <span className="text-white">
                    {circuitGpRu(state.session.circuit_short_name)}
                  </span>{" "}
                  идёт прямо сейчас — ниже живая расстановка. Пилоты Ferrari подсвечены
                  красным. Forza!
                </p>
                <LiveTower sessionKey={state.session.session_key} drivers={state.drivers} />
              </>
            ) : (
              <>
                <SectionTitle kicker="LA GARA" title="Реплей позиций" className="mb-4" />
                <p className="mb-10 max-w-2xl text-dim">
                  Как менялась расстановка по ходу{" "}
                  <span className="text-white">
                    {circuitGpRu(state.session.circuit_short_name)}
                  </span>{" "}
                  ({sessionDateRu(state.session)}): обгоны, пит-стопы и сходы — позиция за
                  позицией. Пилоты Ferrari подсвечены красным.
                </p>
                <ReplayTower
                  drivers={state.drivers}
                  events={state.events}
                  t0={state.t0}
                  duration={state.duration}
                  lapMarks={state.lapMarks}
                />
                <DataNote source="OpenF1 API" updatedAt={state.loadedAt} />
              </>
            );
          })()}
      </section>

      {state.status === "ready" && (
        <>
          {Date.now() > Date.parse(state.session.date_end) ? (
            <>
              <TyreStrategy
                key={`tyres-${state.session.session_key}`}
                sessionKey={state.session.session_key}
                drivers={state.drivers}
                finishOrder={state.finishOrder}
              />
              <PitStops
                key={`pits-${state.session.session_key}`}
                sessionKey={state.session.session_key}
                drivers={state.drivers}
              />
              <RaceStory
                laps={state.laps}
                drivers={state.drivers}
                finishOrder={state.finishOrder}
              />
              <LapCompare
                key={`pace-${state.session.session_key}`}
                laps={state.laps}
                drivers={state.drivers}
                finishOrder={state.finishOrder}
              />
              <TrackMap
                key={state.session.session_key}
                session={state.session}
                drivers={state.drivers}
              />
            </>
          ) : (
            <LiveTrackMap
              key={`live-map-${state.session.session_key}`}
              sessionKey={state.session.session_key}
              drivers={state.drivers}
            />
          )}
          <FerrariRadio sessionKey={state.session.session_key} drivers={state.drivers} />
        </>
      )}
    </PageWrap>
  );
}
