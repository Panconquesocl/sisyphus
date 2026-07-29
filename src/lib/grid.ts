export type DayCell = { date: string; value: number | null } | null; // null = relleno
export type HabitType = "BINARY" | "QUANTITY" | "DURATION";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function buildMonthGrid(
  year: number,
  month: number, // 0-11
  valuesByDate: Map<string, number>,
): DayCell[] {
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;

  const cells: DayCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = iso(year, month, d);
    cells.push({ date, value: valuesByDate.get(date) ?? null });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// 0 = vacío ... 4 = meta cumplida
export function intensityLevel(
  value: number | null,
  type: HabitType,
  target: number | null,
): number {
  if (!value || value <= 0) return 0;
  if (type === "BINARY" || !target) return 4; // binario o sin meta: lleno
  const ratio = value / target;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

export const LEVEL_COLORS = [
  "var(--heat-0)",
  "var(--heat-1)",
  "var(--heat-2)",
  "var(--heat-3)",
  "var(--heat-4)",
];

export function buildYearGrid(
  year: number,
  valuesByDate: Map<string, number>,
): DayCell[] {
  const cells: DayCell[] = [];

  // Relleno inicial: qué día de semana (lunes=0) cae el 1 de enero.
  const firstWeekday = (new Date(Date.UTC(year, 0, 1)).getUTCDay() + 6) % 7;
  for (let i = 0; i < firstWeekday; i++) cells.push(null);

  // Recorremos día a día desde el 1-ene hasta que el año cambie.
  const cursor = new Date(Date.UTC(year, 0, 1));
  while (cursor.getUTCFullYear() === year) {
    const date = iso(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate());
    cells.push({ date, value: valuesByDate.get(date) ?? null });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // Relleno final hasta completar la última semana.
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTHS_ES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];

/**
 * Una etiqueta por columna de la grilla anual: el nombre del mes en la primera
 * columna donde aparece, `null` en las demás. Se deriva de las celdas para no
 * recalcular el relleno.
 */
export function yearMonthLabels(cells: DayCell[]): (string | null)[] {
  const numCols = cells.length / 7;
  const labels: (string | null)[] = [];
  let lastMonth = -1;

  for (let c = 0; c < numCols; c++) {
    // Mes del primer día real de esta columna (semana).
    let month: number | null = null;
    for (let r = 0; r < 7; r++) {
      const cell = cells[c * 7 + r];
      if (cell) { month = Number(cell.date.slice(5, 7)) - 1; break; }
    }
    if (month !== null && month !== lastMonth) {
      labels.push(MONTHS_ES[month]);
      lastMonth = month;
    } else {
      labels.push(null);
    }
  }
  return labels;
}

export function buildRangeGrid(
  startISO: string,
  endISO: string,
  valuesByDate: Map<string, number>,
): DayCell[] {
  const cells: DayCell[] = [];
  const start = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${endISO}T00:00:00Z`);

  const firstWeekday = (start.getUTCDay() + 6) % 7; // lunes = 0
  for (let i = 0; i < firstWeekday; i++) cells.push(null);

  const cursor = new Date(start);
  while (cursor <= end) {
    const date = iso(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate());
    cells.push({ date, value: valuesByDate.get(date) ?? null });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}