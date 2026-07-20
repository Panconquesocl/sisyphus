"use client";

import { setDayNote } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocalToday } from "@/lib/use-local-today";
import { useState, useTransition } from "react";

export function DayNote({ notes }: { notes: [string, string][] }) {
  const today = useLocalToday();
  const [draft, setDraft] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Lo que el servidor tiene para el día local del usuario.
  const saved = today ? new Map(notes).get(today) ?? "" : "";
  // draft === null significa "el usuario no ha tocado nada": seguimos al servidor.
  const content = draft ?? saved;
  const dirty = draft !== null && draft !== saved;

  function handleSave() {
    if (!today || draft === null) return;
    startTransition(async () => {
      await setDayNote(today, draft);
      setDraft(null); // soltamos el borrador y volvemos a seguir al servidor
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={content}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="¿Cómo te fue hoy?"
        maxLength={1000}
        rows={3}
        disabled={!today || isPending}
      />
      <div className="flex items-center gap-3">
        <Button type="button" size="sm" onClick={handleSave} disabled={!dirty || isPending}>
          {isPending ? "Guardando…" : "Guardar"}
        </Button>
        {!dirty && saved !== "" && (
          <span className="text-xs text-muted-foreground">Guardado</span>
        )}
      </div>
    </div>
  );
}