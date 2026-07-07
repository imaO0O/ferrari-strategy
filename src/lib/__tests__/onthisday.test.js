import { describe, it, expect } from "vitest";
import { pickEvent, ON_THIS_DAY } from "../../data/onthisday";

describe("pickEvent («В этот день»)", () => {
  it("находит событие в день рождения Энцо Феррари", () => {
    const { events, isToday } = pickEvent(new Date(2026, 1, 18)); // 18 февраля
    expect(isToday).toBe(true);
    expect(events.some((e) => e.text.includes("Энцо Феррари"))).toBe(true);
  });

  it("в «пустой» день возвращает ближайшее будущее событие", () => {
    const { events, isToday } = pickEvent(new Date(2026, 0, 1)); // 1 января
    expect(isToday).toBe(false);
    expect(events).toHaveLength(1);
    // ближайшее после 1 января — день рождения Шумахера 3 января
    expect(events[0]).toMatchObject({ month: 1, day: 3 });
  });

  it("переходит через Новый год к январским датам", () => {
    const { events, isToday } = pickEvent(new Date(2026, 11, 31)); // 31 декабря
    expect(isToday).toBe(false);
    expect(events[0]).toMatchObject({ month: 1, day: 3 });
  });

  it("все даты валидны", () => {
    for (const e of ON_THIS_DAY) {
      expect(e.month).toBeGreaterThanOrEqual(1);
      expect(e.month).toBeLessThanOrEqual(12);
      expect(e.day).toBeGreaterThanOrEqual(1);
      expect(e.day).toBeLessThanOrEqual(31);
      expect(e.text.length).toBeGreaterThan(20);
    }
  });
});
