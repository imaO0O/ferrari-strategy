// Очковые системы разных эпох Формулы-1 и пересчёт личного зачёта по ним.
// Считаются только гонки: спринтов в исторических системах не существовало.

export const POINT_SYSTEMS = [
  { id: "modern", label: "2010 — наши дни", points: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  { id: "2003", label: "2003–2009", points: [10, 8, 6, 5, 4, 3, 2, 1] },
  { id: "1991", label: "1991–2002", points: [10, 6, 4, 3, 2, 1] },
  { id: "classic", label: "1961–1990", points: [9, 6, 4, 3, 2, 1] },
];

/* races — гонки сезона в формате Jolpica (RaceTable.Races);
   officialPositions — { driverId: официальное место } для расчёта дельты. */
export function recomputeStandings(races, system, officialPositions = {}) {
  const totals = {};
  for (const race of races) {
    for (const res of race.Results ?? []) {
      const pts = system.points[+res.position - 1] ?? 0;
      const id = res.Driver.driverId;
      totals[id] ??= {
        driver: res.Driver,
        constructorId: res.Constructor.constructorId,
        pts: 0,
      };
      totals[id].pts += pts;
    }
  }
  return Object.values(totals)
    .sort((a, b) => b.pts - a.pts)
    .map((row, i) => ({
      ...row,
      position: i + 1,
      delta: (officialPositions[row.driver.driverId] ?? i + 1) - (i + 1),
    }));
}
