import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageWrap from "../components/PageWrap";
import EmptyState from "../components/EmptyState";
import DataNote from "../components/DataNote";
import { Reveal, KineticTitle, Counter, SectionTitle } from "../components/ui";
import { api } from "../lib/api";
import { driverRu, teamColor } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";

/* Автопрофиль пилота: агрегируется из всех его гоночных результатов —
   работает для любого пилота истории, с 1950 года. */

const W = 800;
const H = 260;
const PAD = 40;

function PointsChart({ seasons }) {
  if (seasons.length < 2) return null;
  const maxPts = Math.max(...seasons.map((s) => s.points), 1);
  const x = (i) => PAD + (i / (seasons.length - 1)) * (W - PAD * 2);
  const y = (p) => H - PAD - (p / maxPts) * (H - PAD * 2);
  const pts = seasons.map((s, i) => `${x(i).toFixed(1)},${y(s.points).toFixed(1)}`).join(" ");
  const step = Math.max(1, Math.ceil(seasons.length / 10));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Очки по сезонам">
      {[0, Math.round(maxPts / 2), maxPts].map((p) => (
        <g key={p}>
          <line x1={PAD} x2={W - PAD} y1={y(p)} y2={y(p)} stroke="#26262c" />
          <text x={PAD - 8} y={y(p) + 4} textAnchor="end" fontSize="11" fill="#8a8a93">
            {p}
          </text>
        </g>
      ))}
      {seasons
        .filter((_, i) => i % step === 0)
        .map((s) => (
          <text
            key={s.season}
            x={x(seasons.indexOf(s))}
            y={H - PAD + 22}
            textAnchor="middle"
            fontSize="11"
            fill="#8a8a93"
          >
            {s.season}
          </text>
        ))}
      <polyline points={pts} fill="none" stroke="#ff2800" strokeWidth="3" strokeLinejoin="round" />
      {seasons.map((s, i) => (
        <circle key={s.season} cx={x(i)} cy={y(s.points)} r="4" fill={s.wins > 0 ? "#ffd400" : "#ff2800"}>
          <title>{`${s.season}: ${s.points} очк., побед: ${s.wins}`}</title>
        </circle>
      ))}
    </svg>
  );
}

export default function DriverProfile() {
  const { driverId } = useParams();
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    api
      .careerResults("drivers", driverId)
      .then((races) => {
        if (!alive) return;
        if (!races.length) {
          setState({ status: "error" });
          return;
        }
        const bySeason = {};
        let wins = 0;
        let podiums = 0;
        let careerPts = 0;
        for (const race of races) {
          const res = race.Results[0];
          const s = (bySeason[race.season] ??= {
            season: race.season,
            races: 0,
            points: 0,
            wins: 0,
            podiums: 0,
            team: null,
          });
          s.races++;
          s.points += +res.points;
          s.team = res.Constructor;
          if (+res.position === 1) {
            s.wins++;
            wins++;
          }
          if (+res.position <= 3) {
            s.podiums++;
            podiums++;
          }
          careerPts += +res.points;
        }
        const seasons = Object.values(bySeason).sort((a, b) => +a.season - +b.season);
        seasons.forEach((s) => (s.points = Math.round(s.points * 10) / 10));
        setState({
          status: "ready",
          loadedAt: Date.now(),
          seasons,
          driver: races.at(-1).Results[0].Driver,
          racesTotal: races.length,
          wins,
          podiums,
          careerPts: Math.round(careerPts),
        });
      })
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [driverId]);

  const name = state.driver ? driverRu(state.driver) : null;
  usePageMeta(
    name ? `${name.given} ${name.family} — профиль пилота` : "Профиль пилота",
    "Карьера пилота Формулы-1 по сезонам: команды, очки, победы и подиумы.",
  );

  return (
    <PageWrap>
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-32 md:pt-40">
        {state.status === "loading" && <div className="h-96 animate-pulse rounded-xl bg-panel" />}
        {state.status === "error" && (
          <EmptyState
            title="Пилот не найден"
            note="Такого пилота нет в базе, либо данные временно недоступны."
            actionLabel="К зачёту"
            onAction={() => (window.location.href = "/races?tab=drivers")}
          />
        )}
        {state.status === "ready" && (
          <>
            <Reveal>
              <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
                <span className="inline-block h-px w-10 bg-giallo" />
                {state.driver.nationality?.toUpperCase()} · СЕЗОНЫ {state.seasons[0].season}–
                {state.seasons.at(-1).season}
                {state.driver.permanentNumber && ` · №${state.driver.permanentNumber}`}
              </p>
            </Reveal>
            <h1 className="text-[10vw] font-black uppercase italic leading-[0.85] tracking-tight md:text-8xl">
              <KineticTitle text={name.family.toUpperCase()} />
            </h1>
            <p className="mt-2 text-2xl font-semibold text-dim">{name.given}</p>

            <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                ["ГОНОК", state.racesTotal],
                ["ПОБЕД", state.wins, state.wins > 0],
                ["ПОДИУМОВ", state.podiums],
                ["ОЧКОВ ЗА КАРЬЕРУ", state.careerPts],
              ].map(([label, value, accent]) => (
                <div key={label} className="border-l-2 border-rosso/50 pl-4">
                  <Counter
                    value={value}
                    className={`font-digits text-4xl font-bold md:text-5xl ${accent ? "text-giallo" : ""}`}
                  />
                  <p className="mt-1 text-[9px] font-bold tracking-[0.35em] text-dim">{label}</p>
                </div>
              ))}
            </div>

            <SectionTitle kicker="LA CARRIERA" title="Очки по сезонам" className="mb-6 mt-16" />
            <Reveal className="rounded-xl border border-line bg-panel p-4 md:p-8">
              <PointsChart seasons={state.seasons} />
              <p className="mt-2 text-right font-digits text-[10px] tracking-widest text-dim">
                ЖЁЛТАЯ ТОЧКА — СЕЗОН С ПОБЕДАМИ
              </p>
            </Reveal>

            <Reveal className="mt-8 overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-panel2 text-[10px] uppercase tracking-[0.25em] text-dim">
                  <tr>
                    <th className="px-4 py-3">Сезон</th>
                    <th className="px-4 py-3">Команда</th>
                    <th className="px-4 py-3">Гонки</th>
                    <th className="px-4 py-3">Победы</th>
                    <th className="px-4 py-3">Подиумы</th>
                    <th className="px-4 py-3 text-right">Очки</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {[...state.seasons].reverse().map((s) => (
                    <tr key={s.season} className="transition-colors hover:bg-panel2/70">
                      <td className="px-4 py-3 font-digits">
                        <Link
                          className="transition-colors hover:text-rosso"
                          to={`/races?season=${s.season}&tab=drivers`}
                        >
                          {s.season}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-bold uppercase tracking-wide">
                        <span
                          className="mr-3 inline-block h-4 w-1 rounded-full align-middle"
                          style={{ background: teamColor(s.team?.constructorId) }}
                        />
                        {s.team ? (
                          <Link
                            className="transition-colors hover:text-rosso"
                            to={`/team/${s.team.constructorId}`}
                          >
                            {s.team.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 font-digits text-dim">{s.races}</td>
                      <td className="px-4 py-3 font-digits text-dim">{s.wins}</td>
                      <td className="px-4 py-3 font-digits text-dim">{s.podiums}</td>
                      <td className="px-4 py-3 text-right font-digits text-giallo">{s.points}</td>
                    </tr>
                  ))}
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
