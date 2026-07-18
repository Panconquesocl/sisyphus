export type DayCell = {date: string; done: boolean} | null; // null = relleno

const pad = (n: number) => String(n).padStart(2,"0");
const iso = (y:number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function buildMonthGrid(
    year: number,
    month: number, //0-11
    doneDates: Set<string>,   
): DayCell[] {
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    // día de la semana del 1°, con lunes = 0 ... domingo = 6
    const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    
    const cells: DayCell[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);   // relleno antes del día 1
    for (let d = 1; d <= daysInMonth; d++) {
        const date = iso(year, month, d);
        cells.push({ date, done: doneDates.has(date) });
    }
    while (cells.length % 7 !== 0) cells.push(null);           // relleno hasta completar la semana
    return cells;
}