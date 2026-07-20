/**
 * Fecha local del navegador como "YYYY-MM-DD".
 * Usamos el locale en-CA porque formatea ISO (YYYY-MM-DD). NO sirve toISOString():
 * convierte a UTC y perdería el día local, que es justo lo que queremos capturar.
 */
export function localToday(): string {
  return new Date().toLocaleDateString("en-CA");
}