import { buildYearGrid, intensityLevel, LEVEL_COLORS, yearMonthLabels, type HabitType } from "@/lib/grid";

export function YearGrid({
  year, type, target, unit, valuesByDate,
}: {
  year: number;
  type: HabitType;
  target: number | null;
  unit: string | null;
  valuesByDate: Map<string, number>;
}) {
  const cells = buildYearGrid(year, valuesByDate);
  const labels = yearMonthLabels(cells);

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
        {/* Fila de meses: mismas columnas que la grilla */}
        <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "11px", gap: 2 }}>
          {labels.map((l, i) => (
            <span key={i} className="text-[9px] text-muted-foreground"
                  style={{ whiteSpace: "nowrap", transform: "translateX(13px)" }}>
              {l}
            </span>
          ))}
        </div>

        {/* La grilla */}
        <div style={{
          display: "grid", gridAutoFlow: "column",
          gridTemplateRows: "repeat(7, 11px)", gridAutoColumns: "11px", gap: 2,
        }}>
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} style={{ width: 11, height: 11 }} />;
            const level = intensityLevel(cell.value, type, target);
            const label = cell.value
              ? `${cell.date}: ${cell.value}${unit ? ` ${unit}` : ""}`
              : cell.date;
            return (
              <div key={i} title={label}
                   style={{ width: 11, height: 11, borderRadius: 2, background: LEVEL_COLORS[level] }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
