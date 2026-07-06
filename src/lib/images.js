// All photos are hotlinked from Wikimedia Commons via Special:FilePath,
// which redirects to the original file at the requested thumbnail width.
// Every file used on the site must be registered in IMAGES so the Credits
// page can fetch and display its author and license.

export const commonsFile = (file, width = 1200) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

export const commonsPage = (file) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replaceAll(" ", "_"))}`;

// Driver photos keyed by Ergast/Jolpica driverId.
export const DRIVER_PHOTOS = {
  leclerc: "2024-08-25 Motorsport, Formel 1, Großer Preis der Niederlande 2024 STP 3978 by Stepro (cropped2).jpg",
  hamilton: "2025 Japan GP - Ferrari - Lewis Hamilton - Fanzone Stage (cropped).jpg",
};

export const IMAGES = [
  { file: "Ferrari 125 S fl.jpg", label: "Ferrari 125 S (1947)" },
  { file: "1951-07-01 French GP Ferrari 375 F1 Gonzales.jpg", label: "Хосе Фройлан Гонсалес, Ferrari 375 (1951)" },
  { file: "Alberto Ascari Ferrari Tipo 500 (2533641455).jpg", label: "Альберто Аскари, Ferrari Tipo 500" },
  { file: "Ferrari 156 Sharknose.jpg", label: "Ferrari 156 «Акулий нос» (1961)" },
  { file: "Surtees at 1964 Dutch Grand Prix.jpg", label: "Джон Сертиз, Гран-при Нидерландов 1964" },
  { file: "1975 Italian GP - Niki Lauda - Ferrari 312T.jpg", label: "Ники Лауда, Ferrari 312T, Монца 1975" },
  { file: "1975 Italian GP race start - Niki Lauda & Clay Regazzoni (Ferrari 312T).jpg", label: "Старт Гран-при Италии 1975" },
  { file: "Jody Scheckter 1979 Monaco.jpg", label: "Джоди Шектер, Монако 1979" },
  { file: "Gilles Villeneuve - Ferrari 312 T4 at Rascasse during practice for the 1979 Monaco GP (49984745548).jpg", label: "Жиль Вильнёв, Монако 1979" },
  { file: "Enzo Ferrari Monza 1967.jpg", label: "Энцо Феррари, Монца 1967" },
  { file: "Michael Schumacher Ferrari 2004.jpg", label: "Михаэль Шумахер, Ferrari (2004)" },
  { file: "Kimi Raikkonen 2007 Belgium.jpg", label: "Кими Райкконен, Гран-при Бельгии 2007" },
  { file: "Felipe Massa, Sepang 2008.jpg", label: "Фелипе Масса, Сепанг 2008" },
  { file: "Charles Leclerc, Ferrari SF90 holds off Lewis Hamilton, Mercedes F1 W10, 2019 Italian Grand Prix, Monza, 8th September.jpg", label: "Шарль Леклер, Монца 2019" },
  { file: "2025 Japan GP - Ferrari - Lewis Hamilton - FP1.jpg", label: "Льюис Хэмилтон, Ferrari, Гран-при Японии 2025" },
  { file: "2024-08-25 Motorsport, Formel 1, Großer Preis der Niederlande 2024 STP 3978 by Stepro (cropped2).jpg", label: "Шарль Леклер (портрет, 2024)" },
  { file: "2025 Japan GP - Ferrari - Lewis Hamilton - Fanzone Stage (cropped).jpg", label: "Льюис Хэмилтон (портрет, 2025)" },
  { file: "SF-24 at the Japanese GP.jpg", label: "Ferrari SF-24, Гран-при Японии" },
  { file: "Ferrari F2002.jpg", label: "Ferrari F2002" },
  { file: "Scuderia Ferrari Pit Stop2.JPG", label: "Пит-стоп Scuderia Ferrari" },
  { file: "1956-08-12 Kristianstad Ferrari 750 0470M Lohmander Kvarnström Bonnier Fangio.jpg", label: "Хуан Мануэль Фанхио, Ferrari (1956)" },
  { file: "Scuderia Ferrari - Monza, 1953 - Enzo Ferrari & Mike Hawthorn.jpg", label: "Энцо Феррари и Майк Хоторн, Монца 1953" },
  { file: "Alonso china 2013.jpg", label: "Фернандо Алонсо, Ferrari, Китай 2013" },
  { file: "Sebastian Vettel-Ferrari-2019 (5).jpg", label: "Себастьян Феттель, Ferrari (2019)" },
];
