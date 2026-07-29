"use client";

import { useState } from "react";
import { HabitForm } from "@/components/habit-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NewHabitDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ size: "sm" })}>
        + Nuevo hábito
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo hábito</DialogTitle>
        </DialogHeader>
        <HabitForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}