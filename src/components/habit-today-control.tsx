"use client";

import { toggleEntry, setEntry } from "@/app/actions";
import { useLocalToday } from "@/lib/use-local-today";
import type { HabitType } from "@/lib/grid";
import { useTransition } from "react";

export function HabitTodayControl({
  habitId,
  type,
  unit,
  entries,
}: {
  habitId: string;
  type: HabitType;
  unit: string | null;
  entries: [string, number][];
}) {
  const today = useLocalToday();
  const [isPending, startTransition] = useTransition();

  // Valor de HOY (0 si no hay entrada). `today` es null en SSR/hidratación.
  const value = today ? new Map(entries).get(today) ?? 0 : 0;
  const ready = today !== null && !isPending;

  if (type === "BINARY") {
    const done = value > 0;
    return (
      <button
        type="button"
        disabled={!ready}
        onClick={() => today && startTransition(() => toggleEntry(habitId, today))}
        aria-label={done ? "Marcado hoy" : "Marcar hoy"}
        className={`grid size-7 place-items-center rounded-full border text-sm transition-colors disabled:opacity-50 ${
          done
            ? "border-transparent bg-primary text-primary-foreground"
            : "border-input text-muted-foreground hover:bg-accent"
        }`}
      >
        {done ? "✓" : "○"}
      </button>
    );
  }

  // Cantidad / Duración → stepper
  const change = (delta: number) =>
    today && startTransition(() => setEntry(habitId, today, Math.max(0, value + delta)));

  return (
    <div className="inline-flex items-center gap-2 rounded-full border p-0.5 text-sm">
      <button
        type="button"
        disabled={!ready || value <= 0}
        onClick={() => change(-1)}
        aria-label="Restar"
        className="grid size-6 place-items-center rounded-full hover:bg-accent disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-10 text-center tabular-nums">
        {value}
        {unit ? <span className="text-muted-foreground"> {unit}</span> : null}
      </span>
      <button
        type="button"
        disabled={!ready}
        onClick={() => change(1)}
        aria-label="Sumar"
        className="grid size-6 place-items-center rounded-full hover:bg-accent disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
