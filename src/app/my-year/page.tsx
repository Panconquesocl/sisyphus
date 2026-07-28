import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { monthInTimeZone } from "@/lib/dates";
import { YearGrid } from "@/components/year-grid";
import { NotesYearGrid } from "@/components/notes-year-grid";

export default async function MyYear() {
  const user = await requireUser();
  
// El año es el del USUARIO, no el del servidor.
const { year } = monthInTimeZone(new Date(), user.timezone);

  const habits = await prisma.habit.findMany({
    where: { userId: user.id, archivedAt: null },
    orderBy: { createdAt: "desc" },
    include: { entries: true },
  });
   const notes = await prisma.dayNote.findMany({
    where: {
      userId: user.id,
      date: { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) },
    },
  });
  const notesByDate = new Map(
    notes.map((n) => [n.date.toISOString().slice(0, 10), n.content] as const),
  );

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-10">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Volver
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">Mi {year}</h1>

      <div className="mt-8 hidden flex-col gap-8 lg:flex">
        {habits.map((h) => {
          const valuesByDate = new Map(
            h.entries.map((e) => [e.date.toISOString().slice(0, 10), e.value] as const),
          );
          return (
            <section key={h.id}>
              <h2 className="mb-2 text-sm font-medium">
                <Link href={`/habits/${h.id}`} className="hover:underline">
                  {h.name}
                </Link>
              </h2>
              <YearGrid
                year={year}
                type={h.type}
                target={h.target}
                unit={h.unit}
                valuesByDate={valuesByDate}
              />
            </section>
          );
        })}
        {habits.length === 0 && (
          <p className="text-sm text-muted-foreground">Aún no tienes hábitos.</p>
        )}
       <section>
          <h2 className="mb-2 text-sm font-medium">Notas del año</h2>
          <NotesYearGrid year={year} notesByDate={notesByDate} />
        </section>
  
      </div>
        {/* Móvil: lista que lleva a cada detalle */}
      <div className="mt-8 flex flex-col gap-2 lg:hidden">
        <p className="text-sm text-muted-foreground">
          El resumen anual completo está pensado para pantallas grandes.
          Abre cada hábito para ver su año:
        </p>
        {habits.map((h) => (
          <Link
            key={h.id}
            href={`/habits/${h.id}`}
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            {h.name}
          </Link>
        ))}
      </div>
    </main>
  );
}