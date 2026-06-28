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
  type ScoringRules,
} from "@/lib/scoring/engine";
import { normalizePoolRules } from "@/lib/scoring/rules";
import type { TeamInfo } from "@/lib/bracket/standings";
import { BracketsClient } from "./brackets-client";

export type TeamPick = {
  code: string;
  name: string;
  flag: string | null;
  points: number | null; // null = aún vivo (sin ronda real)
  actualLabel: string | null; // dónde se quedó de verdad (null = aún vivo)
};

// Ronda real alcanzada, en etiqueta corta para el badge junto al puntaje.
const ROUND_LABEL: Record<EliminationRound, string> = {
  GROUP: "Grupos",
  R32: "16avos",
  R16: "Octavos",
  QF: "Cuartos",
  SF: "Semis",
  RUNNER_UP: "Subcamp.",
  CHAMPION: "Campeón",
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
  group: TeamPick[]; // predichos fuera en fase de grupos (solo porras completas)
};

// Tablilla informativa: cuánto vale cada ronda (acierto exacto, ±1 = mitad,
// ±2 = cuarto), derivada de las reglas reales de la porra.
export type ScoringRow = {
  label: string;
  exact: number;
  half: number;
  quarter: number;
};

const SCORING_KEY: Record<EliminationRound, keyof ScoringRules> = {
  CHAMPION: "elim_champion",
  RUNNER_UP: "elim_runner_up",
  SF: "elim_sf",
  QF: "elim_qf",
  R16: "elim_r16",
  R32: "elim_r32",
  GROUP: "elim_group",
};

const SCORING_ROWS: { round: EliminationRound; label: string }[] = [
  { round: "CHAMPION", label: "Campeón" },
  { round: "RUNNER_UP", label: "Subcampeón" },
  { round: "SF", label: "Semifinales" },
  { round: "QF", label: "Cuartos" },
  { round: "R16", label: "Octavos" },
  { round: "R32", label: "Dieciseisavos" },
  { round: "GROUP", label: "No pasan de grupos" },
];

function buildScoringTable(
  rules: ScoringRules,
  includeGroup: boolean,
): ScoringRow[] {
  return SCORING_ROWS.filter((r) => includeGroup || r.round !== "GROUP").map(
    (r) => {
      const base = rules[SCORING_KEY[r.round]] as number;
      return {
        label: r.label,
        exact: base,
        half: Math.round(base * rules.distance_1),
        quarter: Math.round(base * rules.distance_2),
      };
    },
  );
}

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

  // Porras de solo eliminatorias: el bracket se siembra de los cruces REALES de
  // R32 y se deriva en vivo de los picks. Porras completas: la ronda predicha de
  // cada selección (incluidos los eliminados en grupos) ya está materializada en
  // predicted_team_rounds, así que se lee de ahí — garantiza que los puntos por
  // equipo sumen exactamente la barra de Clasificación del leaderboard.
  const isKnockout = !!pool.starts_at;

  const supabase = await createClient();

  const predictionSource = isKnockout
    ? supabase
        .from("predictions_knockout")
        .select("user_id, stage, slot, team_id")
        .eq("pool_id", poolId)
    : supabase
        .from("predicted_team_rounds")
        .select("user_id, team_id, round")
        .eq("pool_id", poolId);

  const [
    { data: participants },
    { data: teamRows },
    { data: matchRows },
    { data: poolRow },
    { data: predictionRows },
  ] = await Promise.all([
    supabase
      .from("participations")
      .select("user_id, display_name")
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
    predictionSource,
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

  // Ronda predicha de cada selección, por usuario.
  const predictedByUser = new Map<string, Record<string, EliminationRound>>();
  if (isKnockout) {
    // Porra KO: se deriva en vivo de los picks sobre los cruces reales de R32.
    const picksByUser = new Map<string, Record<string, string>>();
    for (const p of (predictionRows ?? []) as {
      user_id: string;
      stage: string;
      slot: number;
      team_id: string;
    }[]) {
      let m = picksByUser.get(p.user_id);
      if (!m) {
        m = {};
        picksByUser.set(p.user_id, m);
      }
      m[`${p.stage}:${p.slot}`] = p.team_id;
    }
    for (const part of participants ?? []) {
      const picks = picksByUser.get(part.user_id) ?? {};
      const bracket = buildBracketStateFromR32(realR32, picks);
      predictedByUser.set(part.user_id, derivePredictedRounds(bracket, allTeamIds));
    }
  } else {
    // Porra completa: rondas ya materializadas (incluye GROUP).
    for (const row of (predictionRows ?? []) as {
      user_id: string;
      team_id: string;
      round: EliminationRound;
    }[]) {
      let m = predictedByUser.get(row.user_id);
      if (!m) {
        m = {};
        predictedByUser.set(row.user_id, m);
      }
      m[row.team_id] = row.round;
    }
  }

  const ROUND_BUCKET: Record<EliminationRound, keyof Omit<PlayerBracket, "userId" | "displayName" | "total" | "champion" | "runnerUp"> | "champion" | "runnerUp"> = {
    CHAMPION: "champion",
    RUNNER_UP: "runnerUp",
    SF: "sf",
    QF: "qf",
    R16: "r16",
    R32: "r32",
    GROUP: "group", // "No pasan de grupos" (solo porras completas)
  };

  const players: PlayerBracket[] = (participants ?? [])
    .map((part) => {
      const predicted = predictedByUser.get(part.user_id) ?? {};

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
        group: [],
      };

      for (const [teamId, round] of Object.entries(predicted)) {
        const bucket = ROUND_BUCKET[round];
        // En porras KO los 16 eliminados en grupos son los mismos para todos
        // (sembrados de los cruces reales de R32) y nunca se predijeron: se
        // mantienen fuera del cuadro, como en la vista original. Solo las
        // porras completas muestran "No pasan de grupos".
        if (bucket === "group" && isKnockout) continue;
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
          actualLabel: actual ? ROUND_LABEL[actual] : null,
        };
        if (bucket === "champion") base.champion = pick;
        else if (bucket === "runnerUp") base.runnerUp = pick;
        else base[bucket].push(pick);
      }

      return base;
    })
    .sort((a, b) => b.total - a.total || a.displayName.localeCompare(b.displayName));

  // "No pasan de grupos" solo puntúa en porras completas (ver bucle de scoring).
  const scoringTable = buildScoringTable(rules, !isKnockout);

  return (
    <BracketsClient
      poolName={pool.name}
      players={players}
      currentUserId={user.id}
      initialUserId={initialUserId}
      scoringTable={scoringTable}
    />
  );
}
