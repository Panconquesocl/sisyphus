"use client";

import { createHabit } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { ColorPicker } from "@/components/color-picker";
import { IconPicker } from "@/components/icon-picker";

export function HabitForm({ onSuccess }: { onSuccess?: () => void }) {
  const [type, setType] = useState("BINARY");
  const [isPending, startTransition] = useTransition();
  const showTarget = type !== "BINARY";
  const [color, setColor] = useState("green");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createHabit(formData);
      onSuccess?.();
    });
  }
  return (
    <form action={handleSubmit} className="flex flex-wrap items-center gap-2">
      <Input name="name" placeholder="Ej. Meditar" required className="w-40" />
      <select
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="BINARY">Binario</option>
        <option value="QUANTITY">Cantidad</option>
        <option value="DURATION">Duración</option>
      </select>
      {showTarget && (
        <>
          <Input name="target" type="number" min="1" placeholder="Meta (ej. 8)" required className="w-28" />
          <Input name="unit" placeholder="Unidad" className="w-28" />
        </>
      )}
      <div className="space-y-1.5">
        <span className="text-sm text-muted-foreground">Color</span>
        <ColorPicker name="color" value={color} onChange={setColor} />
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Ícono</span>
          <IconPicker name="icon" color={color} />
        </div>
      </div>
      <Button type="submit" disabled={isPending}>Crear</Button>
    </form>
  );
}