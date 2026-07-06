import { useEffect, useState } from "react";
import { of1 } from "./openf1";

// Режим гоночного уик-энда: если в ближайшие 72 часа (или прямо сейчас)
// идут сессии Гран-при — отдаём их расписание.

export const SESSION_RU = {
  "Practice 1": "Практика 1",
  "Practice 2": "Практика 2",
  "Practice 3": "Практика 3",
  Qualifying: "Квалификация",
  "Sprint Qualifying": "Спринт-квалификация",
  "Sprint Shootout": "Спринт-квалификация",
  Sprint: "Спринт",
  Race: "Гонка",
};

export const sessionRu = (name) => SESSION_RU[name] ?? name;

const HORIZON_MS = 72 * 3600 * 1000;

export function useWeekend() {
  const [weekend, setWeekend] = useState(null);

  useEffect(() => {
    let alive = true;
    of1
      .allSessions(new Date().getFullYear())
      .then((sessions) => {
        if (!alive) return;
        const now = Date.now();
        const active = sessions.find(
          (s) =>
            Date.parse(s.date_end ?? s.date_start) > now - 3 * 3600 * 1000 &&
            Date.parse(s.date_start) < now + HORIZON_MS,
        );
        if (!active) return;
        const all = sessions
          .filter((s) => s.meeting_key === active.meeting_key)
          .sort((a, b) => Date.parse(a.date_start) - Date.parse(b.date_start));
        const live = all.find(
          (s) => Date.parse(s.date_start) <= now && now <= Date.parse(s.date_end),
        );
        const next = all.find((s) => Date.parse(s.date_start) > now);
        if (!live && !next) return; // уик-энд уже полностью позади
        setWeekend({
          circuit: active.circuit_short_name,
          sessions: all,
          live: live ?? null,
          next: next ?? null,
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return weekend;
}

export const fmtSessionTime = (iso) =>
  new Date(iso).toLocaleString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

export function untilRu(iso, now = Date.now()) {
  const diff = Date.parse(iso) - now;
  if (diff <= 0) return "уже идёт";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor(diff / 60_000) % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `через ${d} д ${h % 24} ч`;
  }
  return h > 0 ? `через ${h} ч ${m} мин` : `через ${m} мин`;
}
