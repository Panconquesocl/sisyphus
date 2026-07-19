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

export const LEVEL_COLORS = ["#e5e7eb", "#c6e48b", "#7bc96f", "#49a340", "#2e7d32"];