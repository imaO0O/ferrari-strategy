import { describe, it, expect } from "vitest";
import { scorePodium } from "../scoring";

describe("scorePodium", () => {
  const actual = ["leclerc", "hamilton", "verstappen"];

  it("даёт 15 за точный подиум", () => {
    expect(scorePodium(["leclerc", "hamilton", "verstappen"], actual)).toBe(15);
  });

  it("даёт по 2 за пилотов на подиуме не на своих местах", () => {
    expect(scorePodium(["hamilton", "verstappen", "leclerc"], actual)).toBe(6);
  });

  it("смешивает точные попадания и попадания в подиум", () => {
    // P1 точно (5) + P2 мимо (0) + P3 на подиуме, но не там (2)
    expect(scorePodium(["leclerc", "norris", "hamilton"], actual)).toBe(7);
  });

  it("даёт 0 за полностью неверный прогноз", () => {
    expect(scorePodium(["norris", "piastri", "russell"], actual)).toBe(0);
  });
});
