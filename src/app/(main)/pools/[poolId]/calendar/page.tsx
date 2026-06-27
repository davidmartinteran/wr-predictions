import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getUser, getPool, getParticipation } from "@/lib/supabase/queries";
import { CalendarLoader } from "./calendar-loader";

function CalendarSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-3 p-4 animate-pulse">
      <div className="h-6 w-32 bg-zinc-800 rounded" />
      <div className="h-10 w-full bg-zinc-800/60 rounded-lg" />
      <div className="h-5 w-48 bg-zinc-800 rounded mt-2" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl" />
      ))}
    </div>
  );
}

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ poolId: string }>;
  searchParams: Promise<{ match?: string }>;
}) {
  const { poolId } = await params;
  const { match: focusMatchId } = await searchParams;
  const user = await getUser();
  if (!user) notFound();

  const [pool, participation] = await Promise.all([
    getPool(poolId),
    getParticipation(poolId, user.id),
  ]);

  if (!pool || !participation) notFound();

  const isPastDeadline = new Date(pool.deadline) < new Date();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarLoader
          poolId={poolId}
          tournamentId={pool.tournament_id}
          currentUserId={user.id}
          isPastDeadline={isPastDeadline}
          isAdmin={participation.is_admin}
          focusMatchId={focusMatchId}
        />
      </Suspense>
    </div>
  );
}
