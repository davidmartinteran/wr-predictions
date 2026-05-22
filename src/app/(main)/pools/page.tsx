import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Trophy, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";

export default async function PoolsListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: participations } = await supabase
    .from("participations")
    .select("pool_id, display_name, is_admin, joined_at, pools(id, name, status, deadline, invite_code, tournament_id)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  type Row = {
    pool_id: string;
    is_admin: boolean;
    pools: {
      id: string;
      name: string;
      status: string;
      deadline: string;
      invite_code: string;
    } | null;
  };

  const rows = (participations as unknown as Row[] | null) ?? [];

  const counts: Record<string, number> = {};
  if (rows.length > 0) {
    const poolIds = rows.map((r) => r.pool_id);
    const { data: allParts } = await supabase
      .from("participations")
      .select("pool_id")
      .in("pool_id", poolIds);
    for (const p of allParts ?? []) {
      counts[p.pool_id] = (counts[p.pool_id] ?? 0) + 1;
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 lg:py-12">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis porras</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length === 0
              ? "Aún no perteneces a ninguna porra"
              : `${rows.length} porra${rows.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link href="/pools/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" /> Crear porra
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-8 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <h2 className="mt-4 text-base font-semibold">Empieza tu primera porra</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea una porra y comparte el código de invitación con tu grupo.
          </p>
          <Link href="/pools/new" className={buttonVariants({ className: "mt-6" })}>
            Crear porra
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) =>
            r.pools ? (
              <li key={r.pool_id}>
                <Link
                  href={`/pools/${r.pool_id}/predictions`}
                  className="block rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold truncate">{r.pools.name}</h3>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {counts[r.pool_id] ?? 1}
                        </span>
                        <span className="uppercase tracking-wider">{r.pools.status}</span>
                        {r.is_admin && (
                          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Código</div>
                      <div className="mt-0.5 font-mono text-xs text-zinc-300">{r.pools.invite_code}</div>
                    </div>
                  </div>
                </Link>
              </li>
            ) : null
          )}
        </ul>
      )}
    </main>
  );
}
