"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

const CreateHabitSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(60),
  type: z.enum(["BINARY", "QUANTITY", "DURATION"]),
  target: z.coerce.number().int().positive().optional(),
  unit: z.string().trim().max(20).optional(),
})
.refine((d) => d.type === "BINARY" || (d.target ?? 0) > 0, {
    message: "La meta es obligatoria para Cantidad/Duración",
    path: ["target"],
});

export async function createHabit(formData: FormData) {
  const user = await requireUser();

  const parsed = CreateHabitSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    target: formData.get("target") || undefined,
    unit: formData.get("unit") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { name, type, target, unit } = parsed.data;
  const isBinary = type === "BINARY";

  await prisma.habit.create({
    data: {
      userId: user.id,
      name,
      type,
      target: isBinary ? null : target,
      unit: isBinary ? null : unit ?? null,
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

const SetEntrySchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  value: z.coerce.number().int().min(0),
});

export async function setEntry(habitId: string, date: string, value: number) {
  const user = await requireUser();

  const parsed = SetEntrySchema.safeParse({ habitId, date, value });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId: user.id } });
  if (!habit) throw new Error("Hábito no encontrado");

  const day = new Date(`${date}T00:00:00Z`);
  const v = parsed.data.value;

  if (v <= 0) {
    await prisma.habitEntry.deleteMany({ where: { habitId, date: day } });
  } else {
    await prisma.habitEntry.upsert({
      where: { habitId_date: { habitId, date: day } },
      create: { habitId, date: day, value: v },
      update: { value: v },
    });
  }

  revalidatePath("/");
}