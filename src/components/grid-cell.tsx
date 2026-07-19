"use client";

import { toggleEntry, setEntry } from "@/app/actions";
import { intensityLevel, LEVEL_COLORS, type HabitType } from "@/lib/grid";
import { useTransition } from "react";

export function GridCell({
  habitId,
  date,
  value,
  type,
  target,
}: {
  habitId: string;
  date: string;
  value: number | null;
  type: HabitType;
  target: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const level = intensityLevel(value, type, target);

  function handleClick() {
    if (type === "BINARY") {
      startTransition(() => toggleEntry(habitId, date));
    } else {
      const input = window.prompt(`${date} — ¿cuánto? (vacío = borrar)`, value ? String(value) : "");
      if (input === null) return; // canceló
      const n = input.trim() === "" ? 0 : Number(input);
      if (Number.isNaN(n) || n < 0) return;
      startTransition(() => setEntry(habitId, date, n));
    }
  }

  const title = value ? `${date}: ${value}` : date;

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={handleClick}
      disabled={isPending}
      style={{
        width: 14,
        height: 14,
        padding: 0,
        border: "none",
        borderRadius: 3,
        cursor: "pointer",
        background: LEVEL_COLORS[level],
        opacity: isPending ? 0.5 : 1,
      }}
    />
  );
}