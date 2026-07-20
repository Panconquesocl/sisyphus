import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { HabitForm } from "@/components/habit-form";
import { HabitTodayToggle } from "@/components/habit-today-toggle";
import { HabitGrid } from "@/components/habit-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { StreakBadge } from "@/components/streak-badge";
import { ArchiveButton } from "@/components/archive-button";
import { EditHabitDialog } from "@/components/edit-habit-dialog";
import { DayNote } from "@/components/day-note";
import { requireUser } from "@/lib/auth-helpers";
import { monthInTimeZone } from "@/lib/dates";
import { TimezoneSync } from "@/components/timezone-sync";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-10 text-center">
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Sisyphus</h1>
        <p className="text-muted-foreground">Empuja la piedra un día más.</p>
        <form action={async () => { "use server"; await signIn("google"); }}>
          <Button type="submit">Entrar con Google</Button>
        </form>
      </main>
    );
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

  const now = new Date();

  // El mes de la grilla es el del USUARIO, no el del servidor.
  const { year, month } = monthInTimeZone(now, user.timezone);

  // La ventana de notas se mantiene en UTC a propósito: cubre los 3 días
  // posibles y el cliente elige el suyo con useLocalToday().
  const DAY_MS = 86_400_000;
  const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const dayNotes = await prisma.dayNote.findMany({
    where: {
      userId: user.id,
      date: { gte: new Date(utcToday - DAY_MS), lte: new Date(utcToday + DAY_MS) },
    },
  });

  return (
    <main className="mx-auto max-w-2xl p-6 md:p-10">
       <TimezoneSync stored={user.timezone} />
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sisyphus</h1>
          <p className="text-sm text-muted-foreground">Hola, {session.user.name}</p>
          {/* <p className="text-sm text-muted-foreground">
          {now.toLocaleDateString('es-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p> */}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={async () => { "use server"; await signOut(); }}>
            <Button type="submit" variant="outline" size="sm">Salir</Button>
          </form>
        </div>
      </header>
      <section className="mb-8">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Nota de hoy
      </h2>
      <DayNote notes={dayNotes.map((n) => [n.date.toISOString().slice(0, 10), n.content])} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Nuevo hábito
        </h2>
        <HabitForm />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Tus hábitos
        </h2>
        <div className="flex flex-col gap-4">
          {habits.map((h) => {
            const valuesByDate = new Map(
              h.entries.map((e) => [e.date.toISOString().slice(0, 10), e.value] as const),
            );
            const entryDates = [...valuesByDate.keys()];
            return (
              <Card key={h.id} className="p-4">
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
                  <EditHabitDialog
                    habitId={h.id}
                    name={h.name}
                    type={h.type}
                    target={h.target}
                    unit={h.unit}
                  />
                  <ArchiveButton habitId={h.id} archived={false} />    
                  {h.type === "BINARY" && (<HabitTodayToggle habitId={h.id} entryDates={entryDates} />)}

                </div>
                 <HabitGrid
                  habitId={h.id}
                  year={year}
                  month={month}
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
              </div>
            ))}
          </div>
        </div>
        )}
      </section>
    </main>
  );
}