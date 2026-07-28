import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";


export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Sisyphus
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <>
               <Link
                href="/my-year"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden items-center gap-1.5 lg:inline-flex",
                )}
                >
                <CalendarDays className="size-4" />
                Mi año
              </Link>
            </>
          )}
          <ThemeToggle />
          {user && (
            <form action={async () => { "use server"; await signOut(); }}>
              <Button type="submit" variant="outline" size="sm">Salir</Button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}