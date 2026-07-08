import { useRef, useState } from "react";
import PageWrap from "../components/PageWrap";
import DownloadCardButton from "../components/games/DownloadCardButton";
import { Reveal, KineticTitle, SectionTitle } from "../components/ui";
import { exportProfile, importProfile } from "../lib/passport";
import { loadFav } from "../lib/favorite";
import { driverRu } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";

/* Паспорт тифози: весь локальный прогресс в одном месте —
   сводка, карточка «Мой сезон», экспорт и импорт файлом. */

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

export default function Passport() {
  usePageMeta(
    "Паспорт тифози — мой прогресс",
    "Рекорды игр, прогнозы и любимый пилот в одном месте: карточка «Мой сезон», экспорт и перенос профиля между устройствами.",
  );
  const fileRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);

  const fav = loadFav();
  const favName = fav ? driverRu({ driverId: fav.id, givenName: "", familyName: fav.code }) : null;
  const reaction = read("fs-reaction-records")?.[0]?.ms ?? null;
  const pit = read("fs-pitstop-records")?.[0]?.total ?? null;
  const quiz = Number(localStorage.getItem("fs-quiz-best")) || null;
  const tracks = Number(localStorage.getItem("fs-tracks-best")) || null;
  const predictions = Object.values(read("fs-predictions") ?? {}).filter((e) => e.points != null);
  const predPts = predictions.reduce((s, e) => s + e.points, 0);

  const stats = [
    ["РЕАКЦИЯ", reaction != null ? `${reaction} мс` : "—"],
    ["ПИТ-СТОП", pit != null ? `${pit.toFixed(2)} с` : "—"],
    ["ВИКТОРИНА", quiz != null ? `${quiz}/20` : "—"],
    ["ТРАССЫ", tracks != null ? `${tracks}/10` : "—"],
    ["ОЧКИ ПРОГНОЗОВ", predictions.length ? `${predPts}` : "—"],
    ["МОЙ ПИЛОТ", fav ? (favName.family || fav.code) : "—"],
  ];

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const n = await importProfile(file);
      setImportMsg(`Импортировано разделов: ${n}. Обновляем…`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setImportMsg(err.message);
      setTimeout(() => setImportMsg(null), 3000);
    }
    e.target.value = "";
  };

  return (
    <PageWrap>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 md:pt-40">
        <Reveal>
          <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
            <span className="inline-block h-px w-10 bg-giallo" />
            ВСЁ ХРАНИТСЯ ТОЛЬКО В ТВОЁМ БРАУЗЕРЕ
          </p>
        </Reveal>
        <h1 className="text-[11vw] font-black uppercase italic leading-[0.85] tracking-tight md:text-[7rem]">
          <KineticTitle text="ПАСПОРТ ТИФОЗИ" />
        </h1>

        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {stats.map(([label, value]) => (
            <Reveal key={label}>
              <div className="h-full rounded-xl border border-line bg-panel p-4">
                <p className="font-digits text-2xl font-bold text-giallo">{value}</p>
                <p className="mt-1 text-[9px] font-bold tracking-[0.3em] text-dim">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <SectionTitle kicker="IL PASSAPORTO" title="Перенос профиля" className="mb-4 mt-16" />
        <Reveal className="max-w-2xl rounded-xl border border-line bg-panel p-6 md:p-8">
          <p className="leading-relaxed text-dim">
            Рекорды, прогнозы и достижения живут в localStorage этого браузера. Скачай файл
            профиля, чтобы сделать резервную копию или перенести прогресс на другое
            устройство — там просто импортируй его обратно.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={exportProfile}
              className="rounded-md bg-rosso px-6 py-2.5 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
            >
              Экспортировать профиль
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-line px-6 py-2.5 text-sm font-black uppercase tracking-widest text-dim transition-colors hover:border-rosso/60 hover:text-white"
            >
              Импортировать
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={onImport}
            />
            <DownloadCardButton
              className="py-2.5"
              card={{
                label: "Мой сезон тифози",
                value: predictions.length ? `${predPts}` : reaction != null ? `${reaction}` : "—",
                unit: predictions.length ? "очков прогнозов" : reaction != null ? "мс реакции" : "",
                sub: [
                  reaction != null && `Реакция ${reaction} мс`,
                  pit != null && `Пит-стоп ${pit.toFixed(2)} с`,
                  quiz != null && `Викторина ${quiz}/20`,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Сезон только начинается",
              }}
            />
          </div>
          {importMsg && <p className="mt-4 text-sm text-giallo">{importMsg}</p>}
        </Reveal>
      </section>
    </PageWrap>
  );
}
