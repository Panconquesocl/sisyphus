import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-bold">No encontrado</h1>
      <Link href="/" className={buttonVariants()}>
        Volver al inicio
      </Link>
    </main>
  );
}