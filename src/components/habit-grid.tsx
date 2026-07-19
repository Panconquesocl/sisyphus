import { buildMonthGrid, type HabitType } from "@/lib/grid";
import { GridCell } from "@/components/grid-cell";

export function HabitGrid({
  habitId,
  year,
  month,
  type,
  target,
  valuesByDate,
}: {
  habitId: string;
  year: number;
  month: number;
  type: HabitType;
  target: number | null;
  valuesByDate: Map<string, number>;
}) {
  const cells = buildMonthGrid(year, month, valuesByDate);

  return (
    <div
      style={{
        display: "grid",
        gridAutoFlow: "column",
        gridTemplateRows: "repeat(7, 14px)",
        gridAutoColumns: "14px",
        gap: 3,
      }}
    >
      {cells.map((cell, i) =>
        cell ? (
          <GridCell
            key={i}
            habitId={habitId}
            date={cell.date}
            value={cell.value}
            type={type}
            target={target}
          />
        ) : (
          <div key={i} style={{ width: 14, height: 14 }} />
        ),
      )}
    </div>
  );
}
