import { of1 } from "./openf1";
import { circuitGpRu } from "./i18n";
import { sessionRu } from "./useWeekend";

/* Экспорт всех сессий сезона (практики, квалификации, спринты, гонки)
   в стандартный .ics — открывается в Google/Apple/Outlook календаре.
   Данные OpenF1, время в UTC — календарь сам покажет местное. */

const icsDate = (iso) =>
  new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const escape = (s) => String(s).replace(/([,;\\])/g, "\\$1");

export async function downloadSeasonIcs(year = new Date().getFullYear()) {
  const sessions = await of1.allSessions(year);
  if (!sessions.length) throw new Error("Нет сессий для этого сезона");

  const events = sessions.map((s) => {
    const gp = circuitGpRu(s.circuit_short_name);
    return [
      "BEGIN:VEVENT",
      `UID:fs-${s.session_key}@ferrari-strategy`,
      `DTSTAMP:${icsDate(new Date().toISOString())}`,
      `DTSTART:${icsDate(s.date_start)}`,
      `DTEND:${icsDate(s.date_end)}`,
      `SUMMARY:${escape(`Ф1 · ${gp} — ${sessionRu(s.session_name)}`)}`,
      `LOCATION:${escape(`${s.circuit_short_name}, ${s.country_name}`)}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ferrari Strategy//RU",
    `X-WR-CALNAME:Формула-1 ${year}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `f1-${year}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
