import { buildMonthGrid, type HabitType } from "@/lib/grid";
import { GridCell } from "@/components/grid-cell";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function HabitGrid({
  habitId, year, month, type, target, unit, valuesByDate,
}: {
  habitId: string;
  year: number;
  month: number;
  type: HabitType;
  target: number | null;
  unit: string | null;
  valuesByDate: Map<string, number>;
}) {
  const cells = buildMonthGrid(year, month, valuesByDate);

  return (
    <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 14px)", gridAutoColumns: "14px", gap: 3 }}>
            {WEEKDAYS.map((d, i) => (
        <span key={`wd-${i}`} className="text-[9px] leading-[14px] text-center text-muted-foreground">
          {d}
        </span>
      ))}
      {cells.map((cell, i) =>
        cell ? (
          <GridCell key={i} habitId={habitId} date={cell.date} value={cell.value} type={type} target={target} unit={unit} />
        ) : (
          <div key={i} style={{ width: 14, height: 14 }} />
        ),
      )}
    </div>
  );
}