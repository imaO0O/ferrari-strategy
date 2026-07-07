import { describe, it, expect } from "vitest";
import { POINT_SYSTEMS, recomputeStandings } from "../points";

const race = (results) => ({
  Results: results.map(([driverId, position]) => ({
    position: String(position),
    Driver: { driverId },
    Constructor: { constructorId: "ferrari" },
  })),
});

const races = [
  race([
    ["leclerc", 1],
    ["hamilton", 2],
    ["norris", 3],
  ]),
  race([
    ["hamilton", 1],
    ["leclerc", 2],
    ["norris", 11], // вне очков в любой системе
  ]),
];

describe("recomputeStandings", () => {
  it("считает современную систему (25-18-…)", () => {
    const modern = POINT_SYSTEMS.find((s) => s.id === "modern");
    const table = recomputeStandings(races, modern);
    expect(table[0]).toMatchObject({ position: 1, pts: 43 }); // 25+18 у обоих лидеров
    expect(table[1].pts).toBe(43);
    expect(table.find((r) => r.driver.driverId === "norris").pts).toBe(15);
  });

  it("считает классическую систему (9-6-4-…)", () => {
    const classic = POINT_SYSTEMS.find((s) => s.id === "classic");
    const table = recomputeStandings(races, classic);
    expect(table.find((r) => r.driver.driverId === "leclerc").pts).toBe(15); // 9+6
    expect(table.find((r) => r.driver.driverId === "norris").pts).toBe(4); // только подиум в 1-й гонке
  });

  it("считает дельту к официальному зачёту", () => {
    const classic = POINT_SYSTEMS.find((s) => s.id === "classic");
    const table = recomputeStandings(races, classic, { leclerc: 3, hamilton: 1, norris: 2 });
    const leclerc = table.find((r) => r.driver.driverId === "leclerc");
    expect(leclerc.delta).toBe(3 - leclerc.position);
  });

  it("позиции за пределами таблицы очков дают 0", () => {
    const sys91 = POINT_SYSTEMS.find((s) => s.id === "1991");
    const table = recomputeStandings([race([["zhou", 7]])], sys91);
    expect(table[0].pts).toBe(0);
  });
});
