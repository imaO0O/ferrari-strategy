// Подсчёт очков за прогноз подиума:
// точное попадание в место — 5 очков, пилот на подиуме не на своём месте — 2.
export function scorePodium(picks, actual) {
  return picks.reduce(
    (sum, id, i) => sum + (actual[i] === id ? 5 : actual.includes(id) ? 2 : 0),
    0,
  );
}
