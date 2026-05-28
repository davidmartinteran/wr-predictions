import { describe, it, expect } from "vitest";
import {
  scoreGroupMatch,
  scoreElimination,
  scoreExtra,
  calculateTotal,
  DEFAULT_RULES,
  type ScoringRules,
  type MatchPrediction,
  type MatchResult,
  type ExtraPrediction,
  type EliminationRound,
} from "./engine";

const R = DEFAULT_RULES;

// ── scoreGroupMatch ────────────────────────────────────────────────

describe("scoreGroupMatch", () => {
  it("exact score → 3 pts", () => {
    const s = scoreGroupMatch({ home_score: 2, away_score: 1 }, { home_score: 2, away_score: 1 }, R);
    expect(s.points).toBe(3);
    expect(s.exact_hit).toBe(true);
  });

  it("correct sign, wrong score → 1 pt", () => {
    const s = scoreGroupMatch({ home_score: 3, away_score: 0 }, { home_score: 1, away_score: 0 }, R);
    expect(s.points).toBe(1);
    expect(s.exact_hit).toBe(false);
  });

  it("correct draw sign, wrong score → 1 pt", () => {
    const s = scoreGroupMatch({ home_score: 0, away_score: 0 }, { home_score: 1, away_score: 1 }, R);
    expect(s.points).toBe(1);
    expect(s.exact_hit).toBe(false);
  });

  it("wrong sign → 0 pts", () => {
    const s = scoreGroupMatch({ home_score: 2, away_score: 0 }, { home_score: 0, away_score: 1 }, R);
    expect(s.points).toBe(0);
    expect(s.exact_hit).toBe(false);
  });

  it("exact 0-0 → 3 pts", () => {
    const s = scoreGroupMatch({ home_score: 0, away_score: 0 }, { home_score: 0, away_score: 0 }, R);
    expect(s.points).toBe(3);
    expect(s.exact_hit).toBe(true);
  });

  it("Spain exact → 6 pts (×2)", () => {
    const s = scoreGroupMatch({ home_score: 2, away_score: 1 }, { home_score: 2, away_score: 1 }, R, true);
    expect(s.points).toBe(6);
    expect(s.exact_hit).toBe(true);
  });

  it("Spain sign → 2 pts (×2)", () => {
    const s = scoreGroupMatch({ home_score: 3, away_score: 0 }, { home_score: 1, away_score: 0 }, R, true);
    expect(s.points).toBe(2);
  });

  it("Spain wrong → 0 pts", () => {
    const s = scoreGroupMatch({ home_score: 2, away_score: 0 }, { home_score: 0, away_score: 1 }, R, true);
    expect(s.points).toBe(0);
  });

  it("respects custom rules", () => {
    const custom = { ...R, match_exact: 5, match_sign: 2, spain_multiplier: 3 };
    expect(scoreGroupMatch({ home_score: 1, away_score: 0 }, { home_score: 1, away_score: 0 }, custom).points).toBe(5);
    expect(scoreGroupMatch({ home_score: 2, away_score: 0 }, { home_score: 1, away_score: 0 }, custom).points).toBe(2);
    expect(scoreGroupMatch({ home_score: 1, away_score: 0 }, { home_score: 1, away_score: 0 }, custom, true).points).toBe(15);
  });
});

// ── scoreElimination ───────────────────────────────────────────────

