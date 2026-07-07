import { useEffect, useState } from "react";
import { Reveal, SectionTitle } from "./ui";
import { of1 } from "../lib/openf1";

/* Стратегия шин гонки: горизонтальные полосы стинтов по пилотам
   в финишном порядке, цвета компаундов Pirelli. Данные OpenF1 /stints. */

const COMPOUNDS = {
  SOFT: { color: "#e10600", letter: "S", ru: "Софт" },
  MEDIUM: { color: "#ffd12e", letter: "M", ru: "Медиум" },
  HARD: { color: "#f0f0ec", letter: "H", ru: "Хард" },
  INTERMEDIATE: { color: "#43b02a", letter: "I", ru: "Интермедиа" },
  WET: { color: "#0067ad", letter: "W", ru: "Дождевые" },
};

export const compoundOf = (name) =>
  COMPOUNDS[name] ?? { color: "#8a8a93", letter: "?", ru: name ?? "—" };

export default function TyreStrategy({ sessionKey, drivers, finishOrder }) {
  const [stints, setStints] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    let timer;
    of1
      .stints(sessionKey)
      .then((rows) => {
        if (!alive) return;
        setStints(rows);
        // пустой ответ сразу после загрузки страницы — обычно рейт-лимит OpenF1;
        // тихо пробуем ещё раз через 15 секунд
        if (!rows.length && attempt < 2) {
          timer = setTimeout(() => alive && setAttempt((a) => a + 1), 15_000);
        }
      })
      .catch(() => {
        if (!alive) return;
        setStints([]);
        if (attempt < 2) timer = setTimeout(() => alive && setAttempt((a) => a + 1), 15_000);
      });
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [sessionKey, attempt]);

  const byDriver = {};
  for (const s of stints ?? []) {
    (byDriver[s.driver_number] ??= []).push(s);
  }
  for (const arr of Object.values(byDriver)) arr.sort((a, b) => a.stint_number - b.stint_number);

  const totalLaps = Math.max(1, ...(stints ?? []).map((s) => s.lap_end ?? 0));
  const rows = finishOrder.filter((n) => byDriver[n]?.length);
  const used = [...new Set((stints ?? []).map((s) => s.compound))];

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle kicker="LA STRATEGIA" title="Стратегия шин" className="mb-4" />
        <p className="mb-8 max-w-2xl text-dim">
          Кто на чём ехал и когда заезжал в боксы: каждый разрыв полосы — пит-стоп.
          Пилоты — в порядке финиша.
        </p>

        {stints == null && <div className="h-72 animate-pulse rounded-xl bg-panel" />}

        {stints?.length === 0 && (
          <div className="rounded-xl border border-line bg-panel p-8 text-center">
            <p className="text-dim">
              Данные о шинах пока не пришли — у OpenF1 строгий лимит запросов.
            </p>
            <button
              onClick={() => setAttempt((a) => a + 1)}
              className="mt-4 rounded-md bg-rosso px-6 py-2.5 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
            >
              Повторить
            </button>
          </div>
        )}

        {stints?.length > 0 && (
          <Reveal className="overflow-x-auto rounded-xl border border-line bg-panel p-5 md:p-8">
            {/* легенда */}
            <div className="mb-6 flex flex-wrap gap-4">
              {used.map((c) => {
                const info = compoundOf(c);
                return (
                  <span key={c} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-dim">
                    <span className="h-3 w-3 rounded-full" style={{ background: info.color }} />
                    {info.ru}
                  </span>
                );
              })}
            </div>

            <div className="min-w-[560px] space-y-1.5">
              {rows.map((n) => {
                const d = drivers[n];
                return (
                  <div key={n} className="flex items-center gap-3">
                    <span
                      className={`w-14 shrink-0 font-digits text-xs font-bold ${
                        d?.team === "Ferrari" ? "text-rosso" : "text-dim"
                      }`}
                    >
                      {d?.acronym ?? n}
                    </span>
                    <div className="relative h-6 flex-1 rounded-sm bg-panel2/50">
                      {byDriver[n].map((s) => {
                        const info = compoundOf(s.compound);
                        const left = ((s.lap_start - 1) / totalLaps) * 100;
                        const width = Math.max(0.8, ((s.lap_end - s.lap_start + 1) / totalLaps) * 100 - 0.6);
                        return (
                          <div
                            key={s.stint_number}
                            title={`${info.ru}: круги ${s.lap_start}–${s.lap_end}`}
                            className="absolute inset-y-0 flex items-center justify-center rounded-sm text-[10px] font-black text-carbon"
                            style={{ left: `${left}%`, width: `${width}%`, background: info.color }}
                          >
                            {width > 6 ? info.letter : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-right font-digits text-[10px] tracking-widest text-dim">
              КРУГИ 1–{totalLaps}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
