"use client";

import { toggleEntry } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {  useTransition } from "react";
import { useLocalToday } from "@/lib/use-local-today";

export function HabitTodayToggle({
  habitId,
  entryDates,
}: {
  habitId: string;
  entryDates: string[];
}) {
  const today = useLocalToday();
  const [isPending, startTransition] = useTransition();

  const doneToday = today ? entryDates.includes(today) : false;

  return (
    <Button
      type="button"
      size="sm"
      variant={doneToday ? "default" : "outline"}
      onClick={() => today && startTransition(() => toggleEntry(habitId, today))}
      disabled={isPending || !today}
    >
      {doneToday ? "✓ Hecho hoy" : "Marcar hoy"}
    </Button>
  );
}