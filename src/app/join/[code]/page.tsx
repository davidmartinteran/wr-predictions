import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { JoinForm } from "./join-form";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/join/${code}`)}`);
  }

  const { data: pool } = await supabase
    .rpc("pool_lookup_by_invite_code", { p_code: code })
    .maybeSingle();

  if (!pool) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <Trophy className="mx-auto h-10 w-10 text-muted-foreground/60" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Código no válido</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          El enlace de invitación no existe o ha sido revocado.
        </p>
        <Link
          href="/pools"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a mis porras
        </Link>
      </main>
    );
  }

  const { data: existing } = await supabase
    .from("participations")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("pool_id", pool.id)
    .maybeSingle();

  if (existing) {
    redirect(`/pools/${pool.id}/predictions`);
  }

  const defaultDisplay = user.email?.split("@")[0] ?? "";

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{pool.name}</h1>
            <p className="text-xs text-muted-foreground">
              {pool.participant_count} {pool.participant_count === 1 ? "jugador" : "jugadores"}
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Te han invitado a esta porra. Elige el nombre con el que te verán los demás (público dentro del grupo).
        </p>

        <div className="mt-6">
          <JoinForm inviteCode={code} defaultDisplayName={defaultDisplay} />
        </div>
      </div>
    </main>
  );
}
