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