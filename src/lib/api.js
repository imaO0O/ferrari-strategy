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
  constructorStandings: () => getJSON("/current/constructorstandings.json"),
  driverStandings: () => getJSON("/current/driverstandings.json"),
  schedule: () => getJSON("/current.json?limit=30"),
  ferrariResults: () => getJSON("/current/constructors/ferrari/results.json?limit=100"),
  // MRData.total = number of Ferrari wins at this circuit, all time
  ferrariWinsAtCircuit: (circuitId) =>
    getJSON(`/circuits/${circuitId}/constructors/ferrari/results/1.json?limit=1`),
  // MRData.total = Ferrari wins, all time
  ferrariAllWins: () => getJSON("/constructors/ferrari/results/1.json?limit=1"),
};

// The last Ferrari constructors' title was clinched at the 2008 Brazilian GP.
export const LAST_CONSTRUCTORS_TITLE = new Date("2008-11-02T00:00:00Z");

export const daysSinceLastTitle = () =>
  Math.floor((Date.now() - LAST_CONSTRUCTORS_TITLE.getTime()) / 86_400_000);