describe("scoreElimination", () => {
  it("exact GROUP → 2 pts", () => {
    expect(scoreElimination("GROUP", "GROUP", R)).toBe(2);
  });

  it("exact R32 → 3 pts", () => {
    expect(scoreElimination("R32", "R32", R)).toBe(3);
  });

  it("exact R16 → 5 pts", () => {
    expect(scoreElimination("R16", "R16", R)).toBe(5);
  });

  it("exact QF → 8 pts", () => {
    expect(scoreElimination("QF", "QF", R)).toBe(8);
  });

  it("exact SF → 12 pts", () => {
    expect(scoreElimination("SF", "SF", R)).toBe(12);
  });

  it("exact RUNNER_UP → 18 pts", () => {
    expect(scoreElimination("RUNNER_UP", "RUNNER_UP", R)).toBe(18);
  });

  it("exact CHAMPION → 25 pts", () => {
    expect(scoreElimination("CHAMPION", "CHAMPION", R)).toBe(25);
  });

  // Distance 1 → 50%
  it("predicted CHAMPION, actual RUNNER_UP (distance 1) → 13 pts", () => {
    expect(scoreElimination("CHAMPION", "RUNNER_UP", R)).toBe(Math.round(25 * 0.5));
  });

  it("predicted R32, actual GROUP (distance 1) → 2 pts", () => {
    expect(scoreElimination("R32", "GROUP", R)).toBe(Math.round(3 * 0.5));
  });

  it("predicted R16, actual QF (distance 1) → 3 pts", () => {
    expect(scoreElimination("R16", "QF", R)).toBe(Math.round(5 * 0.5));
  });

  it("predicted GROUP, actual R32 (distance 1) → 1 pt", () => {
    expect(scoreElimination("GROUP", "R32", R)).toBe(Math.round(2 * 0.5));
  });

  // Distance 2 → 25%
  it("predicted CHAMPION, actual SF (distance 2) → 6 pts", () => {
    expect(scoreElimination("CHAMPION", "SF", R)).toBe(Math.round(25 * 0.25));
  });

  it("predicted GROUP, actual R16 (distance 2) → 1 pt", () => {
    expect(scoreElimination("GROUP", "R16", R)).toBe(Math.round(2 * 0.25));
  });

  // Distance 3+ → 0
  it("predicted CHAMPION, actual QF (distance 3) → 0 pts", () => {
    expect(scoreElimination("CHAMPION", "QF", R)).toBe(0);
  });

  it("predicted GROUP, actual QF (distance 3) → 0 pts", () => {
    expect(scoreElimination("GROUP", "QF", R)).toBe(0);
  });

  it("predicted CHAMPION, actual GROUP (distance 6) → 0 pts", () => {
    expect(scoreElimination("CHAMPION", "GROUP", R)).toBe(0);
  });

  // Spain ×2
  it("Spain exact CHAMPION → 50 pts", () => {
    expect(scoreElimination("CHAMPION", "CHAMPION", R, true)).toBe(50);
  });

  it("Spain exact GROUP → 4 pts", () => {
    expect(scoreElimination("GROUP", "GROUP", R, true)).toBe(4);
  });

  it("Spain predicted CHAMPION, actual RUNNER_UP → 25 pts", () => {
    expect(scoreElimination("CHAMPION", "RUNNER_UP", R, true)).toBe(Math.round(25 * 0.5 * 2));
  });

  it("Spain distance 3+ → still 0 pts", () => {
    expect(scoreElimination("CHAMPION", "R16", R, true)).toBe(0);
  });
});

// ── scoreExtra ─────────────────────────────────────────────────────

describe("scoreExtra", () => {
  it("top_scorer correct → 15 pts", () => {
    expect(scoreExtra({ kind: "TOP_SCORER", value: "Mbappé" }, "mbappé", R)).toBe(15);
  });

  it("best_player correct → 10 pts", () => {
    expect(scoreExtra({ kind: "BEST_PLAYER", value: "Messi" }, "Messi", R)).toBe(10);
  });

  it("top_assister correct → 15 pts", () => {
    expect(scoreExtra({ kind: "TOP_ASSISTER", value: "Pedri" }, "Pedri", R)).toBe(15);
  });

  it("most_goals_team correct → 10 pts", () => {
    expect(scoreExtra({ kind: "MOST_GOALS_TEAM", value: "España" }, "España", R)).toBe(10);
  });

  it("most_conceded_team correct → 10 pts", () => {
    expect(scoreExtra({ kind: "MOST_CONCEDED_TEAM", value: "Qatar" }, "Qatar", R)).toBe(10);
  });

  it("wrong prediction → 0 pts", () => {
    expect(scoreExtra({ kind: "TOP_SCORER", value: "Kane" }, "Mbappé", R)).toBe(0);
  });

  it("case insensitive with whitespace", () => {
    expect(scoreExtra({ kind: "TOP_SCORER", value: "  MBAPPÉ  " }, "mbappé", R)).toBe(15);
  });
});

// ── calculateTotal ─────────────────────────────────────────────────

describe("calculateTotal", () => {
  it("sums all three categories", () => {
    const result = calculateTotal({
      matchResults: [
        { points: 3, exact_hit: true },
        { points: 1, exact_hit: false },
        { points: 0, exact_hit: false },
        { points: 6, exact_hit: true },  // Spain exact
      ],
      eliminations: [2, 5, 8, 25, 13],
      extras: [15, 10, 0],
    });

    expect(result.results).toBe(10);
    expect(result.classifications).toBe(53);
    expect(result.extras).toBe(25);
    expect(result.total).toBe(88);
    expect(result.exact_hits).toBe(2);
  });

  it("handles empty inputs", () => {
    const result = calculateTotal({
      matchResults: [],
      eliminations: [],
      extras: [],
    });
    expect(result.total).toBe(0);
    expect(result.exact_hits).toBe(0);
  });

  it("total equals sum of categories", () => {
    const result = calculateTotal({
      matchResults: [{ points: 7, exact_hit: false }],
      eliminations: [13],
      extras: [15],
    });
    expect(result.total).toBe(result.results + result.classifications + result.extras);
  });
});
