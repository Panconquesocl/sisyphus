"use client";

import { createHabit } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function HabitForm() {
  const [type, setType] = useState("BINARY");
  const showTarget = type !== "BINARY";

  return (
    <form action={createHabit} className="flex flex-wrap items-center gap-2">
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
      <Button type="submit">Crear</Button>
    </form>
  );
}