// Jolpica F1 API (Ergast successor) — free, no key, CORS-enabled.
// Responses are cached in localStorage to stay well within rate limits.

const BASE = "https://api.jolpi.ca/ergast/f1";
const TTL_MS = 10 * 60 * 1000;

async function getJSON(path) {
  const key = `rc-cache:${path}`;
  try {
    const hit = JSON.parse(localStorage.getItem(key));
    if (hit && Date.now() - hit.t < TTL_MS) return hit.d;
  } catch {
    /* corrupt cache entry — fall through to network */
  }
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`Jolpica ${res.status} for ${path}`);
  const json = await res.json();
  const data = json.MRData;
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
  } catch {
    /* storage full — serve without caching */
  }
  return data;
}

export const api = {
  // season: "current" или год ("1976") — «машина времени» работает с 1950-го
  constructorStandings: (season = "current") =>
    getJSON(`/${season}/constructorstandings.json`),
  driverStandings: (season = "current") => getJSON(`/${season}/driverstandings.json`),
  schedule: (season = "current") => getJSON(`/${season}.json?limit=30`),
  ferrariResults: () => getJSON("/current/constructors/ferrari/results.json?limit=100"),
  // MRData.total = number of Ferrari wins at this circuit, all time
  ferrariWinsAtCircuit: (circuitId) =>
    getJSON(`/circuits/${circuitId}/constructors/ferrari/results/1.json?limit=1`),
  // MRData.total = Ferrari wins, all time
  ferrariAllWins: () => getJSON("/constructors/ferrari/results/1.json?limit=1"),
  raceResults: (round, season = "current") =>
    getJSON(`/${season}/${round}/results.json?limit=30`),
  qualifyingResults: (round, season = "current") =>
    getJSON(`/${season}/${round}/qualifying.json?limit=30`),
  lastRaceResults: () => getJSON("/current/last/results.json?limit=30"),
  driverResults: (driverId, season = "current") =>
    getJSON(`/${season}/drivers/${driverId}/results.json?limit=100`),
  constructorResults: (constructorId) =>
    getJSON(`/current/constructors/${constructorId}/results.json?limit=100`),
  constructorSprints: (constructorId) =>
    getJSON(`/current/constructors/${constructorId}/sprint.json?limit=100`),
  // все результаты сезона одним запросом — для пересчёта очковых систем
  seasonResults: (season = "current") => getJSON(`/${season}/results.json?limit=1000`),
  // энциклопедия: вся карьера одним-двумя запросами
  // (standings без сезона Jolpica не отдаёт — агрегируем из результатов)
  // Jolpica отдаёт максимум 100 строк за страницу — листаем с паузой,
  // чтобы не упереться в рейт-лимит (у Ferrari ~11 страниц истории)
  careerResults: async (kind, id) => {
    // total считает result-строки (у команды по две машины в гонке),
    // поэтому у Ferrari это ~2100 — потолка должно хватить на всю историю
    const races = [];
    let offset = 0;
    let total = Infinity;
    while (races.length < total && offset < 2600) {
      const page = await getJSON(`/${kind}/${id}/results.json?limit=100&offset=${offset}`);
      total = +page.total;
      const rows = page.RaceTable.Races ?? [];
      if (!rows.length) break;
      races.push(...rows);
      offset += 100;
      if (offset < total) await new Promise((r) => setTimeout(r, 250));
    }
    return races;
  },
};

// The last Ferrari constructors' title was clinched at the 2008 Brazilian GP.
export const LAST_CONSTRUCTORS_TITLE = new Date("2008-11-02T00:00:00Z");

export const daysSinceLastTitle = () =>
  Math.floor((Date.now() - LAST_CONSTRUCTORS_TITLE.getTime()) / 86_400_000);
