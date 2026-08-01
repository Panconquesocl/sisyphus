"use client";

import { toggleEntry, setEntry } from "@/app/actions";
import { intensityLevel, type HabitType } from "@/lib/grid";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  habitId: string;
  date: string; 
  value: number | null;
  type: HabitType;
  target: number | null;
  unit: string | null;
  ramp: string[];
  size: number;
};


export function GridCell({ habitId, date, value, type, target, unit, ramp , size}: Props) {
  const level = intensityLevel(value, type, target);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  
  const router = useRouter();
  const cellStyle = { backgroundColor: ramp[level], opacity: isPending ? 0.5 : 1, width: size, height: size };
  const title = value ? `${date}: ${value}${unit ? " " + unit : ""}` : date;
  
  // Binario: click directo, sin popover
  if (type === "BINARY") {
    return (
      <button
        type="button"
        title={title}
        aria-label={title}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await toggleEntry(habitId, date);
            router.refresh(); })}
        className={`cursor-pointer rounded-[3px]`}
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
        className={`cursor-pointer rounded-[3px]`}
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
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus({ preventScroll: true });
}, []);


  function commit(n: number) {
  onDone();                       // cierra el popover ya
  startTransition(async () => {
    await setEntry(habitId, date, n);
    router.refresh();
  });
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
        ref={inputRef}
        type="number"
        min="0"
        value={val}
        onChange={(e) => setVal(e.target.value)}
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