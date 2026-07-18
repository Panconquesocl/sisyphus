"use client";

import { toggleEntry } from "@/app/actions";
import { useEffect, useState, useTransition } from "react";

function localToday() {
  return new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" en la zona del navegador
}

export function HabitTodayToggle({
  habitId,
  entryDates,
}: {
  habitId: string;
  entryDates: string[];
}) {
  const [today, setToday] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setToday(localToday()), []);

  const doneToday = today ? entryDates.includes(today) : false;

  return (
    <button
      onClick={() => today && startTransition(() => toggleEntry(habitId, today))}
      disabled={isPending || !today}
>
      {doneToday ? "✓ Hecho hoy" : "Marcar hoy"}
    </button>
  );
}