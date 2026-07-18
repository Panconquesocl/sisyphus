import { buildMonthGrid } from "@/lib/grid";
import { GridCell } from "@/components/grid-cell";

export function HabitGrid({
  habitId,
  year,
  month,
  entryDates,
}: {
  habitId: string;
  year: number;
  month: number;
  entryDates: string[];
}) {
  const cells = buildMonthGrid(year, month, new Set(entryDates));

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
          <GridCell key={i} habitId={habitId} date={cell.date} done={cell.done} />
        ) : (
          <div key={i} style={{ width: 14, height: 14 }} />
        )
      )}
    </div>
  );
}