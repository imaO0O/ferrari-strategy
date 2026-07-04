// Русские названия для данных, приходящих из Jolpica F1 API на английском.
// Всё с безопасным фолбэком на оригинал.

const GP_RU = {
  "Australian Grand Prix": "Гран-при Австралии",
  "Chinese Grand Prix": "Гран-при Китая",
  "Japanese Grand Prix": "Гран-при Японии",
  "Bahrain Grand Prix": "Гран-при Бахрейна",
  "Saudi Arabian Grand Prix": "Гран-при Саудовской Аравии",
  "Miami Grand Prix": "Гран-при Майами",
  "Emilia Romagna Grand Prix": "Гран-при Эмилии-Романьи",
  "Monaco Grand Prix": "Гран-при Монако",
  "Canadian Grand Prix": "Гран-при Канады",
  "Spanish Grand Prix": "Гран-при Испании",
  "Austrian Grand Prix": "Гран-при Австрии",
  "British Grand Prix": "Гран-при Великобритании",
  "Belgian Grand Prix": "Гран-при Бельгии",
  "Hungarian Grand Prix": "Гран-при Венгрии",
  "Dutch Grand Prix": "Гран-при Нидерландов",
  "Italian Grand Prix": "Гран-при Италии",
  "Azerbaijan Grand Prix": "Гран-при Азербайджана",
  "Singapore Grand Prix": "Гран-при Сингапура",
  "United States Grand Prix": "Гран-при США",
  "Mexico City Grand Prix": "Гран-при Мехико",
  "São Paulo Grand Prix": "Гран-при Сан-Паулу",
  "Las Vegas Grand Prix": "Гран-при Лас-Вегаса",
  "Qatar Grand Prix": "Гран-при Катара",
  "Abu Dhabi Grand Prix": "Гран-при Абу-Даби",
  "Madrid Grand Prix": "Гран-при Мадрида",
};

const COUNTRY_RU = {
  UK: "Великобритания",
  "Great Britain": "Великобритания",
  Italy: "Италия",
  Spain: "Испания",
  Monaco: "Монако",
  France: "Франция",
  Belgium: "Бельгия",
  Netherlands: "Нидерланды",
  Austria: "Австрия",
  Hungary: "Венгрия",
  Germany: "Германия",
  Australia: "Австралия",
  Japan: "Япония",
  China: "Китай",
  Bahrain: "Бахрейн",
  Qatar: "Катар",
  "Saudi Arabia": "Саудовская Аравия",
  UAE: "ОАЭ",
  "United Arab Emirates": "ОАЭ",
  USA: "США",
  "United States": "США",
  Canada: "Канада",
  Mexico: "Мексика",
  Brazil: "Бразилия",
  Azerbaijan: "Азербайджан",
  Singapore: "Сингапур",
};

// Пилоты Ferrari (по driverId из API); для остальных остаётся латиница.
const DRIVER_RU = {
  leclerc: { given: "Шарль", family: "Леклер" },
  hamilton: { given: "Льюис", family: "Хэмилтон" },
  sainz: { given: "Карлос", family: "Сайнс" },
  bearman: { given: "Оливер", family: "Бирман" },
};

export const gpRu = (name) => GP_RU[name] ?? name;
export const countryRu = (name) => COUNTRY_RU[name] ?? name;
export const driverRu = (driver) =>
  DRIVER_RU[driver.driverId] ?? { given: driver.givenName, family: driver.familyName };

export const formatDateRu = (date, time) =>
  new Date(`${date}T${time ?? "12:00:00Z"}`).toLocaleString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
