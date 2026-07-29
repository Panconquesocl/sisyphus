"use client";

import { useState } from "react";
import { HABIT_COLORS, rampFor } from "@/lib/grid";
import { cn } from "@/lib/utils";

export function ColorPicker({
  name,
  defaultValue = "green",
}: {
  name: string;
  defaultValue?: string;
}) {
  // Normaliza: si viene un hex legacy (no es una clave válida), cae a "green".
  const initial = (HABIT_COLORS as readonly string[]).includes(defaultValue)
    ? defaultValue
    : "green";
  const [selected, setSelected] = useState(initial);

  return (
    <div className="flex items-center gap-2">
      <input type="hidden" name={name} value={selected} />
      {HABIT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Color ${c}`}
          onClick={() => setSelected(c)}
          className={cn(
            "size-6 rounded-full ring-offset-2 ring-offset-background transition-shadow",
            selected === c ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-border",
          )}
          style={{ background: rampFor(c)[2] }}
        />
      ))}
    </div>
  );
}