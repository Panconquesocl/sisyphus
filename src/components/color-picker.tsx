"use client";

import { HABIT_COLORS, rampFor } from "@/lib/grid";
import { cn } from "@/lib/utils";
export function ColorPicker({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input type="hidden" name={name} value={value} />
      {HABIT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Color ${c}`}
          onClick={() => onChange(c)}
          className={cn(
            "size-6 rounded-full ring-offset-2 ring-offset-background transition-shadow",
            value === c ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-border",
          )}
          style={{ background: rampFor(c)[2] }}
        />
      ))}
    </div>
  );
}