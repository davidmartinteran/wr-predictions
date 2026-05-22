import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewPoolForm } from "./new-pool-form";

export default async function NewPoolPage() {
  const supabase = await createClient();
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name, code, starts_at")
    .order("starts_at");

  const opts = (tournaments ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    starts_at: t.starts_at,
  }));

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 lg:py-12">
      <Link
        href="/pools"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Mis porras
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">Crear porra</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Serás el admin. Comparte el código de invitación con tu grupo.
      </p>

      <div className="mt-8 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
        <NewPoolForm tournaments={opts} />
      </div>
    </main>
  );
}
