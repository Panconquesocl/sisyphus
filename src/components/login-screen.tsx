import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export function LoginScreen() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-3xl shadow-sm">
        🪨
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Sisyphus</h1>
        <p className="text-balance text-muted-foreground">
          Empuja la piedra un día más. Registra tus hábitos y construye tu racha.
        </p>
      </div>
      <form action={async () => { "use server"; await signIn("google"); }} className="w-full">
        <Button type="submit" size="lg" className="w-full">
          Entrar con Google
        </Button>
      </form>
    </main>
  );
}