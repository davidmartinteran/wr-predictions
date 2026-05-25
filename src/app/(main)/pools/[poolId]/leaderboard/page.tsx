import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { LeaderboardClient } from "./leaderboard-client";

type ScoreRow = {
  user_id: string;
  category: string;
  points: number;
  exact_hits: number;
};

export type PlayerEntry = {
  userId: string;
  displayName: string;
  initials: string;
  isCurrentUser: boolean;
  scores: {
    GROUP_MATCHES: number;
    GROUP_QUALIFIERS: number;
    KNOCKOUT: number;
    EXTRAS: number;
    FIRST_SCORER_ESP: number;
    TOTAL: number;
  };
  maxScores: {
    GROUP_MATCHES: number;
    GROUP_QUALIFIERS: number;
    KNOCKOUT: number;
    EXTRAS: number;
    FIRST_SCORER_ESP: number;
    TOTAL: number;
  };
  exactHits: number;
  signHits: number;
};

const MAX_SCORES = {
  GROUP_MATCHES: 216,
  GROUP_QUALIFIERS: 72,
  KNOCKOUT: 108,
  EXTRAS: 120,
  FIRST_SCORER_ESP: 70,
  TOTAL: 586,
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const [
    { data: pool },
    { data: participants },
    { data: scoreRows },
  ] = await Promise.all([
    supabase.from("pools").select("name, status").eq("id", poolId).maybeSingle(),
    supabase.from("participations").select("user_id, display_name").eq("pool_id", poolId),
    supabase.from("scores").select("user_id, category, points, exact_hits").eq("pool_id", poolId),
  ]);

  if (!pool) notFound();

  const scoresByUser: Record<string, ScoreRow[]> = {};
  for (const row of scoreRows ?? []) {
    if (!scoresByUser[row.user_id]) scoresByUser[row.user_id] = [];
    scoresByUser[row.user_id].push(row);
  }

  const categories = [
    "GROUP_MATCHES",
    "GROUP_QUALIFIERS",
    "KNOCKOUT",
    "EXTRAS",
    "FIRST_SCORER_ESP",
  ] as const;

  const players: PlayerEntry[] = (participants ?? []).map((p) => {
    const userScores = scoresByUser[p.user_id] ?? [];
    const scores: PlayerEntry["scores"] = {
      GROUP_MATCHES: 0,
      GROUP_QUALIFIERS: 0,
      KNOCKOUT: 0,
      EXTRAS: 0,
      FIRST_SCORER_ESP: 0,
      TOTAL: 0,
    };

    let exactHits = 0;

    for (const row of userScores) {
      const cat = row.category as keyof typeof scores;
      if (cat in scores) {
        scores[cat] = row.points;
      }
      if (cat === "GROUP_MATCHES") {
        exactHits = row.exact_hits;
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
      signHits: 0,
    };
  });

  players.sort((a, b) => b.scores.TOTAL - a.scores.TOTAL || b.exactHits - a.exactHits);

  const isLive = pool?.status === "LIVE" || pool?.status === "REVEALED";

  return (
    <LeaderboardClient
      poolId={poolId}
      poolName={pool?.name ?? "Porra"}
      players={players}
      playerCount={players.length}
      isLive={isLive}
    />
  );
}
