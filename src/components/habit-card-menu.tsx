"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { setHabitArchived } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { EditHabitDialog } from "@/components/edit-habit-dialog";
import type { HabitType } from "@/lib/grid";

export function HabitCardMenu({
  habitId, name, type, target, unit, color, icon,
}: {
  habitId: string;
  name: string;
  type: HabitType;
  target: number | null;
  unit: string | null;
  color: string;
  icon: string | null;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Acciones"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isPending}
            onClick={() => startTransition(() => setHabitArchived(habitId, true))}
          >
            Archivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hermano del menú, NO anidado: la clave de la opción A */}
      <EditHabitDialog
        habitId={habitId}
        name={name}
        type={type}
        target={target}
        unit={unit}
        open={editOpen}
        onOpenChange={setEditOpen}
        color={color}
        icon={icon}
      />
    </>
  );
}