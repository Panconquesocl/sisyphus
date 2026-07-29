"use client";

import { toggleEntry, setEntry } from "@/app/actions";
import { useLocalToday } from "@/lib/use-local-today";
import type { HabitType } from "@/lib/grid";
import { useOptimistic, useTransition } from "react";

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
  const [  , startTransition] = useTransition();
  const serverValue = today ? new Map(entries).get(today) ?? 0 : 0;
  const [value, setOptimistic] = useOptimistic(serverValue);
  const disabled = today === null;


  if (type === "BINARY") {
    const done = value > 0;
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          today && startTransition(async () => {
            setOptimistic(value > 0 ? 0 : 1);
            await toggleEntry(habitId, today);
      })
    }
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
  const commit = (next: number) => {
    if (!today) return;
    const clamped = Math.max(0, next);
    startTransition(async () => {
      setOptimistic(clamped);
      await setEntry(habitId, today, clamped);
    });
  };
  return (
    <div className="inline-flex items-center gap-2 rounded-full border p-0.5 text-sm">
      <button
        type="button"
        disabled={disabled || value <= 0}
       onClick={() => commit(value - 1)}
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
        disabled={disabled}
        onClick={() => commit(value + 1)}
        aria-label="Sumar"
        className="grid size-6 place-items-center rounded-full hover:bg-accent disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
