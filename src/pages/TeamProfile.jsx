import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageWrap from "../components/PageWrap";
import EmptyState from "../components/EmptyState";
import DataNote from "../components/DataNote";
import { Reveal, KineticTitle, Counter, SectionTitle } from "../components/ui";
import { api } from "../lib/api";
import { teamColor } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";

/* Автопрофиль команды: агрегируется из всех гоночных результатов машин команды. */

export default function TeamProfile() {
  const { constructorId } = useParams();
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    api
      .careerResults("constructors", constructorId)
      .then((races) => {
        if (!alive) return;
        if (!races.length) {
          setState({ status: "error" });
          return;
        }
        const bySeason = {};
        let wins = 0;
        let podiums = 0;
        let entries = 0;
        for (const race of races) {
          const s = (bySeason[race.season] ??= {
            season: race.season,
            races: 0,
            points: 0,
            wins: 0,
            podiums: 0,
          });
          s.races++;
          for (const res of race.Results ?? []) {
            entries++;
            s.points += +res.points;
            if (+res.position === 1) {
              s.wins++;
              wins++;
            }
            if (+res.position <= 3) {
              s.podiums++;
              podiums++;
            }
          }
        }
        const seasons = Object.values(bySeason).sort((a, b) => +a.season - +b.season);
        seasons.forEach((s) => (s.points = Math.round(s.points * 10) / 10));
        setState({
          status: "ready",
          loadedAt: Date.now(),
          seasons,
          team: races.at(-1).Results[0].Constructor,
          wins,
          podiums,
          entries,
        });
      })
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [constructorId]);

  usePageMeta(
    state.team ? `${state.team.name} — профиль команды` : "Профиль команды",
    "История команды Формулы-1: сезоны, победы, подиумы и очки.",
  );

  return (
    <PageWrap>
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-32 md:pt-40">
        {state.status === "loading" && <div className="h-96 animate-pulse rounded-xl bg-panel" />}
        {state.status === "error" && (
          <EmptyState
            title="Команда не найдена"
            note="Такой команды нет в базе, либо данные временно недоступны."
            actionLabel="К зачёту"
            onAction={() => (window.location.href = "/races?tab=teams")}
          />
        )}
        {state.status === "ready" && (
          <>
            <Reveal>
              <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
                <span
                  className="inline-block h-3 w-10"
                  style={{ background: teamColor(constructorId) }}
                />
                {state.team.nationality?.toUpperCase()} · СЕЗОНЫ {state.seasons[0].season}–
                {state.seasons.at(-1).season}
              </p>
            </Reveal>
            <h1 className="text-[10vw] font-black uppercase italic leading-[0.85] tracking-tight md:text-8xl">
              <KineticTitle text={state.team.name.toUpperCase()} />
            </h1>

            <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                ["СЕЗОНОВ", state.seasons.length],
                ["ПОБЕД", state.wins, state.wins > 0],
                ["ПОДИУМОВ", state.podiums],
                ["СТАРТОВ МАШИН", state.entries],
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

            <SectionTitle kicker="LE STAGIONI" title="Все сезоны" className="mb-6 mt-16" />
            <Reveal className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-panel2 text-[10px] uppercase tracking-[0.25em] text-dim">
                  <tr>
                    <th className="px-4 py-3">Сезон</th>
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
                          to={`/races?season=${s.season}&tab=teams`}
                        >
                          {s.season}
                        </Link>
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
