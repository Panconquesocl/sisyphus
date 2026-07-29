"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { isValidTimeZone } from "@/lib/dates";
import { HABIT_COLORS } from "@/lib/grid";
import { HABIT_ICON_NAMES } from "@/lib/habit-icons";

const CreateHabitSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(60),
  type: z.enum(["BINARY", "QUANTITY", "DURATION"]),
  target: z.coerce.number().int().positive().optional(),
  unit: z.string().trim().max(20).optional(),
  color: z.enum(HABIT_COLORS),
  icon: z.enum(HABIT_ICON_NAMES as [string, ...string[]]).nullable(),
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
    color: formData.get("color"),
    icon: formData.get("icon") || null,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { name, type, target, unit, color, icon } = parsed.data;
  const isBinary = type === "BINARY";

  await prisma.habit.create({
    data: {
      userId: user.id,
      name,
      type,
      target: isBinary ? null : target,
      unit: isBinary ? null : unit ?? null,
      color,
      icon,
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

export async function setHabitArchived(habitId: string, archived: boolean) {
  const user = await requireUser();

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: user.id },
  });
  if (!habit) throw new Error("Hábito no encontrado");

  await prisma.habit.update({
    where: { id: habitId },
    data: { archivedAt: archived ? new Date() : null },
  });

  revalidatePath("/");
}

const UpdateHabitSchema = z.object({
  habitId: z.string().min(1),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(60),
  target: z.coerce.number().int().positive().optional(),
  unit: z.string().trim().max(20).optional(),
  color: z.enum(HABIT_COLORS),
  icon: z.enum(HABIT_ICON_NAMES as [string, ...string[]]).nullable(),
});

export async function updateHabit(formData: FormData) {
  const user = await requireUser();

  const parsed = UpdateHabitSchema.safeParse({
    habitId: formData.get("habitId"),
    name: formData.get("name"),
    target: formData.get("target") || undefined,
    unit: formData.get("unit") || undefined,
    color: formData.get("color"),
    icon: formData.get("icon") || null,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

   const { habitId, name, target, unit, color, icon } = parsed.data;

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: user.id },
  });
  if (!habit) throw new Error("Hábito no encontrado");

  const isBinary = habit.type === "BINARY";
  if (!isBinary && !target) throw new Error("La meta es obligatoria para Cantidad/Duración");

  await prisma.habit.update({
    where: { id: habitId },
    data: {
      name,
      target: isBinary ? null : target,
      unit: isBinary ? null : unit ?? null,
      color,
      icon,
    },
  });

  revalidatePath("/");
}

const SetDayNoteSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  content: z.string().trim().max(1000, "La nota es demasiado larga"),
});

export async function setDayNote(date: string, content: string) {
  const user = await requireUser();

  const parsed = SetDayNoteSchema.safeParse({ date, content });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const day = new Date(`${parsed.data.date}T00:00:00Z`);
  const text = parsed.data.content;

  if (text.length === 0) {
    await prisma.dayNote.deleteMany({ where: { userId: user.id, date: day } });
  } else {
    await prisma.dayNote.upsert({
      where: { userId_date: { userId: user.id, date: day } },
      create: { userId: user.id, date: day, content: text },
      update: { content: text },
    });
  }

  revalidatePath("/");
}

const SetUserTimezoneSchema = z.object({
  timeZone: z.string().min(1).max(64),
});

export async function setUserTimezone(timeZone: string) {
  const user = await requireUser();

  const parsed = SetUserTimezoneSchema.safeParse({ timeZone });
  // Viene del cliente y corre en background: si es basura, ignoramos en silencio.
  if (!parsed.success || !isValidTimeZone(parsed.data.timeZone)) return;
  if (user.timezone === parsed.data.timeZone) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { timezone: parsed.data.timeZone },
  });

  revalidatePath("/");
}

export async function deleteHabit(habitId: string) {
  const user = await requireUser();

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: user.id },
  });
  if (!habit) throw new Error("Hábito no encontrado");

  await prisma.habit.delete({ where: { id: habitId } });

  revalidatePath("/");
}
