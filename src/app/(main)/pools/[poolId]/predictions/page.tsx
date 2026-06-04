import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getUser, getPool, getParticipation } from "@/lib/supabase/queries";
import { PredictionsLoader } from "./predictions-loader";
import { PredictionsSkeleton } from "./predictions-skeleton";

export type ViewMode = "own-open" | "own-closed" | "viewing-other";

export default async function PredictionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ poolId: string }>;
  searchParams: Promise<{ player?: string }>;
}) {
  const { poolId } = await params;
  const { player: targetUserId } = await searchParams;
  const user = await getUser();
  if (!user) notFound();

  const [pool, participation] = await Promise.all([
    getPool(poolId),
    getParticipation(poolId, user.id),
  ]);

  if (!pool) notFound();

  const isAdmin = participation?.is_admin ?? false;
  const isPastDeadline = new Date(pool.deadline) < new Date();
  const viewingOther =
    !!targetUserId && targetUserId !== user.id && isPastDeadline;
  const viewMode: ViewMode = viewingOther
    ? "viewing-other"
    : isPastDeadline
      ? "own-closed"
      : "own-open";

  return (
    <div className="overflow-y-auto h-full">
      <Suspense fallback={<PredictionsSkeleton />}>
        <PredictionsLoader
          poolId={poolId}
          tournamentId={pool.tournament_id}
          viewMode={viewMode}
          currentUserId={user.id}
          targetUserId={viewingOther ? targetUserId : undefined}
          isAdmin={isAdmin}
        />
      </Suspense>
    </div>
  );
}
