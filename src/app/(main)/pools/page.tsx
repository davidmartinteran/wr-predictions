import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Trophy, Users, Ticket, List } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { CodeForm } from "@/app/(main)/welcome/code-form";
import { CopyCodeButton } from "@/components/copy-code-button";
import { PoolsBottomNav } from "./pools-bottom-nav";
import { SignOutButton } from "./sign-out-button";

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

  const firstPoolId = rows[0]?.pool_id;

  return (
    <div className="flex flex-col h-dvh">
      <header className="hidden lg:flex h-14 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur shrink-0 items-center px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <Trophy className="w-4 h-4 text-zinc-950" />
          </div>
          <div className="text-[13px] font-semibold text-zinc-50">Porra Mundial</div>
        </div>

        <nav className="ml-10 flex items-center gap-1">
          {firstPoolId && (
            <>
              <Link
                href={`/pools/${firstPoolId}/predictions`}
                className="px-3 py-1.5 text-[13px] rounded-md transition-colors text-zinc-400 hover:text-zinc-300"
              >
                Pronósticos
              </Link>
              <Link
                href={`/pools/${firstPoolId}/leaderboard`}
                className="px-3 py-1.5 text-[13px] rounded-md transition-colors text-zinc-400 hover:text-zinc-300"
              >
                Clasificación
              </Link>
            </>
          )}
          <span className="px-3 py-1.5 text-[13px] rounded-md bg-zinc-900 text-zinc-50 border border-zinc-800">
            Mis porras
          </span>
        </nav>
      </header>

      <main className="flex-1 pb-20 lg:pb-0 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:py-12">
          {rows.length > 0 && (
            <header className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Mis porras</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rows.length} porra{rows.length === 1 ? "" : "s"}
                </p>
              </div>
            </header>
          )}

          {rows.length === 0 ? (
            <>
              <div className="flex flex-col items-center text-center mb-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Trophy className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mt-4 text-xl font-bold tracking-tight">
                  Bienvenido a la Porra del Mundial
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Empieza creando tu porra o únete con un código.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
                  <h3 className="text-base font-semibold">Crear nueva porra</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Te conviertes en admin y compartes el código con tu grupo.
                  </p>
                  <Link
                    href="/pools/new"
                    className={buttonVariants({ className: "mt-5 w-full justify-center h-11" })}
                  >
                    <Plus className="h-4 w-4" /> Crear porra
                  </Link>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
                  <h3 className="text-base font-semibold">Tengo un código de invitación</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pega aquí el código que te ha pasado el admin del grupo.
                  </p>
                  <div className="mt-5">
                    <CodeForm />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
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
                          <CopyCodeButton code={r.pools.invite_code} />
                        </div>
                      </Link>
                    </li>
                  ) : null
                )}
              </ul>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/pools/new"
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Crear porra</div>
                    <div className="text-[11px] text-muted-foreground">Nueva porra como admin</div>
                  </div>
                </Link>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Unirme con código</span>
                  </div>
                  <CodeForm />
                </div>
              </div>
            </>
          )}
          <div className="mt-12 mb-4">
            <SignOutButton />
          </div>
        </div>
      </main>

      <PoolsBottomNav firstPoolId={firstPoolId} />
    </div>
  );
}
