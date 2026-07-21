import type { HabitType } from "./grid";

export type DayLevel = "NONE" | "SOFT" | "PERFECT";
export type Streak = { kind: "perfect" | "soft" | "none"; length: number };

/** Nivel de cumplimiento de un día */
export function dayLevel(
  value: number | undefined,
  type: HabitType,
  target: number | null,
): DayLevel {
  if (value === undefined || value <= 0) return "NONE";
  if (type === "BINARY" || !target) return "PERFECT";
  if (value >= target) return "PERFECT";
  if (value >= target / 2) return "SOFT";
  return "NONE";
}

/** "2026-07-01" -> "2026-06-30" (matemática en UTC, cruza meses y años) */
function prevDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function computeStreak(
  valuesByDate: Map<string, number>,
  type: HabitType,
  target: number | null,
  today: string,
): Streak {
  // Gracia: si aún no registras hoy, la racha se cuenta desde ayer
  const anchor = valuesByDate.has(today) ? today : prevDay(today);

  const run = (strict: boolean): number => {
    let count = 0;
    let cursor = anchor;
    for (;;) {
      const level = dayLevel(valuesByDate.get(cursor), type, target);
      const ok = strict ? level === "PERFECT" : level !== "NONE";
      if (!ok) break;
      count++;
      cursor = prevDay(cursor);
    }
    return count;
  };

  const perfect = run(true);
  if (perfect >= 2) return { kind: "perfect", length: perfect };

  const soft = run(false);
  if (soft >= 2) return { kind: "soft", length: soft };

  return { kind: "none", length: 0 };
}
export function maxStreak(
  valuesByDate: Map<string, number>,
  type: HabitType,
  target: number | null,
): number {
  // Solo días perfectos, en orden cronológico.
  const perfectDays = [...valuesByDate.keys()]
    .filter((d) => dayLevel(valuesByDate.get(d), type, target) === "PERFECT")
    .sort();

  let best = 0;
  let current = 0;
  let prev: string | null = null;

  for (const day of perfectDays) {
    // Continúa el tramo solo si este día es el siguiente calendario al anterior.
    current = prev !== null && prevDay(day) === prev ? current + 1 : 1;
    if (current > best) best = current;
    prev = day;
  }

  return best;
}

/**
 * % de días perfectos sobre los días transcurridos del año.
 * `dayOfYear` = qué número de día del año es hoy PARA EL USUARIO (1..366);
 * lo calcula quien llama, con la zona horaria del usuario.
 */
export function completionRate(
  valuesByDate: Map<string, number>,
  type: HabitType,
  target: number | null,
  year: number,
  dayOfYear: number,
): number {
  const prefix = `${year}-`;
  const perfect = [...valuesByDate.keys()].filter(
    (d) => d.startsWith(prefix) && dayLevel(valuesByDate.get(d), type, target) === "PERFECT",
  ).length;

  if (dayOfYear <= 0) return 0;
  return Math.round((perfect / dayOfYear) * 100);
}