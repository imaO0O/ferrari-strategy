import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import PageWrap from "../components/PageWrap";
import Magnetic from "../components/Magnetic";
import Confetti from "../components/Confetti";
import SeasonChart from "../components/SeasonChart";
import {
  Reveal,
  ImageReveal,
  KineticTitle,
  Counter,
  Marquee,
  SectionTitle,
} from "../components/ui";
import { Countdown } from "../components/racing";
import { api, daysSinceLastTitle } from "../lib/api";
import { commonsFile, DRIVER_PHOTOS } from "../lib/images";
import { gpRu, countryRu, driverRu, formatDateRu } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";

const FERRARI_ID = "ferrari";

const Hero3D = lazy(() => import("../components/three/Hero3D"));

const hasWebGL = (() => {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
})();

function HeroPhoto() {
  return (
    <img
      src={commonsFile("SF-24 at the Japanese GP.jpg", 1800)}
      alt="Болид Ferrari Формулы-1 на трассе"
      className="ken-burns h-full w-full object-cover"
    />
  );
}

function deriveSeason({ cs, ds, sched, fr, allWins }) {
  const csList = cs.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
  const team = csList.find((s) => s.Constructor.constructorId === FERRARI_ID) ?? null;
  const leader = csList[0] ?? null;

  let gapLabel = null;
  if (team && leader) {
    if (team.position === "1") {
      const runnerUp = csList[1];
      gapLabel = runnerUp
        ? `+${(+team.points - +runnerUp.points).toFixed(0)} ОЧК. ОТРЫВА`
        : "ЛИДЕР";
    } else {
      gapLabel = `−${(+leader.points - +team.points).toFixed(0)} ОЧК. ДО P1`;
    }
  }

  const drivers = (ds.StandingsTable.StandingsLists[0]?.DriverStandings ?? []).filter(
    (d) => d.Constructors.some((c) => c.constructorId === FERRARI_ID),
  );

  const races = fr.RaceTable.Races ?? [];
  const byDriver = {};
  let podiums = 0;
  for (const race of races) {
    for (const res of race.Results ?? []) {
      const id = res.Driver.driverId;
      (byDriver[id] ??= []).push({ round: race.round, position: +res.position });
      if (+res.position <= 3) podiums++;
    }
  }

  const now = Date.now();
  const allRaces = sched.RaceTable.Races ?? [];
  const future = allRaces.filter(
    (r) => new Date(`${r.date}T${r.time ?? "12:00:00Z"}`).getTime() > now,
  );

  return {
    team,
    gapLabel,
    drivers,
    byDriver,
    podiums,
    lastRaces: races.slice(-5).reverse(),
    nextRace: future[0] ?? null,
    seasonLabel: fr.RaceTable.season,
    allTimeWins: +allWins.total || null,
    topTeams: csList.slice(0, 3),
    leaderPoints: leader ? +leader.points : null,
    remainingRaces: future.length,
    remainingSprints: future.filter((r) => r.Sprint).length,
  };
}

