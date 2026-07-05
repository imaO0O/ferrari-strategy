import { Reveal } from "./ui";
import { pickEvent } from "../data/onthisday";

const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

/* «В этот день в истории Ferrari» — событие сегодняшней даты
   или ближайшее следующее по календарю */
export default function OnThisDay() {
  const { events, isToday } = pickEvent();

  return (
    <Reveal className="rounded-xl border border-giallo/25 bg-giallo/[0.04] p-6 md:p-8">
      <p className="flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-giallo">
        <span className="inline-block h-px w-10 bg-giallo" />
        {isToday ? "В ЭТОТ ДЕНЬ В ИСТОРИИ FERRARI" : "БЛИЖАЙШАЯ ДАТА В ИСТОРИИ FERRARI"}
      </p>
      <div className="mt-4 space-y-4">
        {events.map((e) => (
          <div key={`${e.month}-${e.day}-${e.year}`} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-digits text-2xl font-bold text-giallo md:text-3xl">
              {e.day} {MONTHS_RU[e.month - 1]} {e.year}
            </span>
            <p className="min-w-56 flex-1 leading-relaxed text-neutral-200">{e.text}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
