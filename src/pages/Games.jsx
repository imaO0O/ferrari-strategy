import { useSearchParams } from "react-router-dom";
import PageWrap from "../components/PageWrap";
import { Reveal, KineticTitle, Marquee } from "../components/ui";
import Reaction from "../components/games/Reaction";
import Quiz from "../components/games/Quiz";
import PitStop from "../components/games/PitStop";
import Tracks from "../components/games/Tracks";
import { usePageMeta } from "../lib/usePageMeta";

const TABS = [
  { id: "reaction", label: "Реакция", sub: "Огни погасли — жми!" },
  { id: "pitstop", label: "Пит-стоп", sub: "Смени 4 колеса" },
  { id: "quiz", label: "Викторина", sub: "20 вопросов о Ferrari" },
  { id: "tracks", label: "Трассы", sub: "Угадай по контуру" },
];

export default function Games() {
  usePageMeta(
    "Игры Ф1 — реакция на старт, пит-стоп, викторина, трассы",
    "Четыре бесплатные игры для фанатов Формулы-1: проверь реакцию на старте, смени колёса на пит-стопе, пройди викторину о Ferrari и угадай трассу по контуру.",
  );
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "reaction";

  return (
    <PageWrap>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-32 md:pt-40">
        <Reveal>
          <p className="mb-3 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
            <span className="inline-block h-px w-10 bg-giallo" />
            ЧЕТЫРЕ ИСПЫТАНИЯ · РЕКОРДЫ ХРАНЯТСЯ В ТВОЁМ БРАУЗЕРЕ
          </p>
        </Reveal>
        <h1 className="text-[13vw] font-black uppercase italic leading-[0.85] tracking-tight md:text-[8rem]">
          <KineticTitle text="ИГРЫ" />
        </h1>

        <div className="mt-10 flex flex-wrap gap-2">
          {TABS.map(({ id, label, sub }) => (
            <button
              key={id}
              onClick={() => setParams({ tab: id })}
              className={`rounded-md px-4 py-2.5 text-left transition-colors ${
                tab === id ? "bg-rosso text-white" : "bg-panel text-dim hover:text-white"
              }`}
            >
              <span className="block text-sm font-black uppercase tracking-widest">{label}</span>
              <span className={`block text-[10px] ${tab === id ? "text-white/70" : "text-dim/70"}`}>
                {sub}
              </span>
            </button>
          ))}
        </div>
      </section>

      <Marquee
        items={["IT'S LIGHTS OUT", "✦", "AND AWAY WE GO", "✦", "FERRARI STRATEGY", "✦"]}
        speed={24}
        className="-rotate-1 bg-rosso py-3 text-xl font-black uppercase italic text-carbon"
        itemClassName="mx-4"
      />

      <section className="mx-auto max-w-7xl px-5 py-14">
        {tab === "reaction" && <Reaction />}
        {tab === "pitstop" && <PitStop />}
        {tab === "quiz" && <Quiz />}
        {tab === "tracks" && <Tracks />}
      </section>
    </PageWrap>
  );
}
