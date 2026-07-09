import PageWrap from "../components/PageWrap";
import { Reveal, PageHead, SectionTitle } from "../components/ui";
import { TOPICS, GLOSSARY } from "../data/academy";
import { usePageMeta } from "../lib/usePageMeta";
import { GradIcon } from "../components/icons";

/* «Академия»: Формула-1 за 15 минут — правила, шины, DRS, флаги и глоссарий. */

const TYRE_SET = [
  ["#e10600", "Софт — самый быстрый, живёт меньше всех"],
  ["#ffd12e", "Медиум — золотая середина"],
  ["#f0f0ec", "Хард — медленнее, но выносливее"],
  ["#43b02a", "Интермедиа — мокрая трасса без луж"],
  ["#0067ad", "Дождевые — ливень и стоячая вода"],
];

export default function Academy() {
  usePageMeta(
    "Академия — Формула-1 за 15 минут",
    "Как устроена Формула-1: очки, формат уик-энда, квалификация, шины, DRS, пит-стопы, флаги и глоссарий терминов — простыми словами.",
  );

  return (
    <PageWrap>
      <PageHead
        kicker="ФОРМУЛА-1 ЗА 15 МИНУТ · ДЛЯ БУДУЩИХ ТИФОЗИ"
        title="Академия"
        lead="Семь коротких уроков — и трансляция перестанет быть набором загадочных слов. Подсаживаешь друга на гонки? Отправь ему эту страницу."
      >
        <div className="pointer-events-none absolute right-0 top-24 hidden text-line opacity-60 md:block">
          <GradIcon className="h-36 w-36" />
        </div>
      </PageHead>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-5 md:grid-cols-2">
          {TOPICS.map((t, i) => (
            <Reveal key={t.id} delay={(i % 2) * 0.07}>
              <div className="card card-hover h-full p-6">
                <p className="font-digits text-xs text-rosso">УРОК {i + 1}</p>
                <h2 className="mt-1 text-2xl font-black uppercase italic leading-tight">
                  {t.title}
                </h2>
                <p className="mt-3 leading-relaxed text-dim">{t.text}</p>

                {t.chips && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.chips.map((c) => (
                      <span key={c} className="rounded-md bg-panel2 px-2 py-1 font-digits text-[10px] text-giallo">
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {t.tyres && (
                  <div className="mt-4 space-y-1.5">
                    {TYRE_SET.map(([color, label]) => (
                      <p key={label} className="flex items-center gap-2 text-sm text-dim">
                        <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: color }} />
                        {label}
                      </p>
                    ))}
                  </div>
                )}

                {t.flags && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {t.flags.map(([color, label]) => (
                      <span key={label} className="flex items-center gap-2 text-sm text-dim">
                        {color === "checker" ? (
                          <span className="checker inline-block h-4 w-6 rounded-sm" />
                        ) : (
                          <span className="inline-block h-4 w-6 rounded-sm" style={{ background: color }} />
                        )}
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <SectionTitle kicker="IL DIZIONARIO" title="Глоссарий" className="mb-8 mt-20" />
        <div className="grid gap-3 md:grid-cols-2">
          {GLOSSARY.map(([term, def]) => (
            <Reveal key={term}>
              <details className="group rounded-xl border border-line bg-panel px-5 py-4">
                <summary className="cursor-pointer list-none font-bold uppercase tracking-wide transition-colors group-open:text-rosso">
                  {term}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-dim">{def}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </PageWrap>
  );
}
