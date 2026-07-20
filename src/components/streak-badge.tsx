"use client";

import { computeStreak } from "@/lib/streaks";
import type { HabitType } from "@/lib/grid";
import { useLocalToday } from "@/lib/use-local-today";

export function StreakBadge({
  entries,
  type,
  target,
}: {
  entries: [string, number][];
  type: HabitType;
  target: number | null;
}) {
  const today = useLocalToday();

  if (!today) return null;

  const streak = computeStreak(new Map(entries), type, target, today);
  if (streak.kind === "none") return null;

  const isPerfect = streak.kind === "perfect";

  return (
    <span
      title={isPerfect ? "Racha perfecta" : "Racha suave"}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isPerfect
          ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {isPerfect ? "⭐" : "🔥"} {streak.length}
    </span>
  );
}