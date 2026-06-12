import type { EliminationRound } from "../scoring/engine";
import { STAGES } from "./mapping";
import type { BracketState } from "./engine";

/**
 * Ronda predicha por el usuario para cada selección, derivada de su bracket
 * (buildBracketState sobre su porra congelada). Para cada equipo:
 *
 * - No aparece en el R32 predicho → GROUP (cae en grupos).
 * - Aparece en una ronda pero no gana su cruce → eliminado en esa ronda.
 * - Finalista no campeón → RUNNER_UP; ganador de la final → CHAMPION.
 *
 * Equipos sin pick más allá de su última aparición quedan eliminados ahí
 * (un bracket incompleto puntúa hasta donde el usuario predijo).
 */
export function derivePredictedRounds(
  bracket: BracketState,
  allTeamIds: string[]
): Record<string, EliminationRound> {
  const rounds: Record<string, EliminationRound> = {};
  for (const teamId of allTeamIds) rounds[teamId] = "GROUP";

  for (const stage of STAGES) {
    for (const match of bracket.matches[stage]) {
      const round: EliminationRound = stage === "FINAL" ? "RUNNER_UP" : stage;
      if (match.homeTeam) rounds[match.homeTeam.id] = round;
      if (match.awayTeam) rounds[match.awayTeam.id] = round;
    }
  }

  if (bracket.champion) rounds[bracket.champion.id] = "CHAMPION";

  return rounds;
}
