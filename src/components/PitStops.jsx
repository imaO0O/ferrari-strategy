import { useEffect, useState } from "react";
import { Reveal, SectionTitle } from "./ui";
import EmptyState from "./EmptyState";
import { of1 } from "../lib/openf1";

/* Пит-стопы гонки: каждая остановка с длительностью нахождения
   на пит-лейн, отсортировано от самой быстрой. Данные OpenF1 /pit. */

export default function PitStops({ sessionKey, drivers }) {
  const [pits, setPits] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    let timer;
    of1
      .pits(sessionKey)
      .then((rows) => {
        if (!alive) return;
        setPits(rows);
        if (!rows.length && attempt < 2)
          timer = setTimeout(() => alive && setAttempt((a) => a + 1), 15_000);
      })
      .catch(() => {
        if (!alive) return;
        setPits([]);
        if (attempt < 2) timer = setTimeout(() => alive && setAttempt((a) => a + 1), 15_000);
      });
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [sessionKey, attempt]);

  const rows = (pits ?? [])
    .filter((p) => p.pit_duration)
    .sort((a, b) => a.pit_duration - b.pit_duration);

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle kicker="BOX BOX BOX" title="Пит-стопы" className="mb-4" />
        <p className="mb-8 max-w-2xl text-dim">
          Все остановки гонки от самой быстрой к самой медленной — время проезда по
          пит-лейн от входа до выхода.
        </p>

        {pits == null && <div className="h-56 animate-pulse rounded-xl bg-panel" />}
        {pits?.length === 0 && (
          <EmptyState
            title="Пит-стопы пока не пришли"
            note="OpenF1 отдаёт их с задержкой — попробуй чуть позже."
            actionLabel="Повторить"
            onAction={() => setAttempt((a) => a + 1)}
          />
        )}

        {rows.length > 0 && (
          <Reveal className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((p, i) => {
              const d = drivers[p.driver_number];
              return (
                <div
                  key={`${p.driver_number}-${p.lap_number}`}
                  className={`flex items-center gap-3 rounded-md border px-4 py-2.5 ${
                    i === 0
                      ? "border-giallo/60 bg-giallo/[0.06]"
                      : d?.team === "Ferrari"
                        ? "border-rosso/40 bg-rosso/5"
                        : "border-line bg-panel"
                  }`}
                >
                  {i === 0 && <span title="Самый быстрый пит-стоп">🏆</span>}
                  <span className="h-5 w-1 rounded-full" style={{ background: d?.color ?? "#8a8a93" }} />
                  <span className="w-10 font-digits text-sm font-bold">{d?.acronym ?? p.driver_number}</span>
                  <span className="flex-1 font-digits text-xs text-dim">круг {p.lap_number}</span>
                  <span className="font-digits text-sm font-bold text-giallo">
                    {p.pit_duration.toFixed(1)}с
                  </span>
                </div>
              );
            })}
          </Reveal>
        )}
      </div>
    </section>
  );
}
