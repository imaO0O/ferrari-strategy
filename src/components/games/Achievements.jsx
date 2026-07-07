import { Reveal } from "../ui";
import DownloadCardButton from "./DownloadCardButton";
import {
  BoltIcon,
  HelmetIcon,
  WrenchIcon,
  TrophyIcon,
  GradIcon,
  MapIcon,
  ClipboardIcon,
  ToolboxIcon,
} from "../icons";

/* Достижения: считаются из рекордов в localStorage, ничего не отправляется. */

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const bestReaction = () => read("fs-reaction-records")?.[0]?.ms ?? null;
const bestPit = () => read("fs-pitstop-records")?.[0]?.total ?? null;
const bestQuiz = () => Number(localStorage.getItem("fs-quiz-best")) || null;
const bestTracks = () => Number(localStorage.getItem("fs-tracks-best")) || null;
const scoredPredictions = () =>
  Object.values(read("fs-predictions") ?? {}).filter((e) => e.points != null).length;

const BADGES = [
  { id: "lightning", Icon: BoltIcon, title: "Молния", desc: "Реакция быстрее 250 мс", earned: () => bestReaction() != null && bestReaction() < 250 },
  { id: "champion-reflex", Icon: HelmetIcon, title: "Рефлексы чемпиона", desc: "Реакция быстрее 200 мс", earned: () => bestReaction() != null && bestReaction() < 200 },
  { id: "pit-crew", Icon: WrenchIcon, title: "Пит-крю Маранелло", desc: "Пит-стоп быстрее 2.50 с", earned: () => bestPit() != null && bestPit() < 2.5 },
  { id: "world-record", Icon: TrophyIcon, title: "Мировой рекорд", desc: "Пит-стоп быстрее 1.82 с", earned: () => bestPit() != null && bestPit() < 1.82 },
  { id: "professor", Icon: GradIcon, title: "Профессор Маранелло", desc: "Викторина 20 из 20", earned: () => bestQuiz() === 20 },
  { id: "navigator", Icon: MapIcon, title: "Штурман", desc: "Все 10 трасс угаданы", earned: () => bestTracks() === 10 },
  { id: "strategist", Icon: ClipboardIcon, title: "Стратег", desc: "3 подсчитанных прогноза", earned: () => scoredPredictions() >= 3 },
  {
    id: "collector",
    Icon: ToolboxIcon,
    title: "Полный гараж",
    desc: "Рекорд в каждой из четырёх игр",
    earned: () => bestReaction() != null && bestPit() != null && bestQuiz() != null && bestTracks() != null,
  },
];

export default function Achievements() {
  const earnedCount = BADGES.filter((b) => b.earned()).length;

  return (
    <Reveal className="mt-14 border-t border-line pt-10">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-black uppercase italic">Достижения</h2>
        <span className="font-digits text-sm text-dim">
          {earnedCount}/{BADGES.length} открыто
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BADGES.map((b) => {
          const ok = b.earned();
          return (
            <div
              key={b.id}
              className={`flex h-full flex-col rounded-xl border p-4 transition-colors ${
                ok ? "border-giallo/50 bg-giallo/[0.05]" : "border-line bg-panel opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={ok ? "text-giallo" : "text-dim"}>
                  <b.Icon className="h-7 w-7" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-black uppercase italic leading-tight">{b.title}</p>
                  <p className="text-xs text-dim">{b.desc}</p>
                </div>
              </div>
              {ok && (
                <DownloadCardButton
                  className="mt-3 self-start"
                  card={{ label: "Достижение открыто", value: "✦", sub: `${b.title} — ${b.desc}` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
