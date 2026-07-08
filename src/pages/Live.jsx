import { useEffect, useState } from "react";
import PageWrap from "../components/PageWrap";
import LiveTrackMap from "../components/LiveTrackMap";
import EmptyState from "../components/EmptyState";
import { Reveal, KineticTitle, SectionTitle } from "../components/ui";
import { Countdown } from "../components/racing";
import { LiveTower, WeatherChips, FerrariRadio } from "./Telemetry";
import { of1 } from "../lib/openf1";
import { useWeekend, sessionRu, fmtSessionTime } from "../lib/useWeekend";
import { circuitGpRu } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";
import { WaveMotif } from "../components/motifs";

/* Live-центр: «второй экран» гоночного уик-энда. Когда сессия идёт —
   живая расстановка, карта, погода и радио Ferrari на одном экране. */

export default function Live() {
  usePageMeta(
    "Live-центр — второй экран гоночного уик-энда",
    "Живая расстановка, карта трассы, погода и радио Ferrari во время сессий Формулы-1 — держи открытым рядом с трансляцией.",
  );
  const weekend = useWeekend();
  const [session, setSession] = useState(null); // активная сессия
  const [drivers, setDrivers] = useState(null);
  const [checked, setChecked] = useState(false);

  // ищем идущую прямо сейчас сессию и загружаем её участников
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sessions = await of1.allSessions(new Date().getFullYear());
        const now = Date.now();
        const live = sessions.find(
          (s) => Date.parse(s.date_start) <= now && now <= Date.parse(s.date_end),
        );
        if (!alive) return;
        if (live) {
          setSession(live);
          const list = await of1.drivers(live.session_key);
          if (!alive) return;
          const map = {};
          for (const d of list) {
            map[d.driver_number] = {
              number: d.driver_number,
              acronym: d.name_acronym,
              name: d.full_name,
              color: d.team_colour ? `#${d.team_colour}` : "#8a8a93",
              team: d.team_name,
            };
          }
          setDrivers(map);
        }
      } catch {
        /* нет связи — покажем состояние ожидания */
      } finally {
        if (alive) setChecked(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PageWrap>
      <section className="relative mx-auto max-w-7xl px-5 pb-10 pt-32 md:pt-40">
        <WaveMotif />
        <Reveal>
          <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
            <span className="inline-block h-px w-10 bg-giallo" />
            ВТОРОЙ ЭКРАН ГОНОЧНОГО УИК-ЭНДА · ДАННЫЕ OPENF1
          </p>
        </Reveal>
        <h1 className="text-[13vw] font-black uppercase italic leading-[0.85] tracking-tight md:text-[8rem]">
          <KineticTitle text="LIVE-ЦЕНТР" />
        </h1>
        {session && (
          <Reveal delay={0.3}>
            <p className="mt-4 text-lg text-dim">
              <span className="animate-pulse font-bold text-rosso">● </span>
              {circuitGpRu(session.circuit_short_name)} · {sessionRu(session.session_name)} — идёт
              прямо сейчас
            </p>
            <WeatherChips sessionKey={session.session_key} />
          </Reveal>
        )}
      </section>

      {/* сессия идёт: полный дашборд */}
      {session && drivers && (
        <>
          <section className="mx-auto max-w-7xl px-5 py-10">
            <SectionTitle kicker="LA CLASSIFICA" title="Расстановка" className="mb-8" />
            <LiveTower sessionKey={session.session_key} drivers={drivers} />
          </section>
          <LiveTrackMap sessionKey={session.session_key} drivers={drivers} />
          <FerrariRadio sessionKey={session.session_key} drivers={drivers} />
        </>
      )}

      {/* сессии нет: отсчёт до ближайшей и расписание уик-энда */}
      {checked && !session && (
        <section className="mx-auto max-w-7xl px-5 py-14">
          {weekend?.next ? (
            <Reveal className="rounded-xl border border-line bg-panel p-8 md:p-10">
              <p className="text-[10px] font-bold tracking-[0.4em] text-dim">
                СЕЙЧАС СЕССИЙ НЕТ · СЛЕДУЮЩАЯ
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase italic md:text-5xl">
                {circuitGpRu(weekend.circuit)} · {sessionRu(weekend.next.session_name)}
              </h2>
              <p className="mt-2 text-dim">{fmtSessionTime(weekend.next.date_start)} · твоё местное время</p>
              <div className="mt-8">
                <Countdown target={Date.parse(weekend.next.date_start)} />
              </div>
              <div className="mt-8 space-y-1.5">
                {weekend.sessions.map((s) => (
                  <div
                    key={s.session_key}
                    className={`flex flex-wrap gap-x-4 rounded-md bg-panel2/60 px-4 py-2 text-sm ${
                      Date.parse(s.date_end) < Date.now() ? "opacity-45" : ""
                    }`}
                  >
                    <span className="min-w-44 font-bold uppercase">{sessionRu(s.session_name)}</span>
                    <span className="text-dim">{fmtSessionTime(s.date_start)}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          ) : (
            <EmptyState
              title="До ближайшего уик-энда тихо"
              note="Live-центр оживает в дни Гран-при: расстановка, карта, погода и радио Ferrari в реальном времени. Загляни в календарь, чтобы узнать дату следующей гонки."
              actionLabel="Открыть календарь"
              onAction={() => (window.location.href = "/races")}
            />
          )}
        </section>
      )}
      {!checked && (
        <section className="mx-auto max-w-7xl px-5 py-14">
          <div className="h-72 animate-pulse rounded-xl bg-panel" />
        </section>
      )}
    </PageWrap>
  );
}
