import { useSearchParams } from "react-router-dom";
import PageWrap from "../components/PageWrap";
import { Marquee, PageHead } from "../components/ui";
import Reaction from "../components/games/Reaction";
import Quiz from "../components/games/Quiz";
import PitStop from "../components/games/PitStop";
import Tracks from "../components/games/Tracks";
import Achievements from "../components/games/Achievements";
import { usePageMeta } from "../lib/usePageMeta";
import { LightsMotif } from "../components/motifs";

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
      <PageHead
        kicker="ЧЕТЫРЕ ИСПЫТАНИЯ · РЕКОРДЫ ХРАНЯТСЯ В ТВОЁМ БРАУЗЕРЕ"
        title="Игры"
      >
        <LightsMotif />
        <div className="mt-6 flex flex-wrap gap-1.5">
          {TABS.map(({ id, label, sub }) => (
            <button
              key={id}
              onClick={() => setParams({ tab: id })}
              aria-pressed={tab === id}
              className={`rounded-lg px-4 py-2 text-left transition-colors ${
                tab === id ? "bg-rosso text-white" : "border border-line bg-panel/60 text-dim hover:text-white"
              }`}
            >
              <span className="block text-xs font-black uppercase tracking-[0.15em]">{label}</span>
              <span className={`block text-[10px] ${tab === id ? "text-white/70" : "text-dim"}`}>
                {sub}
              </span>
            </button>
          ))}
        </div>
      </PageHead>

      <Marquee
        items={["IT'S LIGHTS OUT", "✦", "AND AWAY WE GO", "✦", "FERRARI STRATEGY", "✦"]}
        speed={24}
        className="mt-6 -rotate-1 bg-rosso py-2.5 text-lg font-black uppercase italic text-carbon"
        itemClassName="mx-4"
      />

      <section className="mx-auto max-w-7xl px-5 py-12">
        {tab === "reaction" && <Reaction />}
        {tab === "pitstop" && <PitStop />}
        {tab === "quiz" && <Quiz />}
        {tab === "tracks" && <Tracks />}
        <Achievements key={tab} />
      </section>
    </PageWrap>
  );
}
