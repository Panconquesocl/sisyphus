import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Sisyphus</h1>
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button type="submit">Entrar con Google</button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Hola, {session.user.name}</h1>
      <p>{session.user.email}</p>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">Cerrar sesión</button>
      </form>
    </main>
  );
}