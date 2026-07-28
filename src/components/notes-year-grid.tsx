import { buildYearGrid, yearMonthLabels } from "@/lib/grid";
import { NoteCell } from "@/components/note-cell";

export function NotesYearGrid({
  year, notesByDate,
}: {
  year: number;
  notesByDate: Map<string, string>;
}) {
  // Solo necesitamos el layout del año: marcamos los días con nota con un 1.
  const marks = new Map([...notesByDate.keys()].map((d) => [d, 1] as const));
  const cells = buildYearGrid(year, marks);
  const labels = yearMonthLabels(cells);
  

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "11px", gap: 2 }}>
          {labels.map((l, i) => (
            <span key={i} className="text-[9px] text-muted-foreground"
                  style={{ whiteSpace: "nowrap", transform: "translateX(13px)" }}>
              {l}
            </span>
          ))}
        </div>
        <div style={{
          display: "grid", gridAutoFlow: "column",
          gridTemplateRows: "repeat(7, 11px)", gridAutoColumns: "11px", gap: 2,
        }}>
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} style={{ width: 11, height: 11 }} />;
            const content = notesByDate.get(cell.date);
            if (content === undefined) {
              // Día sin nota: gris "vacío", igual que las grillas de hábito.
              return <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: "var(--heat-0)" }} />;
            }
            return <NoteCell key={i} date={cell.date} content={content} />;
          })}
        </div>
      </div>
    </div>
  );
}