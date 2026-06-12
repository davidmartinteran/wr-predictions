import { describe, it, expect } from "vitest";
import { derivePredictedRounds } from "./predicted-rounds";
import type { BracketState, BracketMatch } from "./engine";
import type { TeamInfo } from "./standings";
import type { Stage } from "./mapping";

const team = (n: number): TeamInfo => ({
  id: `team-${n}`,
  name: `Team ${n}`,
  code: `T${n}`,
  flag_emoji: null,
});

function emptyBracket(): BracketState {
  const mk = (stage: Stage, count: number): BracketMatch[] =>
    Array.from({ length: count }, (_, slot) => ({
      stage,
      slot,
      homeTeam: null,
      awayTeam: null,
      winner: null,
    }));
  return {
    matches: { R32: mk("R32", 16), R16: mk("R16", 8), QF: mk("QF", 4), SF: mk("SF", 2), FINAL: mk("FINAL", 1) },
    champion: null,
    filledCount: 0,
  };
}

const ALL = Array.from({ length: 48 }, (_, i) => `team-${i}`);

describe("derivePredictedRounds", () => {
  it("equipos fuera del bracket → GROUP", () => {
    const rounds = derivePredictedRounds(emptyBracket(), ALL);
    expect(rounds["team-0"]).toBe("GROUP");
    expect(Object.keys(rounds)).toHaveLength(48);
  });

  it("aparece en R32 sin ganar → R32; ganador avanza a la ronda siguiente", () => {
    const b = emptyBracket();
    b.matches.R32[0] = { stage: "R32", slot: 0, homeTeam: team(0), awayTeam: team(1), winner: team(0) };
    b.matches.R16[0] = { stage: "R16", slot: 0, homeTeam: team(0), awayTeam: null, winner: null };
    const rounds = derivePredictedRounds(b, ALL);
    expect(rounds["team-1"]).toBe("R32");
    expect(rounds["team-0"]).toBe("R16"); // llega a octavos y no se predijo más allá
  });

  it("finalistas: campeón → CHAMPION, el otro → RUNNER_UP", () => {
    const b = emptyBracket();
    b.matches.FINAL[0] = { stage: "FINAL", slot: 0, homeTeam: team(5), awayTeam: team(9), winner: team(9) };
    b.champion = team(9);
    const rounds = derivePredictedRounds(b, ALL);
    expect(rounds["team-9"]).toBe("CHAMPION");
    expect(rounds["team-5"]).toBe("RUNNER_UP");
  });

  it("la ronda más avanzada gana sobre las anteriores", () => {
    const b = emptyBracket();
    b.matches.R32[0] = { stage: "R32", slot: 0, homeTeam: team(0), awayTeam: team(1), winner: team(0) };
    b.matches.R16[0] = { stage: "R16", slot: 0, homeTeam: team(0), awayTeam: team(2), winner: team(0) };
    b.matches.QF[0] = { stage: "QF", slot: 0, homeTeam: team(0), awayTeam: null, winner: null };
    const rounds = derivePredictedRounds(b, ALL);
    expect(rounds["team-0"]).toBe("QF");
  });
});
