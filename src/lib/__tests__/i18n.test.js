import { describe, it, expect } from "vitest";
import { gpRu, countryRu, circuitGpRu, driverRu, teamColor } from "../i18n";

describe("словари i18n", () => {
  it("переводит известные Гран-при", () => {
    expect(gpRu("British Grand Prix")).toBe("Гран-при Великобритании");
    expect(gpRu("Monaco Grand Prix")).toBe("Гран-при Монако");
  });

  it("возвращает оригинал для неизвестного Гран-при", () => {
    expect(gpRu("Lunar Grand Prix")).toBe("Lunar Grand Prix");
  });

  it("переводит страны и не падает на неизвестных", () => {
    expect(countryRu("Italy")).toBe("Италия");
    expect(countryRu("Atlantis")).toBe("Atlantis");
  });

  it("маппит короткие имена трасс OpenF1", () => {
    expect(circuitGpRu("Monza")).toBe("Гран-при Италии");
    expect(circuitGpRu("Spielberg")).toBe("Гран-при Австрии");
    expect(circuitGpRu("Nowhere")).toContain("Nowhere"); // фолбэк сохраняет имя
  });

  it("даёт русские имена пилотам Ferrari и фолбэк остальным", () => {
    expect(driverRu({ driverId: "leclerc" })).toEqual({ given: "Шарль", family: "Леклер" });
    const unknown = driverRu({ driverId: "nobody", givenName: "John", familyName: "Doe" });
    expect(unknown).toEqual({ given: "John", family: "Doe" });
  });

  it("даёт цвет команды и серый фолбэк", () => {
    expect(teamColor("ferrari")).toBe("#e10600");
    expect(teamColor("unknown_team")).toBe("#8a8a93");
  });
});
