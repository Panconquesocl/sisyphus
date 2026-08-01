import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { HabitGrid } from "@/components/habit-grid";
import { Card } from "@/components/ui/card";
import { StreakBadge } from "@/components/streak-badge";
import { ArchiveButton } from "@/components/archive-button";
import { DayNote } from "@/components/day-note";
import { requireUser } from "@/lib/auth-helpers";
import { TimezoneSync } from "@/components/timezone-sync";
import { dayInTimeZone, subMonths } from "@/lib/dates";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HabitCardMenu } from "@/components/habit-card-menu";
import { DeleteHabitButton } from "@/components/delete-habit-button";
import { HabitTodayControl } from "@/components/habit-today-control";
import { NewHabitDialog } from "@/components/new-habit-dialog";
import { LoginScreen } from "@/components/login-screen";
import { HabitIcon } from "@/components/habit-icon";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}){
  const session = await auth();

  if (!session?.user) {
    return <LoginScreen />;
  }
  const user = await requireUser();

  const habits = await prisma.habit.findMany({
    where: { userId: user.id, archivedAt: null },
    orderBy: { createdAt: "desc" },
    include: { entries: true },
  });

  const archivedHabits = await prisma.habit.findMany({
    where: { userId: user.id, archivedAt: { not: null } },
    orderBy: { archivedAt: "desc" },
  });

 // Ventana móvil que termina HOY (del usuario). "3m" = 3 meses atrás, si no 1.
  const { range } = await searchParams;
  const months = range === "3m" ? 3 : 1;

  const today = dayInTimeZone(new Date(), user.timezone); // "2026-07-20"
  const startDate = subMonths(today, months);

  // La ventana de notas se mantiene en UTC a propósito: cubre los 3 días
  // posibles y el cliente elige el suyo con useLocalToday().
  const DAY_MS = 86_400_000;
  const now = new Date();
  const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayNotes = await prisma.dayNote.findMany({
    where: {
      userId: user.id,
      date: { gte: new Date(utcToday - DAY_MS), lte: new Date(utcToday + DAY_MS) },
    },
  });

  return (
      <main
      className={cn(
        "mx-auto w-full p-6 md:p-10",
        months === 3 ? "max-w-[738px]" : "max-w-[828px]",
      )}
      >
      <TimezoneSync stored={user.timezone} />

        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Hola, {session.user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground first-letter:uppercase">
            {now.toLocaleDateString("es-CL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: user.timezone ?? "UTC",
            })}
          </p>
        </header>

        <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Nota de hoy
        </h2>
        <DayNote notes={dayNotes.map((n) => [n.date.toISOString().slice(0, 10), n.content])} />
        </section>
          
         {habits.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Hoy
          </h2>
          <div className="flex flex-col gap-2">
            {habits.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
                 <span className="flex flex-1 items-center gap-2 text-sm font-medium">
                  <HabitIcon icon={h.icon} color={h.color} className="size-4 shrink-0" />
                  <span>
                    {h.name}
                    {h.target ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        meta {h.target}{h.unit ? ` ${h.unit}` : ""}
                      </span>
                    ) : null}
                  </span>
                </span>
                <HabitTodayControl
                  habitId={h.id}
                  type={h.type}
                  unit={h.unit}
                  entries={h.entries.map((e) => [e.date.toISOString().slice(0, 10), e.value])}
                />
              </div>
            ))}
          </div>
        </section>
      )}
      
      <section>
          <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Tus hábitos
          </h2>
          {habits.length !== 0 && 
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border p-0.5 text-xs">
              <Link
                href="/?range=1m"
                className={cn(
                  "rounded px-2 py-1",
                  months === 1 ? "bg-muted font-medium" : "text-muted-foreground",
                )}
              >
                1 mes
              </Link>
              <Link
                href="/?range=3m"
                className={cn(
                  "rounded px-2 py-1",
                  months === 3 ? "bg-muted font-medium" : "text-muted-foreground",
                )}
              >
                3 meses
              </Link>
            </div>
            
            <NewHabitDialog/>
          </div>}
        </div>
        {habits.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-2xl">
              🪨
            </div>
            <div className="space-y-1">
              <p className="font-medium">Aún no tienes hábitos</p>
              <p className="text-sm text-muted-foreground">
                Crea el primero y empieza a empujar la piedra.
              </p>
            </div>
            <NewHabitDialog />
          </div>
        ) : (
         <div className={cn( "grid gap-4", months === 3 ? " xl:grid-cols-2" : "[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]",)}>
            {habits.map((h) => {
              const valuesByDate = new Map(
                h.entries.map((e) => [e.date.toISOString().slice(0, 10), e.value] as const),
              );
              return (
                <Card key={h.id} className="p-3">
                  
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex flex-1 items-center gap-2 font-medium">
                    <HabitIcon icon={h.icon} color={h.color} className="size-4 shrink-0" />
                    <span>
                      <Link href={`/habits/${h.id}`} className="hover:underline">
                        {h.name}
                    </Link>
                      {h.target ? (
                        <span className="ml-2 text-sm text-muted-foreground">
                          meta {h.target}{h.unit ? ` ${h.unit}` : ""}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <StreakBadge entries={[...valuesByDate]} type={h.type} target={h.target} />
                    <HabitCardMenu
                      habitId={h.id}
                      name={h.name}
                      type={h.type}
                      target={h.target}
                      unit={h.unit}
                      color={h.color}
                      icon={h.icon}
                    />
                  </div>
                  <div className={cn(months === 1 ? "mx-auto" : "")}>
                    <HabitGrid
                      habitId={h.id}
                      startDate={startDate}
                      endDate={today}
                      type={h.type}
                      target={h.target}
                      unit={h.unit}
                      valuesByDate={valuesByDate}
                      color={h.color}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        {archivedHabits.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Archivados
          </h2>
          <div className="flex flex-col gap-2">
            {archivedHabits.map((h) => (
                <div
                key={h.id}
                className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                <span className="flex-1">{h.name}</span>
                <ArchiveButton habitId={h.id} archived={true} />
                <DeleteHabitButton habitId={h.id} name={h.name} />
              </div>
            ))}
          </div>
        </div>
        )}
      </section>
    </main>
  );
}