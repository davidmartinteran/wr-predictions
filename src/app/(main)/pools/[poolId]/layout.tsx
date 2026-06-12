import { notFound } from "next/navigation";
import { getUser, getPool, getParticipation, getParticipantCount } from "@/lib/supabase/queries";
import { TopBar } from "@/components/top-bar";

export default async function PoolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ poolId: string }>;
}) {
  const { poolId } = await params;
  const user = await getUser();
  if (!user) notFound();

  const [participation, pool, participantCount] = await Promise.all([
    getParticipation(poolId, user.id),
    getPool(poolId),
    getParticipantCount(poolId),
  ]);

  if (!participation) notFound();
  if (!pool) notFound();

  return (
    // fixed inset-0 (no h-dvh): en el WebView de Android (PWA standalone) la
    // unidad dvh se queda obsoleta tras la navegacion client-side y el
    // contenedor (que persiste entre pestañas) mantiene una altura erronea,
    // empujando la clasificacion bajo el nav. fixed inset-0 ancla el shell a
    // los bordes del viewport en cada reflow, inmune a esa obsolescencia.
    // pt = status bar; el pb-safe-bottom va en <main>.
    <div className="fixed inset-0 flex flex-col pt-[env(safe-area-inset-top)]">
      <TopBar
        poolId={poolId}
        poolName={pool.name}
        participantCount={participantCount}
        displayName={participation.display_name}
      />
      <main className="flex flex-col flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
