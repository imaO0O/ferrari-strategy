// «Паспорт тифози»: экспорт и импорт всего локального прогресса файлом,
// чтобы не потерять рекорды при смене браузера или устройства.

export const PROFILE_KEYS = [
  "fs-reaction-records",
  "fs-reaction-attempts",
  "fs-pitstop-records",
  "fs-quiz-best",
  "fs-tracks-best",
  "fs-predictions",
  "fs-fav-driver",
];

export function exportProfile() {
  const data = {};
  for (const key of PROFILE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw != null) data[key] = raw;
  }
  const payload = JSON.stringify({ app: "ferrari-strategy", version: 1, data }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ferrari-strategy-profile.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProfile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (parsed?.app !== "ferrari-strategy" || typeof parsed.data !== "object") {
    throw new Error("Это не файл профиля Ferrari Strategy");
  }
  let applied = 0;
  for (const key of PROFILE_KEYS) {
    if (typeof parsed.data[key] === "string") {
      localStorage.setItem(key, parsed.data[key]);
      applied++;
    }
  }
  if (!applied) throw new Error("В файле нет данных профиля");
  return applied;
}
