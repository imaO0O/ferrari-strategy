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
  leclerc: "Charles-Leclerc.jpg",
  hamilton: "2025 Japan GP - Ferrari - Lewis Hamilton - Fanzone Stage (cropped).jpg",
};

export const IMAGES = [
  { file: "Ferrari 125 S fl.jpg", label: "Ferrari 125 S (1947)" },
  { file: "1951-07-01 French GP Ferrari 375 F1 Gonzales.jpg", label: "José Froilán González, Ferrari 375 (1951)" },
  { file: "Alberto Ascari Ferrari Tipo 500 (2533641455).jpg", label: "Alberto Ascari, Ferrari Tipo 500" },
  { file: "Ferrari 156 Sharknose.jpg", label: "Ferrari 156 “Sharknose” (1961)" },
  { file: "Surtees at 1964 Dutch Grand Prix.jpg", label: "John Surtees, 1964 Dutch GP" },
  { file: "1975 Italian GP - Niki Lauda - Ferrari 312T.jpg", label: "Niki Lauda, Ferrari 312T, Monza 1975" },
  { file: "1975 Italian GP race start - Niki Lauda & Clay Regazzoni (Ferrari 312T).jpg", label: "1975 Italian GP race start" },
  { file: "Jody Scheckter 1979 Monaco.jpg", label: "Jody Scheckter, Monaco 1979" },
  { file: "Gilles Villeneuve - Ferrari 312 T4 at Rascasse during practice for the 1979 Monaco GP (49984745548).jpg", label: "Gilles Villeneuve, Monaco 1979" },
  { file: "Enzo Ferrari Monza 1967.jpg", label: "Enzo Ferrari, Monza 1967" },
  { file: "Michael Schumacher Ferrari 2004.jpg", label: "Michael Schumacher, Ferrari (2004)" },
  { file: "Kimi Raikkonen 2007 Belgium.jpg", label: "Kimi Räikkönen, 2007 Belgian GP" },
  { file: "Felipe Massa, Sepang 2008.jpg", label: "Felipe Massa, Sepang 2008" },
  { file: "Charles Leclerc, Ferrari SF90 holds off Lewis Hamilton, Mercedes F1 W10, 2019 Italian Grand Prix, Monza, 8th September.jpg", label: "Charles Leclerc, Monza 2019" },
  { file: "2025 Japan GP - Ferrari - Lewis Hamilton - FP1.jpg", label: "Lewis Hamilton, Ferrari, 2025 Japanese GP" },
  { file: "Charles-Leclerc.jpg", label: "Charles Leclerc (portrait)" },
  { file: "2025 Japan GP - Ferrari - Lewis Hamilton - Fanzone Stage (cropped).jpg", label: "Lewis Hamilton (portrait, 2025)" },
  { file: "SF-24 at the Japanese GP.jpg", label: "Ferrari SF-24, Japanese GP" },
  { file: "Scuderia Ferrari Pit Stop2.JPG", label: "Scuderia Ferrari pit stop" },
];
