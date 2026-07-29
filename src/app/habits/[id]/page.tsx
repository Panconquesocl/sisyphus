import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { dayInTimeZone } from "@/lib/dates";
import { computeStreak, maxStreak, completionRate } from "@/lib/streaks";
import { YearGrid } from "@/components/year-grid";

export default async function HabitDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  // Seguridad: el id viene de la URL. Filtramos por id Y userId.
  const habit = await prisma.habit.findFirst({
    where: { id, userId: user.id },
    include: { entries: true },
  });
  if (!habit) notFound();

  const valuesByDate = new Map(
    habit.entries.map((e) => [e.date.toISOString().slice(0, 10), e.value] as const),
  );

  // "Hoy" del usuario (no del servidor) → año en curso y día del año.
  const todayStr = dayInTimeZone(new Date(), user.timezone); // "2026-07-20"
  const [y, mo, da] = todayStr.split("-").map(Number);
  const year = y;
  const dayOfYear =
    Math.floor((Date.UTC(y, mo - 1, da) - Date.UTC(y, 0, 1)) / 86_400_000) + 1;

  const current = computeStreak(valuesByDate, habit.type, habit.target, todayStr);
  const max = maxStreak(valuesByDate, habit.type, habit.target);
  const rate = completionRate(valuesByDate, habit.type, habit.target, year, dayOfYear);
  const total = valuesByDate.size;

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Volver
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        {habit.name}
        {habit.target ? (
          <span className="ml-2 text-base font-normal text-muted-foreground">
            meta {habit.target}{habit.unit ? ` ${habit.unit}` : ""}
          </span>
        ) : null}
      </h1>

      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Racha actual" value={current.length} />
        <Metric label="Racha máxima" value={max} />
        <Metric label="Cumplimiento" value={`${rate}%`} />
        <Metric label="Días registrados" value={total} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {year}
        </h2>
        <YearGrid
          year={year}
          type={habit.type}
          target={habit.target}
          unit={habit.unit}
          valuesByDate={valuesByDate}
          color={habit.color}
        />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}