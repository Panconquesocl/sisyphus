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
        months === 3 ? "max-w-[616px]" : "max-w-[832px]",
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

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Hoy
          </h2>
          <div className="flex flex-col gap-2">
            {habits.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
                <span className="flex-1 text-sm font-medium">
                  {h.name}
                  {h.target ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      meta {h.target}{h.unit ? ` ${h.unit}` : ""}
                    </span>
                  ) : null}
                </span>
                <HabitTodayControl
                  habitId={h.id}
                  type={h.type}
                  unit={h.unit}
                  entries={h.entries.map((e) => [e.date.toISOString().slice(0, 10), e.value])}
                />
              </div>
            ))}
            {habits.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Crea un hábito para empezar a registrar.
              </p>
            )}
          </div>
        </section>

        
      
      <section>
          <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Tus hábitos
          </h2>
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

          </div>
        </div>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
          {habits.map((h) => {
            const valuesByDate = new Map(
              h.entries.map((e) => [e.date.toISOString().slice(0, 10), e.value] as const),
            );
            return (
                <Card key={h.id} className="p-3">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex-1 font-medium">
                    {h.name}
                    {h.target ? (
                      <span className="ml-2 text-sm text-muted-foreground">
                        meta {h.target}{h.unit ? ` ${h.unit}` : ""}
                      </span>
                    ) : null}
                  </span>
                  <StreakBadge entries={[...valuesByDate]} type={h.type} target={h.target} />
                  <HabitCardMenu
                    habitId={h.id}
                    name={h.name}
                    type={h.type}
                    target={h.target}
                    unit={h.unit}
                  />
                </div>
                 <HabitGrid
                  habitId={h.id}
                  startDate={startDate}
                  endDate={today}
                  type={h.type}
                  target={h.target}
                  unit={h.unit}
                  valuesByDate={valuesByDate}
                />
              </Card>
            );
          })}
          {habits.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aún no tienes hábitos. Crea el primero arriba.
            </p>
          )}
        </div>
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