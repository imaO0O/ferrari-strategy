// OpenF1 API — бесплатная телеметрия Формулы-1 (https://openf1.org).
// Без ключей, CORS открыт. Данные доступны для сессий с 2023 года
// и появляются с небольшой задержкой после сессии.

const BASE = "https://api.openf1.org/v1";
const TTL_MS = 10 * 60 * 1000;

// Кэш в sessionStorage: у OpenF1 строгий рейт-лимит, а данные завершённой
// гонки не меняются. Слишком большие ответы просто не кэшируются (quota).
async function getJSON(path) {
  const key = `of1:${path}`;
  try {
    const hit = JSON.parse(sessionStorage.getItem(key));
    if (hit && Date.now() - hit.t < TTL_MS) return hit.d;
  } catch {
    /* повреждённая запись — идём в сеть */
  }
  const res = await fetch(BASE + path);
  if (res.status === 429) throw new Error("OpenF1 rate limit — подожди минуту и повтори");
  if (!res.ok) throw new Error(`OpenF1 ${res.status} for ${path}`);
  const data = await res.json();
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
  } catch {
    /* превышена квота хранилища — работаем без кэша */
  }
  return data;
}

export const of1 = {
  // все гонки года
  raceSessions: (year) => getJSON(`/sessions?year=${year}&session_name=Race`),
  // участники сессии: имя, аббревиатура, номер, цвет команды
  drivers: (sessionKey) => getJSON(`/drivers?session_key=${sessionKey}`),
  // изменения позиций по ходу сессии (компактно: только моменты смены позиции)
  positions: (sessionKey) => getJSON(`/position?session_key=${sessionKey}`),
  // радиопереговоры пилота в сессии (mp3-ссылки)
  teamRadio: (sessionKey, driverNumber) =>
    getJSON(`/team_radio?session_key=${sessionKey}&driver_number=${driverNumber}`),
  // круги пилота: старт каждого круга и его длительность
  laps: (sessionKey, driverNumber) =>
    getJSON(`/laps?session_key=${sessionKey}&driver_number=${driverNumber}`),
  // координаты машин (x, y) в интервале времени; driverNumber опционален.
  // Данные тяжёлые (~3,7 Гц на машину) — запрашивать только узкими окнами!
  locationWindow: (sessionKey, fromISO, toISO, driverNumber) =>
    getJSON(
      `/location?session_key=${sessionKey}` +
        (driverNumber ? `&driver_number=${driverNumber}` : "") +
        `&date%3E${encodeURIComponent(fromISO)}&date%3C${encodeURIComponent(toISO)}`,
    ),
};
