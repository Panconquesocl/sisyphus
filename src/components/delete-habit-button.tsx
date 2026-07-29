"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteHabit } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteHabitButton({ habitId, name }: { habitId: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger
        aria-label={`Eliminar ${name}`}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        <Trash2 className="size-4 text-destructive" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar «{name}»?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se borrarán el hábito y todo su
            historial de registros.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => startTransition(() => deleteHabit(habitId))}
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}