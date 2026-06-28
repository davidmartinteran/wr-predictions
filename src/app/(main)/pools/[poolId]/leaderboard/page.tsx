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

export type GroupHits = { group: string; exactos: number; signos: number };

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
  groupHits: GroupHits[];
};

function sign(home: number, away: number): "1" | "X" | "2" {
  return home > away ? "1" : home < away ? "2" : "X";
}

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

  const isPastDeadline = pool.deadline
    ? new Date(pool.deadline) < new Date()
    : false;

  // Aciertos por grupo (solo porra completa, tras el cierre): exactos y signos
  // de cada jugador en los partidos de grupo ya jugados, de un vistazo.
  const groupHitsByUser = new Map<string, GroupHits[]>();
  if (!pool.starts_at && isPastDeadline) {
    const [{ data: groupMatches }, { data: groupPreds }] = await Promise.all([
      supabase
        .from("matches")
        .select("id, group_letter, home_score, away_score")
        .eq("tournament_id", pool.tournament_id)
        .eq("stage", "GROUP")
        .eq("finished", true),
      supabase
        .from("predictions_match")
        .select("user_id, match_id, home_score, away_score")
        .eq("pool_id", poolId),
    ]);

    const matchById = new Map(
      (groupMatches ?? [])
        .filter(
          (m) =>
            m.group_letter && m.home_score !== null && m.away_score !== null,
        )
        .map((m) => [m.id, m]),
    );
    const acc = new Map<
      string,
      Map<string, { exactos: number; signos: number }>
    >();
    for (const p of groupPreds ?? []) {
      if (p.home_score === null || p.away_score === null) continue;
      const m = matchById.get(p.match_id);
      if (!m) continue;
      const g = m.group_letter as string;
      let byGroup = acc.get(p.user_id);
      if (!byGroup) {
        byGroup = new Map();
        acc.set(p.user_id, byGroup);
      }
      let cell = byGroup.get(g);
      if (!cell) {
        cell = { exactos: 0, signos: 0 };
        byGroup.set(g, cell);
      }
      if (p.home_score === m.home_score && p.away_score === m.away_score) {
        cell.exactos++;
      } else if (
        sign(p.home_score, p.away_score) === sign(m.home_score!, m.away_score!)
      ) {
        cell.signos++;
      }
    }
    for (const [userId, byGroup] of acc) {
      groupHitsByUser.set(
        userId,
        [...byGroup.entries()]
          .map(([group, c]) => ({ group, exactos: c.exactos, signos: c.signos }))
          .sort((a, b) => a.group.localeCompare(b.group)),
      );
    }
  }

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
      groupHits: groupHitsByUser.get(p.user_id) ?? [],
    };
  });

  players.sort(
    (a, b) => b.scores.TOTAL - a.scores.TOTAL || b.exactHits - a.exactHits,
  );

  const isLive = pool.status === "LIVE" || pool.status === "REVEALED";

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
      showBrackets={!!pool.starts_at && isPastDeadline}
      bracketBreakdown={!pool.starts_at && isPastDeadline}
    />
  );
}
