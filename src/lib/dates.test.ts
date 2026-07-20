import { describe, it, expect } from "vitest";
import { dayInTimeZone, monthInTimeZone, isValidTimeZone } from "./dates";

describe("dayInTimeZone", () => {
  it("usa UTC cuando no hay zona", () => {
    expect(dayInTimeZone(new Date("2026-08-01T01:00:00Z"), null)).toBe("2026-08-01");
  });

  it("retrocede un día en zonas detrás de UTC", () => {
    // 01:00 UTC del 1 de agosto es todavía 31 de julio en Santiago (UTC-4)
    expect(dayInTimeZone(new Date("2026-08-01T01:00:00Z"), "America/Santiago")).toBe("2026-07-31");
  });

  it("avanza un día en zonas delante de UTC", () => {
    expect(dayInTimeZone(new Date("2026-07-20T16:00:00Z"), "Asia/Tokyo")).toBe("2026-07-21");
  });

  it("respeta el horario de verano", () => {
    // Misma hora UTC, distinto día local: NY está en UTC-5 en enero y UTC-4 en julio
    expect(dayInTimeZone(new Date("2026-01-15T04:30:00Z"), "America/New_York")).toBe("2026-01-14");
    expect(dayInTimeZone(new Date("2026-07-15T04:30:00Z"), "America/New_York")).toBe("2026-07-15");
  });
});

describe("monthInTimeZone", () => {
  it("devuelve el mes 0-indexado de la zona, no del servidor", () => {
    // El servidor ya está en agosto; el usuario en Santiago sigue en julio
    expect(monthInTimeZone(new Date("2026-08-01T01:00:00Z"), "America/Santiago"))
      .toEqual({ year: 2026, month: 6 });
  });
});

describe("isValidTimeZone", () => {
  it("acepta nombres IANA y rechaza basura", () => {
    expect(isValidTimeZone("America/Santiago")).toBe(true);
    expect(isValidTimeZone("Marte/Olympus")).toBe(false);
  });
});