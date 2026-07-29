"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { HABIT_ICONS, HABIT_ICON_NAMES } from "@/lib/habit-icons";
import { cn } from "@/lib/utils";
import { rampFor } from "@/lib/grid";

export function IconPicker({
  name,
  defaultValue = "",
  color = "black",
}: {
  name: string;
  defaultValue?: string | null;
  color: string;
}) {
  const [selected, setSelected] = useState(defaultValue ?? "");

  const cell = (active: boolean) =>
    cn(
      "grid size-8 place-items-center rounded-md border",
      active ? "border-foreground bg-accent" : "border-transparent hover:bg-accent",
    );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name={name} value={selected} />

      {/* Sin ícono */}
      <button type="button" aria-label="Sin ícono" onClick={() => setSelected("")}
        className={cn(cell(selected === ""), "text-muted-foreground")}>
        <Ban className="size-4" />
      </button>

      {HABIT_ICON_NAMES.map((iconName) => {
        const Icon = HABIT_ICONS[iconName];
        return (
          <button key={iconName} type="button" aria-label={iconName}
            onClick={() => setSelected(iconName)} className={cell(selected === iconName)}>
            <Icon className="size-4" style={{ color: rampFor(color)[4], fill: rampFor(color)[4] }} />
          </button>
        );
      })}
    </div>
  );
}