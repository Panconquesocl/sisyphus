import { buildRangeGrid, rampFor, type HabitType } from "@/lib/grid";
import { GridCell } from "@/components/grid-cell";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function HabitGrid({
  habitId,
  startDate,
  endDate,
  type,
  target,
  unit,
  valuesByDate,
  color,
}: {
  habitId: string;
  startDate: string;
  endDate: string;
  type: HabitType;
  target: number | null;
  unit: string | null;
  valuesByDate: Map<string, number>;
  color: string;
}) {
  const cells = buildRangeGrid(startDate, endDate, valuesByDate);
  const ramp = rampFor(color);
  const months = cells.length < 40 ? 1 : 3;
  const cellPx = months === 1 ? 28 : 17;

  return (
    <div className="flex justify-start">
      <div
        style={{
          display: "grid",
          gridAutoFlow: months === 1 ? "row" : "column",
          ...(months === 1
            ? { gridTemplateColumns: `repeat(7, ${cellPx}px)` }
            : {
                gridTemplateRows: `repeat(7, ${cellPx}px)`,
                gridAutoColumns: `${cellPx}px`,
              }),
          gap: 3,
        }}
      >
        {WEEKDAYS.map((d, i) => (
          <span
            key={`wd-${i}`}
            className="flex items-center justify-center text-[9px] leading-none text-center text-muted-foreground"
            style={{ width: cellPx, height: cellPx }}
          >
            {d}
          </span>
        ))}

        {cells.map((cell, i) =>
          cell ? (
            <GridCell
              key={i}
              habitId={habitId}
              date={cell.date}
              value={cell.value}
              type={type}
              target={target}
              unit={unit}
              ramp={ramp}
              size={cellPx}
            />
          ) : (
            <div key={i} style={{ width: cellPx, height: cellPx }} />
          ),
        )}
      </div>
    </div>
  );
}