import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser, getPool } from "@/lib/supabase/queries";
import {
  buildBracketStateFromR32,
  type RealR32Match,
} from "@/lib/bracket/engine";
import { derivePredictedRounds } from "@/lib/bracket/predicted-rounds";
import { deriveActualRounds } from "@/lib/scoring/actual-rounds";
import {
  scoreElimination,
  type EliminationRound,
} from "@/lib/scoring/engine";
import { normalizePoolRules } from "@/lib/scoring/rules";
import type { TeamInfo } from "@/lib/bracket/standings";
import { BracketsClient } from "./brackets-client";

export type TeamPick = {
  code: string;
  name: string;
  flag: string | null;
  points: number | null; // null = aún vivo (sin ronda real)
};

export type PlayerBracket = {
  userId: string;
  displayName: string;
  total: number;
  champion: TeamPick | null;
  runnerUp: TeamPick | null;
  sf: TeamPick[];
  qf: TeamPick[];
  r16: TeamPick[];
  r32: TeamPick[];
};

export default async function BracketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ poolId: string }>;
  searchParams: Promise<{ player?: string }>;
}) {
  const { poolId } = await params;
  const { player: initialUserId } = await searchParams;
  const user = await getUser();
  if (!user) notFound();

  const pool = await getPool(poolId);
  if (!pool) notFound();
  // Solo tiene sentido en porras de solo eliminatorias (sembradas de R32 real).
  if (!pool.starts_at) notFound();

  const supabase = await createClient();

  const [
    { data: participants },
    { data: koPreds },
    { data: teamRows },
    { data: matchRows },
    { data: poolRow },
  ] = await Promise.all([
    supabase
      .from("participations")
      .select("user_id, display_name")
      .eq("pool_id", poolId),
    supabase
      .from("predictions_knockout")
      .select("user_id, stage, slot, team_id")
      .eq("pool_id", poolId),
    supabase
      .from("teams")
      .select("id, name, code, flag_emoji")
      .eq("tournament_id", pool.tournament_id),
    supabase
      .from("matches")
      .select("stage, match_number, home_team, away_team, winner_team")
      .eq("tournament_id", pool.tournament_id)
      .neq("stage", "GROUP"),
    supabase.from("pools").select("scoring_rules").eq("id", poolId).single(),
  ]);

  const teamById = new Map<string, TeamInfo>(
    (teamRows ?? []).map((t) => [
      t.id,
      { id: t.id, name: t.name, code: t.code, flag_emoji: t.flag_emoji },
    ]),
  );
  const allTeamIds = (teamRows ?? []).map((t) => t.id);
  const spainIds = new Set(
    (teamRows ?? []).filter((t) => t.code === "ESP").map((t) => t.id),
  );
  const rules = normalizePoolRules(poolRow?.scoring_rules);

  // Cruces reales de R32 (para sembrar cada bracket) y rondas reales alcanzadas.
  const realR32: RealR32Match[] = (matchRows ?? [])
    .filter((m) => m.stage === "R32")
    .map((m) => ({
      matchNumber: m.match_number,
      homeTeam: m.home_team ? (teamById.get(m.home_team) ?? null) : null,
      awayTeam: m.away_team ? (teamById.get(m.away_team) ?? null) : null,
    }));
  const actualRounds = deriveActualRounds(
    (matchRows ?? []).map((m) => ({
      stage: m.stage,
      home_team: m.home_team,
      away_team: m.away_team,
      winner_team: m.winner_team,
    })),
    allTeamIds,
  );

  // Picks de cada usuario
  const picksByUser = new Map<string, Record<string, string>>();
  for (const p of koPreds ?? []) {
    let m = picksByUser.get(p.user_id);
    if (!m) {
      m = {};
      picksByUser.set(p.user_id, m);
    }
    m[`${p.stage}:${p.slot}`] = p.team_id;
  }

  const ROUND_BUCKET: Record<EliminationRound, keyof Omit<PlayerBracket, "userId" | "displayName" | "total" | "champion" | "runnerUp"> | "champion" | "runnerUp" | null> = {
    CHAMPION: "champion",
    RUNNER_UP: "runnerUp",
    SF: "sf",
    QF: "qf",
    R16: "r16",
    R32: "r32",
    GROUP: null, // no aparece en el cuadro
  };

  const players: PlayerBracket[] = (participants ?? [])
    .map((part) => {
      const picks = picksByUser.get(part.user_id) ?? {};
      const bracket = buildBracketStateFromR32(realR32, picks);
      const predicted = derivePredictedRounds(bracket, allTeamIds);

      const base: PlayerBracket = {
        userId: part.user_id,
        displayName: part.display_name,
        total: 0,
        champion: null,
        runnerUp: null,
        sf: [],
        qf: [],
        r16: [],
        r32: [],
      };

      for (const [teamId, round] of Object.entries(predicted)) {
        const bucket = ROUND_BUCKET[round];
        if (!bucket) continue; // GROUP → fuera del cuadro
        const team = teamById.get(teamId);
        if (!team) continue;

        const actual = actualRounds[teamId];
        const points = actual
          ? scoreElimination(round, actual, rules, spainIds.has(teamId))
          : null;
        if (points) base.total += points;

        const pick: TeamPick = {
          code: team.code,
          name: team.name,
          flag: team.flag_emoji,
          points,
        };
        if (bucket === "champion") base.champion = pick;
        else if (bucket === "runnerUp") base.runnerUp = pick;
        else base[bucket].push(pick);
      }

      return base;
    })
    .sort((a, b) => b.total - a.total || a.displayName.localeCompare(b.displayName));

  return (
    <BracketsClient
      poolName={pool.name}
      players={players}
      currentUserId={user.id}
      initialUserId={initialUserId}
    />
  );
}
