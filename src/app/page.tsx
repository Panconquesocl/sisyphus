import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createHabit } from "@/app/actions";

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
  });

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
      <ul>
        {habits.map((h) => (
          <li key={h.id}>{h.name} — {h.type}</li>
        ))}
      </ul>
    </main>
  );
}