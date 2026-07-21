import { describe, expect, it } from "vitest";
import { computeStreak } from "./streaks";
import { maxStreak, completionRate } from "./streaks";

const map = (entries: Record<string, number>) => new Map(Object.entries(entries));

describe("computeStreak", () => {
  it("no muestra racha con un solo día", () => {
    expect(computeStreak(map({ "2026-07-19": 1 }), "BINARY", null, "2026-07-19"))
      .toEqual({ kind: "none", length: 0 });
  });

  it("cuenta racha perfecta en binario", () => {
    const v = map({ "2026-07-19": 1, "2026-07-18": 1, "2026-07-17": 1 });
    expect(computeStreak(v, "BINARY", null, "2026-07-19"))
      .toEqual({ kind: "perfect", length: 3 });
  });

  it("gracia: si hoy no está registrado, cuenta desde ayer", () => {
    const v = map({ "2026-07-18": 1, "2026-07-17": 1 });
    expect(computeStreak(v, "BINARY", null, "2026-07-19"))
      .toEqual({ kind: "perfect", length: 2 });
  });

  it("un día bajo el umbral hoy rompe la racha", () => {
    const v = map({ "2026-07-19": 2, "2026-07-18": 10, "2026-07-17": 10 }); // hoy 20%
    expect(computeStreak(v, "QUANTITY", 10, "2026-07-19"))
      .toEqual({ kind: "none", length: 0 });
  });

  it("prioriza la perfecta sobre la suave", () => {
    const v = map({ "2026-07-19": 10, "2026-07-18": 10, "2026-07-17": 6 });
    expect(computeStreak(v, "QUANTITY", 10, "2026-07-19"))
      .toEqual({ kind: "perfect", length: 2 });
  });

  it("cae a suave si hoy no fue perfecto", () => {
    const v = map({ "2026-07-19": 6, "2026-07-18": 10, "2026-07-17": 10 }); // hoy 60%
    expect(computeStreak(v, "QUANTITY", 10, "2026-07-19"))
      .toEqual({ kind: "soft", length: 3 });
  });

  it("un hueco corta la racha", () => {
    const v = map({ "2026-07-19": 1, "2026-07-18": 1, "2026-07-16": 1 });
    expect(computeStreak(v, "BINARY", null, "2026-07-19"))
      .toEqual({ kind: "perfect", length: 2 });
  });

  it("cruza el cambio de mes", () => {
    const v = map({ "2026-07-01": 1, "2026-06-30": 1, "2026-06-29": 1 });
    expect(computeStreak(v, "BINARY", null, "2026-07-01"))
      .toEqual({ kind: "perfect", length: 3 });
  });
});
describe("maxStreak", () => {
  it("cuenta el tramo perfecto más largo, ignorando huecos", () => {
    const m = new Map([
      ["2026-01-01", 1], ["2026-01-02", 1], ["2026-01-03", 1], // tramo de 3
      ["2026-01-05", 1], ["2026-01-06", 1],                    // hueco el 04 → tramo de 2
    ]);
    expect(maxStreak(m, "BINARY", null)).toBe(3);
  });

  it("un día bajo umbral corta el tramo aunque sea consecutivo", () => {
    const m = new Map([
      ["2026-01-01", 10], ["2026-01-02", 4], ["2026-01-03", 10], // meta 10: el 02 es SOFT
    ]);
    expect(maxStreak(m, "QUANTITY", 10)).toBe(1);
  });

  it("es 0 sin días perfectos", () => {
    expect(maxStreak(new Map(), "BINARY", null)).toBe(0);
  });
});

describe("completionRate", () => {
  it("divide días perfectos por días transcurridos, no por 365", () => {
    const m = new Map([["2026-01-01", 1], ["2026-01-02", 1]]);
    expect(completionRate(m, "BINARY", null, 2026, 4)).toBe(50); // 2 de 4
  });

  it("ignora días de otros años", () => {
    const m = new Map([["2025-12-31", 1], ["2026-01-01", 1]]);
    expect(completionRate(m, "BINARY", null, 2026, 1)).toBe(100); // solo cuenta el de 2026
  });
});