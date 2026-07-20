"use client";

import { setDayNote } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useEffect, useState, useTransition } from "react";

export function DayNote({ notes }: { notes: [string, string][] }) {
  const [today, setToday] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const t = new Date().toLocaleDateString("en-CA");
    const initial = new Map(notes).get(t) ?? "";
    setToday(t);
    setContent(initial);
    setSaved(initial);
    // notes cambia de identidad en cada render del servidor; solo queremos
    // inicializar una vez, al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = content !== saved;

  function handleSave() {
    if (!today) return;
    startTransition(async () => {
      await setDayNote(today, content);
      setSaved(content);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
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