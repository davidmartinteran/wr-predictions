import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CodeForm } from "./code-form";

export default function WelcomePage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10 lg:py-16">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Trophy className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Bienvenido a la Porra del Mundial
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Empieza creando tu porra o únete con un código.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <h2 className="text-base font-semibold">Crear nueva porra</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Te conviertes en admin y compartes el código con tu grupo.
          </p>
          <Link
            href="/pools/new"
            className={buttonVariants({
              className: "mt-5 w-full justify-center h-11",
            })}
          >
            <Plus className="h-4 w-4" /> Crear porra
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <h2 className="text-base font-semibold">
            Tengo un código de invitación
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pega aquí el código que te ha pasado el admin del grupo.
          </p>
          <div className="mt-5">
            <CodeForm />
          </div>
        </div>
      </div>
    </main>
  );
}