function FormBars({ results }) {
  const last5 = (results ?? []).slice(-5);
  if (!last5.length) return null;
  return (
    <div>
      <p className="mb-2 text-[9px] font-bold tracking-[0.35em] text-dim">ПОСЛЕДНИЕ 5 ГОНОК</p>
      <div className="flex items-end gap-2">
        {last5.map(({ round, position }) => (
          <div key={round} className="flex flex-col items-center gap-1">
            <motion.div
              className={`w-7 rounded-sm ${position <= 3 ? "bg-rosso" : "bg-line"}`}
              initial={{ height: 0 }}
              whileInView={{ height: `${Math.max(10, ((21 - position) / 20) * 64)}px` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="font-digits text-[10px] text-dim">P{position}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DriverCard({ standing, results, index }) {
  const d = standing.Driver;
  const name = driverRu(d);
  const photo = DRIVER_PHOTOS[d.driverId];
  const wins = (results ?? []).filter((r) => r.position === 1).length;
  const podiums = (results ?? []).filter((r) => r.position <= 3).length;

  return (
    <Reveal delay={index * 0.12} className="group relative overflow-hidden rounded-xl border border-line bg-panel">
      <span className="pointer-events-none absolute -right-4 -top-8 z-10 font-digits text-[9rem] font-black leading-none text-outline-rosso opacity-80 md:text-[11rem]">
        {d.permanentNumber}
      </span>
      {photo ? (
        <ImageReveal
          src={commonsFile(photo, 900)}
          alt={`${name.given} ${name.family}`}
          className="h-80 md:h-[26rem]"
          imgClassName="object-top"
        />
      ) : (
        <div className="flex h-80 items-center justify-center bg-panel2 md:h-[26rem]">
          <span className="font-digits text-8xl font-black text-line">{d.permanentNumber}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-panel to-transparent" />
      <div className="relative -mt-16 px-6 pb-6">
        <p className="text-lg font-semibold text-dim">{name.given}</p>
        <h3 className="text-4xl font-black uppercase italic leading-none tracking-tight md:text-5xl">
          {name.family}
        </h3>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div className="flex gap-8">
            <div>
              <span className="font-digits text-4xl font-bold text-rosso">{standing.points}</span>
              <p className="mt-1 text-[9px] font-bold tracking-[0.35em] text-dim">ОЧКИ · P{standing.position}</p>
            </div>
            <div>
              <span className="font-digits text-4xl font-bold">{wins}</span>
              <p className="mt-1 text-[9px] font-bold tracking-[0.35em] text-dim">ПОБЕДЫ</p>
            </div>
            <div>
              <span className="font-digits text-4xl font-bold">{podiums}</span>
              <p className="mt-1 text-[9px] font-bold tracking-[0.35em] text-dim">ПОДИУМЫ</p>
            </div>
          </div>
          <FormBars results={results} />
        </div>
      </div>
    </Reveal>
  );
}

function StatBlock({ label, value, accent = false }) {
  return (
    <div className="border-l-2 border-rosso/50 pl-4">
      <Counter
        value={value}
        className={`font-digits text-5xl font-bold md:text-6xl ${accent ? "text-giallo" : ""}`}
      />
      <p className="mt-2 text-[9px] font-bold tracking-[0.35em] text-dim">{label}</p>
    </div>
  );
}

export default function Scuderia() {
  usePageMeta(
    "Скудерия — всё о Ferrari в Формуле-1",
    "Живая статистика Ferrari в сезоне Формулы-1: пилоты, очки, погоня за титулом, следующая гонка с обратным отсчётом.",
  );
  const [state, setState] = useState({ status: "loading" });
  const [winsAtNext, setWinsAtNext] = useState(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cs, ds, sched, fr, allWins] = await Promise.all([
          api.constructorStandings(),
          api.driverStandings(),
          api.schedule(),
          api.ferrariResults(),
          api.ferrariAllWins(),
        ]);
        if (alive) setState({ status: "ready", ...deriveSeason({ cs, ds, sched, fr, allWins }) });
      } catch (e) {
        if (alive) setState({ status: "error", message: e.message });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (state.status !== "ready" || !state.nextRace) return;
    let alive = true;
    api
      .ferrariWinsAtCircuit(state.nextRace.Circuit.circuitId)
      .then((d) => alive && setWinsAtNext(+d.total))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [state]);

  // график сезона: Ferrari против двух ближайших соперников
  const [chart, setChart] = useState(null);
  useEffect(() => {
    if (state.status !== "ready" || !state.topTeams?.length) return;
    let alive = true;
    const others = state.topTeams
      .map((t) => t.Constructor.constructorId)
      .filter((id) => id !== FERRARI_ID)
      .slice(0, 2);
    const ids = [FERRARI_ID, ...others];
    Promise.all(
      ids.map(async (id) => {
        const [res, spr] = await Promise.all([
          api.constructorResults(id),
          api.constructorSprints(id).catch(() => null),
        ]);
        const byRound = {};
        for (const race of res.RaceTable.Races ?? []) {
          byRound[+race.round] =
            (byRound[+race.round] ?? 0) +
            (race.Results ?? []).reduce((s, r) => s + +r.points, 0);
        }
        for (const race of spr?.RaceTable?.Races ?? []) {
          byRound[+race.round] =
            (byRound[+race.round] ?? 0) +
            (race.SprintResults ?? []).reduce((s, r) => s + +r.points, 0);
        }
        const rounds = Object.keys(byRound)
          .map(Number)
          .sort((a, b) => a - b);
        let acc = 0;
        const points = rounds.map((r) => (acc += byRound[r]));
        const name =
          state.topTeams.find((t) => t.Constructor.constructorId === id)?.Constructor.name ?? id;
        return { id, name, rounds, points };
      }),
    )
      .then((series) => alive && setChart(series.filter((s) => s.rounds.length)))
      .catch(() => alive && setChart([]));
    return () => {
      alive = false;
    };
  }, [state]);

  // салют, если Ferrari выиграла последнюю гонку (раз за сессию на гонку)
  const [confetti, setConfetti] = useState(false);
  useEffect(() => {
    if (state.status !== "ready") return;
    const latest = state.lastRaces[0];
    if (!latest?.Results?.some((r) => +r.position === 1)) return;
    const key = `fs-confetti-${state.seasonLabel}-${latest.round}`;
    if (sessionStorage.getItem(key)) return;
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      /* приватный режим */
    }
    setConfetti(true);
  }, [state]);

  const {
    team,
    gapLabel,
    drivers,
    byDriver,
    podiums,
    lastRaces,
    nextRace,
    seasonLabel,
    allTimeWins,
    leaderPoints,
    remainingRaces,
    remainingSprints,
  } = state.status === "ready" ? state : {};

  const pointsLeft =
    state.status === "ready" ? 43 * remainingRaces + 15 * remainingSprints : null;
  const titleGap =
    state.status === "ready" && team && leaderPoints != null
      ? Math.max(0, leaderPoints - +team.points)
      : null;

  return (
    <PageWrap>
      {confetti && (
        <>
          <Confetti onDone={() => setConfetti(false)} />
          <div className="pointer-events-none fixed inset-x-0 bottom-10 z-[94] text-center">
            <span className="rounded-md bg-rosso px-5 py-3 text-sm font-black uppercase tracking-widest shadow-lg">
              Ferrari выиграла последнюю гонку! Forza! 🏆
            </span>
          </div>
        </>
      )}
      {/* ГЛАВНЫЙ ЭКРАН */}
      <section ref={heroRef} className="relative flex h-[92vh] min-h-[560px] items-end overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          {hasWebGL ? (
            <>
              {/* красное свечение и гигантская надпись за болидом */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(58% 48% at 60% 40%, rgb(122 16 6 / 0.55), rgb(38 8 5 / 0.25) 55%, transparent 78%)",
                }}
              />
              <p className="absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[15vw] font-black italic leading-none text-outline opacity-60">
                FERRARI
              </p>
              <Suspense fallback={<HeroPhoto />}>
                <Hero3D />
              </Suspense>
            </>
          ) : (
            <HeroPhoto />
          )}
        </motion.div>
        {hasWebGL ? (
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-carbon to-transparent" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-carbon/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-carbon/70 to-transparent" />
          </>
        )}

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16">
          <Reveal>
            <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
              <span className="inline-block h-px w-10 bg-giallo" />
              НЕОФИЦИАЛЬНЫЙ ФАН-ПРОЕКТ · МАРАНЕЛЛО
            </p>
          </Reveal>
          <h1 className="text-[15vw] font-black uppercase italic leading-[0.82] tracking-tight md:text-[10rem]">
            <KineticTitle text="СКУДЕРИЯ" />
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {state.status === "loading" && (
              <span className="h-9 w-64 animate-pulse rounded-md bg-panel2" />
            )}
            {state.status === "ready" && team && (
              <>
                <span className="rounded-md bg-rosso px-3 py-1.5 font-digits text-sm font-bold">
                  P{team.position}
                </span>
                <span className="rounded-md border border-line bg-carbon/70 px-3 py-1.5 text-sm font-bold backdrop-blur">
                  {team.points} ОЧК. · КУБОК КОНСТРУКТОРОВ {seasonLabel}
                </span>
                {gapLabel && (
                  <span className="rounded-md border border-line bg-carbon/70 px-3 py-1.5 text-sm font-bold text-giallo backdrop-blur">
                    {gapLabel}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Marquee
        items={["FORZA FERRARI", "✦", "TIFOSI", "✦", "FERRARI STRATEGY", "✦", "MARANELLO", "✦"]}
        speed={22}
        className="-rotate-1 bg-rosso py-3 text-xl font-black uppercase italic text-carbon"
        itemClassName="mx-4"
      />

      {state.status === "error" && (
        <div className="mx-auto max-w-7xl px-5 py-16 text-center">
          <p className="text-xl font-bold">Живые данные сейчас недоступны.</p>
          <p className="mt-2 text-dim">
            Jolpica F1 API не ответил — статистика сезона появится, как только связь восстановится.
          </p>
          <Magnetic>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-md bg-rosso px-6 py-3 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
            >
              Повторить
            </button>
          </Magnetic>
        </div>
      )}

      {/* ПИЛОТЫ */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
        <SectionTitle kicker="I PILOTI" title="Пилоты" className="mb-12" />
        <div className="grid gap-8 md:grid-cols-2">
          {state.status === "loading" &&
            [0, 1].map((i) => (
              <div key={i} className="h-[34rem] animate-pulse rounded-xl bg-panel" />
            ))}
          {state.status === "ready" &&
            drivers.map((standing, i) => (
              <DriverCard
                key={standing.Driver.driverId}
                standing={standing}
                results={byDriver[standing.Driver.driverId]}
                index={i}
              />
            ))}
        </div>
      </section>

      {/* ЦИФРЫ СЕЗОНА */}
      <section className="carbon-bg border-y border-line">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <SectionTitle kicker="LA STAGIONE" title="Сезон в цифрах" className="mb-12" />
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <StatBlock label="ПОБЕДЫ В СЕЗОНЕ" value={team ? +team.wins : null} />
            <StatBlock label="ПОДИУМЫ В СЕЗОНЕ" value={state.status === "ready" ? podiums : null} />
            <StatBlock label="ОЧКИ В СЕЗОНЕ" value={team ? +team.points : null} />
            <StatBlock label="ПОБЕД ЗА ИСТОРИЮ F1" value={allTimeWins} accent />
          </div>

          <Reveal className="mt-20 rounded-xl border border-line bg-panel p-8 text-center md:p-14">
            <p className="text-[10px] font-bold tracking-[0.4em] text-dim">
              ДНЕЙ БЕЗ КУБКА КОНСТРУКТОРОВ
            </p>
            <Counter
              value={daysSinceLastTitle()}
              duration={2.4}
              className="mt-4 block font-digits text-7xl font-black text-giallo md:text-[9rem]"
            />
            <p className="mt-4 text-dim">…и счёт всё ещё идёт. Бразилия-2008 была давно. Forza Ferrari.</p>
          </Reveal>
        </div>
      </section>

      {/* ПОГОНЯ ЗА ТИТУЛОМ */}
      {state.status === "ready" && team && (
        <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
          <SectionTitle kicker="CACCIA AL TITOLO" title="Погоня за титулом" className="mb-4" />
          <p className="mb-10 max-w-2xl text-dim">
            Накопление очков в Кубке конструкторов по этапам сезона: Ferrari против двух
            ближайших соперников. Учтены гонки и спринты.
          </p>

          {chart == null && <div className="h-72 animate-pulse rounded-xl bg-panel" />}
          {chart?.length > 0 && (
            <Reveal className="rounded-xl border border-line bg-panel p-4 md:p-8">
              <SeasonChart series={chart} />
            </Reveal>
          )}

          <Reveal className="mt-8 grid gap-8 rounded-xl border border-line bg-panel p-8 md:grid-cols-3">
            <div className="border-l-2 border-rosso/50 pl-4">
              <Counter value={pointsLeft} className="font-digits text-5xl font-bold" />
              <p className="mt-2 text-[9px] font-bold tracking-[0.35em] text-dim">
                ОЧКОВ ЕЩЁ В ИГРЕ · {remainingRaces} ГОНОК, {remainingSprints} СПРИНТОВ
              </p>
            </div>
            <div className="border-l-2 border-rosso/50 pl-4">
              <Counter
                value={titleGap}
                className={`font-digits text-5xl font-bold ${titleGap === 0 ? "text-giallo" : ""}`}
              />
              <p className="mt-2 text-[9px] font-bold tracking-[0.35em] text-dim">
                {titleGap === 0 ? "ЛИДИРУЕМ В КУБКЕ КОНСТРУКТОРОВ" : "ОЧКОВ ДО ПЕРВОГО МЕСТА"}
              </p>
            </div>
            <div className="flex items-center">
              <p className="text-sm leading-relaxed text-dim">
                {titleGap === 0
                  ? "Ferrari во главе чемпионата — теперь главное не отдать своё. Forza!"
                  : titleGap > pointsLeft
                    ? "Математически титул в этом сезоне уже недосягаем. Но гонки для того и существуют, чтобы драться до последнего круга."
                    : remainingRaces > 0
                      ? `Титул жив: нужно отыгрывать в среднем ${(titleGap / remainingRaces).toFixed(1)} очка за уик-энд.`
                      : "Сезон завершён."}
              </p>
            </div>
          </Reveal>
        </section>
      )}

      {/* СЛЕДУЮЩАЯ ГОНКА */}
      {state.status !== "error" && (
        <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
          <SectionTitle kicker="PROSSIMA GARA" title="Следующая гонка" className="mb-12" />
          {state.status === "loading" && <div className="h-72 animate-pulse rounded-xl bg-panel" />}
          {state.status === "ready" && !nextRace && (
            <p className="text-dim">Сезон завершён — увидимся на зимних тестах. 🏁</p>
          )}
          {state.status === "ready" && nextRace && (
            <div className="grid items-stretch gap-8 lg:grid-cols-2">
              <Reveal className="flex flex-col justify-between rounded-xl border border-line bg-panel p-8">
                <div>
                  <span className="rounded-md bg-panel2 px-2.5 py-1 font-digits text-xs text-giallo">
                    ЭТАП {nextRace.round}
                  </span>
                  <h3 className="mt-4 text-4xl font-black uppercase italic leading-none md:text-5xl">
                    {gpRu(nextRace.raceName)}
                  </h3>
                  <p className="mt-3 text-dim">
                    {nextRace.Circuit.circuitName} — {nextRace.Circuit.Location.locality},{" "}
                    {countryRu(nextRace.Circuit.Location.country)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-dim">
                    {formatDateRu(nextRace.date, nextRace.time)}
                  </p>
                </div>
                <div className="mt-10">
                  <Countdown target={new Date(`${nextRace.date}T${nextRace.time ?? "12:00:00Z"}`).getTime()} />
                  {winsAtNext != null && (
                    <p className="mt-8 inline-block rounded-md border border-rosso/40 px-3 py-1.5 text-xs font-bold tracking-widest text-rosso">
                      ПОБЕД FERRARI НА ЭТОМ ГРАН-ПРИ: {winsAtNext}
                    </p>
                  )}
                </div>
              </Reveal>
              <ImageReveal
                src={commonsFile("Scuderia Ferrari Pit Stop2.JPG", 1200)}
                alt="Пит-стоп Scuderia Ferrari"
                className="min-h-72 rounded-xl border border-line"
              />
            </div>
          )}
        </section>
      )}

      {/* ПОСЛЕДНИЕ ГОНКИ */}
      {state.status === "ready" && lastRaces.length > 0 && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-7xl px-5 py-20">
            <SectionTitle kicker="RISULTATI" title="Последние гонки" className="mb-10" />
            <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {lastRaces.map((race, i) => (
                <Reveal key={race.round} delay={i * 0.06}>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-panel px-6 py-5 transition-colors hover:bg-panel2">
                    <span className="w-14 font-digits text-xs text-dim">R{race.round}</span>
                    <span className="min-w-40 flex-1 font-bold uppercase tracking-wide">
                      {gpRu(race.raceName)}
                    </span>
                    <span className="flex gap-2">
                      {(race.Results ?? []).map((res) => (
                        <span
                          key={res.Driver.driverId}
                          className={`rounded-md px-2.5 py-1 font-digits text-xs font-bold ${
                            +res.position <= 3 ? "bg-rosso text-white" : "bg-panel2 text-dim"
                          }`}
                        >
                          {res.Driver.code ?? res.Driver.familyName.slice(0, 3).toUpperCase()} P{res.position}
                        </span>
                      ))}
                    </span>
                    <span className="font-digits text-sm text-giallo">
                      +{(race.Results ?? []).reduce((s, r) => s + +r.points, 0)} ОЧК.
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ПЕРЕХОД К ИСТОРИИ */}
      <section className="border-t border-line">
        <Link to="/heritage" className="group block overflow-hidden py-20 text-center md:py-28">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.4em] text-dim">С 1947 ГОДА · ИСТОРИЯ СКУДЕРИИ</p>
            <p className="mt-4 text-6xl font-black uppercase italic tracking-tight text-outline transition-all duration-500 group-hover:text-rosso group-hover:[-webkit-text-stroke:0px] md:text-8xl">
              La Storia →
            </p>
          </Reveal>
        </Link>
      </section>
    </PageWrap>
  );
}
