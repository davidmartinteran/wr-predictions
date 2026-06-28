import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser, getPool } from "@/lib/supabase/queries";
import { LeaderboardClient } from "./leaderboard-client";

type ScoreRow = {
  user_id: string;
  category: string;
  points: number;
  exact_hits: number;
  sign_hits: number;
};

export type PlayerEntry = {
  userId: string;
  displayName: string;
  initials: string;
  isCurrentUser: boolean;
  scores: {
    RESULTS: number;
    CLASSIFICATIONS: number;
    EXTRAS: number;
    TOTAL: number;
  };
  maxScores: {
    RESULTS: number;
    CLASSIFICATIONS: number;
    EXTRAS: number;
    TOTAL: number;
  };
  exactHits: number;
  signHits: number;
};

const MAX_SCORES = {
  RESULTS: 225,
  CLASSIFICATIONS: 242,
  EXTRAS: 101,
  TOTAL: 568,
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ poolId: string }>;
}) {
  const { poolId } = await params;
  const user = await getUser();
  if (!user) notFound();

  const supabase = await createClient();
  const [pool, { data: participants }, { data: scoreRows }] = await Promise.all(
    [
      getPool(poolId),
      supabase
        .from("participations")
        .select("user_id, display_name")
        .eq("pool_id", poolId),
      supabase
        .from("scores")
        .select("user_id, category, points, exact_hits, sign_hits")
        .eq("pool_id", poolId),
    ],
  );

  if (!pool) notFound();

  const scoresByUser: Record<string, ScoreRow[]> = {};
  for (const row of scoreRows ?? []) {
    if (!scoresByUser[row.user_id]) scoresByUser[row.user_id] = [];
    scoresByUser[row.user_id].push(row);
  }

  const categories = ["RESULTS", "CLASSIFICATIONS", "EXTRAS"] as const;

  const players: PlayerEntry[] = (participants ?? []).map((p) => {
    const userScores = scoresByUser[p.user_id] ?? [];
    const scores: PlayerEntry["scores"] = {
      RESULTS: 0,
      CLASSIFICATIONS: 0,
      EXTRAS: 0,
      TOTAL: 0,
    };

    let exactHits = 0;
    let signHits = 0;

    for (const row of userScores) {
      const cat = row.category as keyof typeof scores;
      if (cat in scores) {
        scores[cat] = row.points;
      }
      if (cat === "RESULTS") {
        exactHits = row.exact_hits;
        signHits = row.sign_hits ?? 0;
      }
    }

    scores.TOTAL = categories.reduce((sum, c) => sum + scores[c], 0);

    return {
      userId: p.user_id,
      displayName: p.display_name,
      initials: getInitials(p.display_name),
      isCurrentUser: p.user_id === user.id,
      scores,
      maxScores: MAX_SCORES,
      exactHits,
      signHits,
    };
  });

  players.sort(
    (a, b) => b.scores.TOTAL - a.scores.TOTAL || b.exactHits - a.exactHits,
  );

  const isLive = pool.status === "LIVE" || pool.status === "REVEALED";
  const isPastDeadline = pool.deadline
    ? new Date(pool.deadline) < new Date()
    : false;

  return (
    <LeaderboardClient
      poolId={poolId}
      poolName={pool.name}
      players={players}
      playerCount={players.length}
      isLive={isLive}
      canViewOthers={isPastDeadline}
      deadline={pool.deadline}
      showResults={!pool.starts_at}
      showExtras={!pool.hide_extras}
    />
  );
}
