"use client";

import { toggleEntry } from "@/app/actions";
import { useTransition } from "react";

export function GridCell({
  habitId,
  date,
  done,
}: {
  habitId: string;
  date: string;
  done: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      title={date}
      aria-label={`${date}${done ? " (hecho)" : ""}`}
      onClick={() => startTransition(() => toggleEntry(habitId, date))}
      disabled={isPending}
      style={{
        width: 14,
        height: 14,
        padding: 0,
        border: "none",
        borderRadius: 3,
        cursor: "pointer",
        background: done ? "#3f7a34" : "#e5e7eb",
        opacity: isPending ? 0.5 : 1,
      }}
    />
  );
}