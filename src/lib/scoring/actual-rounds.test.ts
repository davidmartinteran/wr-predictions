import { describe, it, expect } from "vitest";
import { deriveActualRounds, type KnockoutMatchRow } from "./actual-rounds";

const T = (n: number) => `team-${n}`;

function r32Match(slot: number, opts: Partial<KnockoutMatchRow> = {}): KnockoutMatchRow {
  return {
    stage: "R32",
    home_team: T(slot * 2),
    away_team: T(slot * 2 + 1),
    winner_team: null,
    ...opts,
  };
}

// 16 cruces R32 completos: equipos team-0 … team-31
const fullR32 = Array.from({ length: 16 }, (_, i) => r32Match(i));
const ALL_TEAMS = Array.from({ length: 48 }, (_, i) => T(i));

describe("deriveActualRounds", () => {
  it("devuelve vacío sin partidos resueltos ni R32 completo", () => {
    const partial = fullR32.slice(0, 5);
    expect(deriveActualRounds(partial, ALL_TEAMS)).toEqual({});
  });

  it("no marca GROUP mientras falte algún equipo en R32", () => {
    const incomplete = [...fullR32.slice(0, 15), r32Match(15, { away_team: null })];
    const rounds = deriveActualRounds(incomplete, ALL_TEAMS);
    expect(Object.values(rounds)).not.toContain("GROUP");
  });

  it("con R32 completo, los equipos ausentes caen en GROUP", () => {
    const rounds = deriveActualRounds(fullR32, ALL_TEAMS);
    expect(rounds[T(32)]).toBe("GROUP");
    expect(rounds[T(47)]).toBe("GROUP");
    expect(rounds[T(0)]).toBeUndefined(); // vivo: aún sin ronda
  });

  it("el perdedor de un cruce cae en la ronda del cruce", () => {
    const matches = [...fullR32];
    matches[0] = r32Match(0, { winner_team: T(0) });
    const rounds = deriveActualRounds(matches, ALL_TEAMS);
    expect(rounds[T(1)]).toBe("R32");
    expect(rounds[T(0)]).toBeUndefined(); // ganador sigue vivo
  });

  it("puntúa perdedores aunque el R32 no esté completo", () => {
    const matches = [r32Match(0, { winner_team: T(1) })];
    const rounds = deriveActualRounds(matches, ALL_TEAMS);
    expect(rounds[T(0)]).toBe("R32");
  });

  it("ganador con empate (penaltis) usa winner_team, no el marcador", () => {
    // El marcador no participa: solo winner_team decide
    const matches = [
      { stage: "QF", home_team: T(0), away_team: T(1), winner_team: T(1) },
    ];
    expect(deriveActualRounds(matches, ALL_TEAMS)[T(0)]).toBe("QF");
  });

  it("la final reparte CHAMPION y RUNNER_UP", () => {
    const matches = [
      { stage: "FINAL", home_team: T(0), away_team: T(1), winner_team: T(0) },
    ];
    const rounds = deriveActualRounds(matches, ALL_TEAMS);
    expect(rounds[T(0)]).toBe("CHAMPION");
    expect(rounds[T(1)]).toBe("RUNNER_UP");
  });

  it("el 3er puesto no cambia la ronda de los semifinalistas", () => {
    const matches = [
      { stage: "SF", home_team: T(0), away_team: T(1), winner_team: T(0) },
      { stage: "SF", home_team: T(2), away_team: T(3), winner_team: T(2) },
      { stage: "3RD", home_team: T(1), away_team: T(3), winner_team: T(3) },
    ];
    const rounds = deriveActualRounds(matches, ALL_TEAMS);
    expect(rounds[T(1)]).toBe("SF");
    expect(rounds[T(3)]).toBe("SF");
  });

  it("ignora cruces sin equipos o sin ganador", () => {
    const matches = [
      { stage: "R16", home_team: T(0), away_team: null, winner_team: T(0) },
      { stage: "R16", home_team: T(2), away_team: T(3), winner_team: null },
    ];
    expect(deriveActualRounds(matches, ALL_TEAMS)).toEqual({});
  });
});
