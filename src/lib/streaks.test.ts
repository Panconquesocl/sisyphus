import { describe, expect, it } from "vitest";
import { computeStreak } from "./streaks";

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