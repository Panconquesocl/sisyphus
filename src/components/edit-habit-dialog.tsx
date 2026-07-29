"use client";

import { updateHabit } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HabitType } from "@/lib/grid";
import { normalizeColor } from "@/lib/grid";
import { ColorPicker } from "@/components/color-picker";
import { IconPicker } from "@/components/icon-picker";
import { useState, useTransition } from "react";

export function EditHabitDialog({
  habitId,
  name,
  type,
  target,
  unit,
  open,
  onOpenChange,
  color: colorProp,
  icon,
}: {
  habitId: string;
  name: string;
  type: HabitType;
  target: number | null;
  unit: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  color: string;
  icon: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [color, setColor] = useState<string>(normalizeColor(colorProp));
  const isBinary = type === "BINARY";

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateHabit(formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <div className="space-y-1.5">
            <span className="text-sm text-muted-foreground">Color</span>
            <ColorPicker name="color" value={color} onChange={setColor} />
          </div>
          <div className="space-y-1.5">
            <span className="text-sm text-muted-foreground">Ícono</span>
            <IconPicker name="icon" defaultValue={icon} color={color} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isPending}>Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
