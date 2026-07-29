import { describe, it, expect } from "vitest";
import { buildYearGrid, yearMonthLabels } from "./grid";
import { buildRangeGrid } from "./grid";
import { rampFor } from "./grid";

describe("buildYearGrid", () => {
  const cells2026 = buildYearGrid(2026, new Map());

  it("tiene 365 días reales en un año normal", () => {
    expect(cells2026.filter((c) => c !== null)).toHaveLength(365);
  });

  it("tiene 366 días reales en un año bisiesto", () => {
    expect(buildYearGrid(2024, new Map()).filter((c) => c !== null)).toHaveLength(366);
  });

  it("siempre cuadra a semanas completas", () => {
    expect(cells2026.length % 7).toBe(0);
  });

  it("empieza en 1-ene y termina en 31-dic", () => {
    const reales = cells2026.filter((c) => c !== null);
    expect(reales[0]!.date).toBe("2026-01-01");
    expect(reales.at(-1)!.date).toBe("2026-12-31");
  });

  it("coloca el valor en el día correcto", () => {
    const cells = buildYearGrid(2026, new Map([["2026-03-15", 5]]));
    expect(cells.find((c) => c?.date === "2026-03-15")!.value).toBe(5);
  });
});

describe("yearMonthLabels", () => {
  const labels = yearMonthLabels(buildYearGrid(2026, new Map()));

  it("hay una etiqueta por columna", () => {
    expect(labels).toHaveLength(buildYearGrid(2026, new Map()).length / 7);
  });

  it("aparecen los 12 meses, en orden, una vez cada uno", () => {
    expect(labels.filter((l) => l !== null)).toEqual(
      ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"],
    );
  });
});
describe("buildRangeGrid", () => {
  const cells = buildRangeGrid("2026-05-01", "2026-05-31", new Map());

  it("cuadra a semanas completas", () => {
    expect(cells.length % 7).toBe(0);
  });

  it("va del primer al último día del rango, inclusive", () => {
    const reales = cells.filter((c) => c !== null);
    expect(reales[0]!.date).toBe("2026-05-01");
    expect(reales.at(-1)!.date).toBe("2026-05-31");
    expect(reales).toHaveLength(31);
  });
});

describe("rampFor", () => {
  it("verde reusa las vars --heat (look actual intacto)", () => {
    expect(rampFor("green")).toEqual([
      "var(--heat-0)", "var(--heat-1)", "var(--heat-2)", "var(--heat-3)", "var(--heat-4)",
    ]);
  });
  it("un color conocido usa sus vars, con nivel 0 neutro compartido", () => {
    expect(rampFor("blue")).toEqual([
      "var(--heat-0)", "var(--blue-1)", "var(--blue-2)", "var(--blue-3)", "var(--blue-4)",
    ]);
  });
  it("un valor desconocido (hex legacy) cae a verde", () => {
    expect(rampFor("#6b7280")).toEqual(rampFor("green"));
  });
});