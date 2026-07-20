"use client";

import { setHabitArchived } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export function ArchiveButton({
  habitId,
  archived,
}: {
  habitId: string;
  archived: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() => startTransition(() => setHabitArchived(habitId, !archived))}
    >
      {archived ? "Restaurar" : "Archivar"}
    </Button>
  );
}
