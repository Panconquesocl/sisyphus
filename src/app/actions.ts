"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

const CreateHabitSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(60),
  type: z.enum(["BINARY", "QUANTITY", "DURATION"]),
});

export async function createHabit(formData: FormData) {
  const user = await requireUser();

  const parsed = CreateHabitSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  await prisma.habit.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
    },
  });

  revalidatePath("/");
}

const ToggleEntrySchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
});

export async function toggleEntry(habitId: string, date: string) {
  const user = await requireUser();

  const parsed = ToggleEntrySchema.safeParse({ habitId, date });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  // Seguridad: el hábito TIENE que ser de este usuario
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: user.id },
  });
  if (!habit) throw new Error("Hábito no encontrado");

  // "2026-07-18" -> medianoche UTC -> se guarda solo el día en @db.Date
  const day = new Date(`${date}T00:00:00Z`);

  const existing = await prisma.habitEntry.findUnique({
    where: { habitId_date: { habitId, date: day } },
  });

  if (existing) {
    await prisma.habitEntry.delete({ where: { id: existing.id } });
  } else {
    await prisma.habitEntry.create({ data: { habitId, date: day, value: 1 } });
  }

  revalidatePath("/");
}