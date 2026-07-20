"use client";

import { updateHabit } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { HabitType } from "@/lib/grid";
import { useState, useTransition } from "react";

export function EditHabitDialog({
  habitId,
  name,
  type,
  target,
  unit,
}: {
  habitId: string;
  name: string;
  type: HabitType;
  target: number | null;
  unit: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isBinary = type === "BINARY";

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateHabit(formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "ghost", size: "sm" })}>
        Editar
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar hábito</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-3">
          <input type="hidden" name="habitId" value={habitId} />
          <Input name="name" defaultValue={name} required placeholder="Nombre" />
          {!isBinary && (
            <div className="flex gap-2">
              <Input
                name="target"
                type="number"
                min="1"
                defaultValue={target ?? ""}
                required
                placeholder="Meta"
              />
              <Input name="unit" defaultValue={unit ?? ""} placeholder="Unidad" />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}