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
    <div className="flex flex-col h-dvh">
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
