import type { EliminationRound } from "./engine";

// Partido de eliminatorias tal como vive en la tabla matches.
// winner_team lo escribe poll-results desde el flag `winner` de ESPN,
// por lo que es correcto también en partidos decididos por penaltis.
export type KnockoutMatchRow = {
  stage: string; // 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'FINAL'
  home_team: string | null;
  away_team: string | null;
  winner_team: string | null;
};

const KO_STAGES: ReadonlyArray<EliminationRound> = ["R32", "R16", "QF", "SF"];
const R32_MATCH_COUNT = 16;

/**
 * Ronda real en la que cae cada selección, derivada de los partidos de
 * eliminatorias. Solo devuelve equipos cuya ronda final ya es DEFINITIVA:
 *
 * - Perdedor de un cruce R32/R16/QF/SF → eliminado en esa ronda.
 *   (El 3er puesto no altera la ronda: ambos semifinalistas son 'SF'.)
 * - Final con ganador → CHAMPION / RUNNER_UP.
 * - GROUP solo cuando los 16 cruces de R32 tienen ambos equipos: entonces
 *   cualquier equipo del torneo que no aparezca en R32 cayó en grupos.
 *
 * Los equipos aún vivos no aparecen en el resultado (se puntúan más adelante).
 */
export function deriveActualRounds(
  knockoutMatches: KnockoutMatchRow[],
  allTeamIds: string[]
): Record<string, EliminationRound> {
  const rounds: Record<string, EliminationRound> = {};

  const r32 = knockoutMatches.filter((m) => m.stage === "R32");
  const r32Complete =
    r32.length === R32_MATCH_COUNT &&
    r32.every((m) => m.home_team !== null && m.away_team !== null);

  if (r32Complete) {
    const inR32 = new Set<string>();
    for (const m of r32) {
      inR32.add(m.home_team!);
      inR32.add(m.away_team!);
    }
    for (const teamId of allTeamIds) {
      if (!inR32.has(teamId)) rounds[teamId] = "GROUP";
    }
  }

  for (const m of knockoutMatches) {
    if (!m.winner_team || !m.home_team || !m.away_team) continue;
    const loser = m.winner_team === m.home_team ? m.away_team : m.home_team;

    if (m.stage === "FINAL") {
      rounds[m.winner_team] = "CHAMPION";
      rounds[loser] = "RUNNER_UP";
    } else if ((KO_STAGES as readonly string[]).includes(m.stage)) {
      rounds[loser] = m.stage as EliminationRound;
    }
    // '3RD': no cambia la ronda de eliminación (ambos ya son 'SF')
  }

  return rounds;
}
