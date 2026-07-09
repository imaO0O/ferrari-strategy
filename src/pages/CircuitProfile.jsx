import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageWrap from "../components/PageWrap";
import EmptyState from "../components/EmptyState";
import DataNote from "../components/DataNote";
import { Reveal, KineticTitle, Counter, SectionTitle } from "../components/ui";
import { api } from "../lib/api";
import { countryRu, teamColor, driverRu } from "../lib/i18n";
import { circuitMeta } from "../data/circuits";
import { usePageMeta } from "../lib/usePageMeta";

/* Энциклопедия трасс: контур из набора «Угадай трассу» + история
   победителей из Jolpica (число ГП, победы Ferrari, рекордсмены). */

export default function CircuitProfile() {
  const { circuitId } = useParams();
  const [state, setState] = useState({ status: "loading" });
  const meta = circuitMeta(circuitId);

  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    (async () => {
      try {
        const [info, winners] = await Promise.all([
          api.circuitInfo(circuitId),
          api.circuitWinners(circuitId),
        ]);
        const circuit = info.CircuitTable?.Circuits?.[0];
        const races = winners.RaceTable?.Races ?? [];
        if (!circuit) throw new Error("нет данных");

        const winCount = {};
        const teamWinCount = {};
        let ferrariWins = 0;
        for (const race of races) {
          const w = race.Results?.[0];
          if (!w) continue;
          const dId = w.Driver.driverId;
          winCount[dId] = (winCount[dId] ?? 0) + 1;
          const cId = w.Constructor.constructorId;
          teamWinCount[cId] = (teamWinCount[cId] ?? 0) + 1;
          if (cId === "ferrari") ferrariWins++;
        }
        const topDriver = Object.entries(winCount).sort((a, b) => b[1] - a[1])[0];
        const topTeam = Object.entries(teamWinCount).sort((a, b) => b[1] - a[1])[0];
        const topDriverName = topDriver
          ? races.find((r) => r.Results[0].Driver.driverId === topDriver[0]).Results[0].Driver
          : null;
        const topTeamName = topTeam
          ? races.find((r) => r.Results[0].Constructor.constructorId === topTeam[0]).Results[0]
              .Constructor
          : null;

        if (!alive) return;
        setState({
          status: "ready",
          loadedAt: Date.now(),
          circuit,
          races,
          ferrariWins,
          topDriver: topDriverName && { driver: topDriverName, wins: topDriver[1] },
          topTeam: topTeamName && { team: topTeamName, wins: topTeam[1] },
          recent: [...races].reverse().slice(0, 8),
        });
      } catch (e) {
        if (alive) setState({ status: "error", message: e.message });
      }
    })();
    return () => {
      alive = false;
    };
  }, [circuitId]);

  const circuitName = state.circuit?.circuitName;
  usePageMeta(
    circuitName ? `${circuitName} — трасса Формулы-1` : "Трасса Формулы-1",
    "Профиль трассы Формулы-1: контур круга, победители за всю историю и статистика Ferrari.",
  );

  return (
    <PageWrap>
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-32 md:pt-40">
        {state.status === "loading" && <div className="h-96 animate-pulse rounded-xl bg-panel" />}
        {state.status === "error" && (
          <EmptyState
            title="Трасса не найдена"
            note="Такой трассы нет в базе, либо данные временно недоступны."
            actionLabel="К календарю"
            onAction={() => (window.location.href = "/races")}
          />
        )}
        {state.status === "ready" && (
          <>
            <Reveal>
              <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
                <span className="inline-block h-px w-10 bg-giallo" />
                {state.circuit.Location.locality},{" "}
                {countryRu(state.circuit.Location.country)?.toUpperCase() ??
                  state.circuit.Location.country}
              </p>
            </Reveal>
            <h1 className="text-[9vw] font-black uppercase italic leading-[0.9] tracking-tight md:text-7xl">
              <KineticTitle text={state.circuit.circuitName.toUpperCase()} />
            </h1>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
              {/* контур */}
              <Reveal className="rounded-xl border border-line bg-panel p-6">
                {meta?.path ? (
                  <svg viewBox="0 0 1000 1000" className="mx-auto max-h-80 w-full" role="img" aria-label={`Контур трассы ${state.circuit.circuitName}`}>
                    <path d={meta.path} fill="none" stroke="#26262c" strokeWidth={26} strokeLinejoin="round" />
                    <path d={meta.path} fill="none" stroke="#ff2800" strokeWidth={9} strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div className="flex h-64 items-center justify-center text-dim">
                    Контур этой трассы пока не оцифрован
                  </div>
                )}
                {meta && (
                  <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-line pt-4 text-center">
                    <div>
                      <p className="font-digits text-2xl font-bold text-giallo">≈{meta.length}</p>
                      <p className="text-[9px] font-bold tracking-[0.3em] text-dim">КМ · КРУГ</p>
                    </div>
                    <div>
                      <p className="font-digits text-2xl font-bold">{meta.turns}</p>
                      <p className="text-[9px] font-bold tracking-[0.3em] text-dim">ПОВОРОТОВ</p>
                    </div>
                  </div>
                )}
              </Reveal>

              {/* показатели */}
              <Reveal delay={0.1} className="flex flex-col justify-center gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-l-2 border-rosso/50 pl-4">
                    <Counter value={state.races.length} className="font-digits text-4xl font-bold md:text-5xl" />
                    <p className="mt-1 text-[9px] font-bold tracking-[0.35em] text-dim">ГРАН-ПРИ ПРОВЕДЕНО</p>
                  </div>
                  <div className="border-l-2 border-rosso/50 pl-4">
                    <Counter
                      value={state.ferrariWins}
                      className={`font-digits text-4xl font-bold md:text-5xl ${state.ferrariWins > 0 ? "text-giallo" : ""}`}
                    />
                    <p className="mt-1 text-[9px] font-bold tracking-[0.35em] text-dim">ПОБЕД FERRARI</p>
                  </div>
                </div>
                {state.races.length > 0 && (
                  <p className="text-sm text-dim">
                    Первый Гран-при — {state.races[0].season}, последний — {state.races.at(-1).season}.
                  </p>
                )}
                {state.topDriver && (
                  <p className="text-sm text-dim">
                    Больше всех побед здесь у{" "}
                    <Link
                      to={`/driver/${state.topDriver.driver.driverId}`}
                      className="font-bold text-white underline decoration-rosso underline-offset-4"
                    >
                      {driverRu(state.topDriver.driver).given} {driverRu(state.topDriver.driver).family}
                    </Link>{" "}
                    — {state.topDriver.wins}.
                  </p>
                )}
                {state.topTeam && (
                  <p className="text-sm text-dim">
                    Самая успешная команда —{" "}
                    <Link
                      to={`/team/${state.topTeam.team.constructorId}`}
                      className="font-bold text-white underline decoration-rosso underline-offset-4"
                    >
                      {state.topTeam.team.name}
                    </Link>{" "}
                    ({state.topTeam.wins} побед).
                  </p>
                )}
              </Reveal>
            </div>

            <SectionTitle kicker="I VINCITORI" title="Последние победители" className="mb-6 mt-16" />
            <Reveal className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-panel2 text-[10px] uppercase tracking-[0.25em] text-dim">
                  <tr>
                    <th className="px-4 py-3">Сезон</th>
                    <th className="px-4 py-3">Победитель</th>
                    <th className="px-4 py-3">Команда</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {state.recent.map((race) => {
                    const w = race.Results[0];
                    const name = driverRu(w.Driver);
                    const isFerrari = w.Constructor.constructorId === "ferrari";
                    return (
                      <tr key={race.season} className={`transition-colors hover:bg-panel2/70 ${isFerrari ? "bg-rosso/[0.05]" : ""}`}>
                        <td className="px-4 py-3 font-digits">
                          <Link className="transition-colors hover:text-rosso" to={`/races?season=${race.season}&tab=results`}>
                            {race.season}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-bold uppercase tracking-wide">
                          <span
                            className="mr-3 inline-block h-4 w-1 rounded-full align-middle"
                            style={{ background: teamColor(w.Constructor.constructorId) }}
                          />
                          <Link className="transition-colors hover:text-rosso" to={`/driver/${w.Driver.driverId}`}>
                            {name.given} {name.family}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-dim">
                          <Link className="transition-colors hover:text-rosso" to={`/team/${w.Constructor.constructorId}`}>
                            {w.Constructor.name}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Reveal>
            <DataNote updatedAt={state.loadedAt} />
          </>
        )}
      </section>
    </PageWrap>
  );
}
