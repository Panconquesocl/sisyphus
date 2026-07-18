import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createHabit } from "@/app/actions";
import { HabitTodayToggle } from "@/components/habit-today-toggle";
import { HabitGrid } from "@/components/habit-grid";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Sisyphus</h1>
        <form action={async () => { "use server"; await signIn("google"); }}>
          <button type="submit">Entrar con Google</button>
        </form>
      </main>
    );
  }

  const habits = await prisma.habit.findMany({
    where: { user: { email: session.user.email! } },
    orderBy: { createdAt: "desc" },
    include: { entries: true },
  });

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  return (
    <main style={{ padding: 40, maxWidth: 480 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Hola, {session.user.name}</h1>
        <form action={async () => { "use server"; await signOut(); }}>
          <button type="submit">Salir</button>
        </form>
      </div>

      <h2>Nuevo hábito</h2>
      <form action={createHabit} style={{ display: "flex", gap: 8 }}>
        <input name="name" placeholder="Ej. Meditar" required />
        <select name="type" defaultValue="BINARY">
          <option value="BINARY">Binario</option>
          <option value="QUANTITY">Cantidad</option>
          <option value="DURATION">Duración</option>
        </select>
        <button type="submit">Crear</button>
      </form>

      <h2>Tus hábitos</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 20 }}>
        {habits.map((h) => {
          const entryDates = h.entries.map((e) => e.date.toISOString().slice(0, 10));
          return (
            <li key={h.id}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                <span style={{ flex: 1 }}>{h.name} — {h.type} </span>
                <HabitTodayToggle habitId={h.id} entryDates={entryDates} />
              </div>
              <HabitGrid habitId={h.id} year={year} month={month} entryDates={entryDates} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}