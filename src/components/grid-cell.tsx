"use client";

import { toggleEntry, setEntry } from "@/app/actions";
import { intensityLevel, LEVEL_COLORS, type HabitType } from "@/lib/grid";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";

type Props = {
  habitId: string;
  date: string;
  value: number | null;
  type: HabitType;
  target: number | null;
  unit: string | null;
};

export function GridCell({ habitId, date, value, type, target, unit }: Props) {
  const level = intensityLevel(value, type, target);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const cellStyle = { backgroundColor: LEVEL_COLORS[level], opacity: isPending ? 0.5 : 1 };
  const title = value ? `${date}: ${value}${unit ? " " + unit : ""}` : date;

  // Binario: click directo, sin popover
  if (type === "BINARY") {
    return (
      <button
        type="button"
        title={title}
        aria-label={title}
        disabled={isPending}
        onClick={() => startTransition(() => toggleEntry(habitId, date))}
        className="size-3.5 cursor-pointer rounded-[3px]"
        style={cellStyle}
      />
    );
  }

  // No-binario: popover con input
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        title={title}
        aria-label={title}
        className="size-3.5 cursor-pointer rounded-[3px]"
        style={cellStyle}
      />
      <PopoverContent align="start" className="w-52">
        <ValueEditor
          habitId={habitId}
          date={date}
          value={value}
          unit={unit}
          onDone={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

function ValueEditor({
  habitId,
  date,
  value,
  unit,
  onDone,
}: {
  habitId: string;
  date: string;
  value: number | null;
  unit: string | null;
  onDone: () => void;
}) {
  const [val, setVal] = useState(value ? String(value) : "");
  const [isPending, startTransition] = useTransition();

  function commit(n: number) {
    startTransition(() => setEntry(habitId, date, n));
    onDone();
  }

  function save() {
    const n = val.trim() === "" ? 0 : Number(val);
    if (Number.isNaN(n) || n < 0) return;
    commit(n);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{date}</p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          autoFocus
          className="h-8"
        />
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={isPending}>Guardar</Button>
        <Button size="sm" variant="outline" onClick={() => commit(0)} disabled={isPending}>
          Borrar
        </Button>
      </div>
    </div>
  );
}