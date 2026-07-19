"use client";

import { createHabit } from "@/app/actions";
import { useState } from "react";

export function HabitForm() {
  const [type, setType] = useState("BINARY");
  const showTarget = type !== "BINARY";

  return (
    <form
      action={createHabit}
      style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
    >
      <input name="name" placeholder="Ej. Meditar" required />
      <select name="type" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="BINARY">Binario</option>
        <option value="QUANTITY">Cantidad</option>
        <option value="DURATION">Duración</option>
      </select>
      {showTarget && (
        <>
          <input name="target" type="number" min="1" placeholder="Meta (ej. 8)" required />
          <input name="unit" placeholder="Unidad (ej. vasos)" />
        </>
      )}
      <button type="submit">Crear</button>
    </form>
  );
}