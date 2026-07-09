import { TRACKS } from "./tracks";

/* Справочник трасс: сопоставление Jolpica circuitId с контуром из TRACKS
   (по имени OpenF1) и курируемые характеристики современной конфигурации.
   Длина/повороты — приблизительные (Jolpica их не отдаёт). */

const META = {
  albert_park: { openf1: "Melbourne", length: 5.278, turns: 14 },
  shanghai: { openf1: "Shanghai", length: 5.451, turns: 16 },
  suzuka: { openf1: "Suzuka", length: 5.807, turns: 18 },
  bahrain: { openf1: "Sakhir", length: 5.412, turns: 15 },
  jeddah: { openf1: "Jeddah", length: 6.174, turns: 27 },
  miami: { openf1: "Miami", length: 5.412, turns: 19 },
  imola: { openf1: "Imola", length: 4.909, turns: 19 },
  monaco: { openf1: "Monte Carlo", length: 3.337, turns: 19 },
  catalunya: { openf1: "Catalunya", length: 4.657, turns: 14 },
  villeneuve: { openf1: "Montreal", length: 4.361, turns: 14 },
  red_bull_ring: { openf1: "Spielberg", length: 4.318, turns: 10 },
  silverstone: { openf1: "Silverstone", length: 5.891, turns: 18 },
  spa: { openf1: "Spa-Francorchamps", length: 7.004, turns: 19 },
  hungaroring: { openf1: "Hungaroring", length: 4.381, turns: 14 },
  zandvoort: { openf1: "Zandvoort", length: 4.259, turns: 14 },
  monza: { openf1: "Monza", length: 5.793, turns: 11 },
  baku: { openf1: "Baku", length: 6.003, turns: 20 },
  marina_bay: { openf1: "Singapore", length: 4.94, turns: 19 },
  americas: { openf1: "Austin", length: 5.513, turns: 20 },
  rodriguez: { openf1: "Mexico City", length: 4.304, turns: 17 },
  interlagos: { openf1: "Interlagos", length: 4.309, turns: 15 },
  las_vegas: { openf1: "Las Vegas", length: 6.201, turns: 17 },
  losail: { openf1: "Lusail", length: 5.419, turns: 16 },
  yas_marina: { openf1: "Yas Marina Circuit", length: 5.281, turns: 16 },
};

const byOpenF1 = Object.fromEntries(TRACKS.map((t) => [t.id, t]));

/* Контур (SVG-путь) для Jolpica circuitId — или null, если трассы нет в наборе */
export function circuitMeta(circuitId) {
  const m = META[circuitId];
  if (!m) return null;
  const track = byOpenF1[m.openf1];
  return { ...m, path: track?.path ?? null };
}

/* Список трасс текущего набора для страницы-каталога */
export const CIRCUIT_LIST = Object.entries(META).map(([circuitId, m]) => ({
  circuitId,
  ...m,
  track: byOpenF1[m.openf1],
}));

/* Обратное сопоставление: имя OpenF1 → Jolpica circuitId (для ссылок из игры) */
export const circuitIdByOpenF1 = Object.fromEntries(
  Object.entries(META).map(([circuitId, m]) => [m.openf1, circuitId]),
);
