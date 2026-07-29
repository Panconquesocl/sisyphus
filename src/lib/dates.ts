/**
 * Fecha local del navegador como "YYYY-MM-DD".
 * Usamos el locale en-CA porque formatea ISO (YYYY-MM-DD). NO sirve toISOString():
 * convierte a UTC y perdería el día local, que es justo lo que queremos capturar.
 */
export function localToday(): string {
  return new Date().toLocaleDateString("en-CA");
}
export const DEFAULT_TIME_ZONE = "UTC";

/**
 * Día "YYYY-MM-DD" al que pertenece un instante en una zona horaria dada.
 * `null` (usuario que aún no reportó su zona) se trata como UTC.
 */
export function dayInTimeZone(instant: Date, timeZone: string | null): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone ?? DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/**
 * Año y mes del día actual en una zona horaria.
 * OJO: `month` va 0-indexado, para calzar con Date y con buildMonthGrid.
 */
export function monthInTimeZone(instant: Date, timeZone: string | null) {
  const [year, month] = dayInTimeZone(instant, timeZone).split("-").map(Number);
  return { year, month: month - 1 };
}

/** Valida un nombre IANA. Intl lanza RangeError si no lo reconoce. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resta n meses a una fecha "YYYY-MM-DD" (matemática UTC).
 * Nota: en días 29-31, si el mes destino es más corto, JS ajusta al mes siguiente
 * (ej. 31-jul − 1 mes → 01-jul). Aceptable para una ventana visual.
 */
export function subMonths(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - n);
  return d.toISOString().slice(0, 10);
}