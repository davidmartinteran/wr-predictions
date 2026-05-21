import { describe, it, expect } from "vitest";
import {
  scoreGroupMatch,
  scoreGroupQualifiers,
  scoreKnockout,
  scoreExtra,
  scoreFirstScorer,
  calculateTotal,
  type ScoringRules,
  type MatchPrediction,
  type MatchResult,
  type GroupQualifierPrediction,
  type GroupQualifierResult,
  type KnockoutPrediction,
  type ExtraPrediction,
} from "./engine";

const DEFAULT_RULES: ScoringRules = {
  group_match_sign: 1,
  group_match_exact: 3,
  group_qualifier_any: 2,
  group_qualifier_first: 3,
  knockout_r16: 4,
  knockout_qf: 8,
  knockout_sf: 16,
  champion: 40,
  top_scorer: 15,
  best_player: 10,
  top_assister: 15,
  most_goals_team: 10,
  most_conceded_team: 10,
  runner_up: 20,
  third_place: 15,
  spain_elim_round: 15,
  spain_elim_rival: 10,
  first_scorer_esp: 10,
};

describe("scoreGroupMatch", () => {
  it("returns exact points for exact score", () => {
    const pred: MatchPrediction = { home_score: 2, away_score: 1 };
    const result: MatchResult = { home_score: 2, away_score: 1 };
    const s = scoreGroupMatch(pred, result, DEFAULT_RULES);
    expect(s.points).toBe(3);
    expect(s.exact_hit).toBe(true);
  });

  it("returns sign points for correct winner but wrong score", () => {
    const pred: MatchPrediction = { home_score: 3, away_score: 0 };
    const result: MatchResult = { home_score: 1, away_score: 0 };
    const s = scoreGroupMatch(pred, result, DEFAULT_RULES);
    expect(s.points).toBe(1);
    expect(s.exact_hit).toBe(false);
  });

  it("returns sign points for correct draw but wrong score", () => {
    const pred: MatchPrediction = { home_score: 0, away_score: 0 };
    const result: MatchResult = { home_score: 1, away_score: 1 };
    const s = scoreGroupMatch(pred, result, DEFAULT_RULES);
    expect(s.points).toBe(1);
    expect(s.exact_hit).toBe(false);
  });

  it("returns 0 for wrong sign", () => {
    const pred: MatchPrediction = { home_score: 2, away_score: 0 };
    const result: MatchResult = { home_score: 0, away_score: 1 };
    const s = scoreGroupMatch(pred, result, DEFAULT_RULES);
    expect(s.points).toBe(0);
    expect(s.exact_hit).toBe(false);
  });

  it("exact match on 0-0 gives exact points", () => {
    const pred: MatchPrediction = { home_score: 0, away_score: 0 };
    const result: MatchResult = { home_score: 0, away_score: 0 };
    const s = scoreGroupMatch(pred, result, DEFAULT_RULES);
    expect(s.points).toBe(3);
    expect(s.exact_hit).toBe(true);
  });

  it("uses custom rules values", () => {
    const rules = { ...DEFAULT_RULES, group_match_exact: 5, group_match_sign: 2 };
    const pred: MatchPrediction = { home_score: 1, away_score: 0 };
    const result: MatchResult = { home_score: 1, away_score: 0 };
    expect(scoreGroupMatch(pred, result, rules).points).toBe(5);

    const pred2: MatchPrediction = { home_score: 2, away_score: 0 };
    expect(scoreGroupMatch(pred2, result, rules).points).toBe(2);
  });
});

describe("scoreGroupQualifiers", () => {
  it("returns first points for correct 1st place", () => {
    const pred: GroupQualifierPrediction = { first: "ESP", second: "MEX" };
    const result: GroupQualifierResult = { first: "ESP", second: "GER" };
    const s = scoreGroupQualifiers(pred, result, DEFAULT_RULES);
    // ESP correct as 1st = group_qualifier_first (3). MEX not in top 2 = 0.
    expect(s.points).toBe(3);
  });

  it("returns any points for correct qualifier in wrong position", () => {
    const pred: GroupQualifierPrediction = { first: "MEX", second: "ESP" };
    const result: GroupQualifierResult = { first: "ESP", second: "MEX" };
    const s = scoreGroupQualifiers(pred, result, DEFAULT_RULES);
    // MEX predicted 1st, actually 2nd = qualifier_any (2). ESP predicted 2nd, actually 1st = qualifier_any (2).
    expect(s.points).toBe(4);
  });

  it("returns first + any for both correct with 1st exact", () => {
    const pred: GroupQualifierPrediction = { first: "ESP", second: "MEX" };
    const result: GroupQualifierResult = { first: "ESP", second: "MEX" };
    const s = scoreGroupQualifiers(pred, result, DEFAULT_RULES);
    // ESP 1st exact = 3. MEX 2nd exact = also qualifier_first?
    // Spec says: "1º de grupo exacto = 3", "Clasificado de grupo (cualquier posición) = 2"
    // So: ESP 1st exact = 3, MEX 2nd exact = 3 (also exact position)
    expect(s.points).toBe(6);
  });

  it("returns 0 for completely wrong", () => {
    const pred: GroupQualifierPrediction = { first: "ARG", second: "BRA" };
    const result: GroupQualifierResult = { first: "ESP", second: "MEX" };
    const s = scoreGroupQualifiers(pred, result, DEFAULT_RULES);
    expect(s.points).toBe(0);
  });

  it("returns any for one correct qualifier", () => {
    const pred: GroupQualifierPrediction = { first: "ARG", second: "ESP" };
    const result: GroupQualifierResult = { first: "ESP", second: "MEX" };
    const s = scoreGroupQualifiers(pred, result, DEFAULT_RULES);
    // ARG not in result = 0. ESP predicted 2nd, actually 1st = qualifier_any (2).
    expect(s.points).toBe(2);
  });
});

describe("scoreKnockout", () => {
  it("scores R16 correctly", () => {
    const pred: KnockoutPrediction = { stage: "R16", team: "ESP" };
    const result = "ESP";
    expect(scoreKnockout(pred, result, DEFAULT_RULES)).toBe(4);
  });

  it("scores QF correctly", () => {
    const pred: KnockoutPrediction = { stage: "QF", team: "ESP" };
    expect(scoreKnockout(pred, "ESP", DEFAULT_RULES)).toBe(8);
  });

  it("scores SF correctly", () => {
    const pred: KnockoutPrediction = { stage: "SF", team: "ESP" };
    expect(scoreKnockout(pred, "ESP", DEFAULT_RULES)).toBe(16);
  });

  it("scores champion correctly", () => {
    const pred: KnockoutPrediction = { stage: "CHAMPION", team: "ESP" };
    expect(scoreKnockout(pred, "ESP", DEFAULT_RULES)).toBe(40);
  });

  it("returns 0 for wrong prediction", () => {
    const pred: KnockoutPrediction = { stage: "QF", team: "ESP" };
    expect(scoreKnockout(pred, "GER", DEFAULT_RULES)).toBe(0);
  });
});

describe("scoreExtra", () => {
  it("scores top_scorer correctly (case insensitive)", () => {
    const pred: ExtraPrediction = { kind: "TOP_SCORER", value: "Mbappé" };
    expect(scoreExtra(pred, "mbappé", DEFAULT_RULES)).toBe(15);
  });

  it("scores best_player correctly", () => {
    const pred: ExtraPrediction = { kind: "BEST_PLAYER", value: "Messi" };
    expect(scoreExtra(pred, "Messi", DEFAULT_RULES)).toBe(10);
  });

  it("returns 0 for wrong prediction", () => {
    const pred: ExtraPrediction = { kind: "TOP_SCORER", value: "Mbappé" };
    expect(scoreExtra(pred, "Kane", DEFAULT_RULES)).toBe(0);
  });

  it("scores top_assister correctly", () => {
    const pred: ExtraPrediction = { kind: "TOP_ASSISTER", value: "Lamine Yamal" };
    expect(scoreExtra(pred, "Lamine Yamal", DEFAULT_RULES)).toBe(15);
  });

  it("scores runner_up correctly", () => {
    const pred: ExtraPrediction = { kind: "RUNNER_UP", value: "Inglaterra" };
    expect(scoreExtra(pred, "Inglaterra", DEFAULT_RULES)).toBe(20);
  });

  it("scores third_place correctly", () => {
    const pred: ExtraPrediction = { kind: "THIRD_PLACE", value: "Francia" };
    expect(scoreExtra(pred, "Francia", DEFAULT_RULES)).toBe(15);
  });

  it("scores most_goals_team correctly", () => {
    const pred: ExtraPrediction = { kind: "MOST_GOALS_TEAM", value: "España" };
    expect(scoreExtra(pred, "España", DEFAULT_RULES)).toBe(10);
  });

  it("scores most_conceded_team correctly", () => {
    const pred: ExtraPrediction = { kind: "MOST_CONCEDED_TEAM", value: "Arabia Saudí" };
    expect(scoreExtra(pred, "Arabia Saudí", DEFAULT_RULES)).toBe(10);
  });

  it("scores spain_elim_round correctly", () => {
    const pred: ExtraPrediction = { kind: "SPAIN_ELIM_ROUND", value: "CHAMPION" };
    expect(scoreExtra(pred, "CHAMPION", DEFAULT_RULES)).toBe(15);
  });

  it("scores spain_elim_rival correctly", () => {
    const pred: ExtraPrediction = { kind: "SPAIN_ELIM_RIVAL", value: "Francia" };
    expect(scoreExtra(pred, "Francia", DEFAULT_RULES)).toBe(10);
  });

  it("returns 0 for wrong team prediction", () => {
    const pred: ExtraPrediction = { kind: "MOST_GOALS_TEAM", value: "España" };
    expect(scoreExtra(pred, "Francia", DEFAULT_RULES)).toBe(0);
  });
});

describe("scoreFirstScorer", () => {
  it("returns true for exact match", () => {
    expect(scoreFirstScorer("Morata", "Morata")).toBe(true);
  });

  it("matches case-insensitive", () => {
    expect(scoreFirstScorer("morata", "Morata")).toBe(true);
  });

  it("trims whitespace", () => {
    expect(scoreFirstScorer("  Morata ", "Morata")).toBe(true);
  });

  it("returns false for wrong player", () => {
    expect(scoreFirstScorer("Morata", "Lamine Yamal")).toBe(false);
  });
});

describe("calculateTotal", () => {
  it("sums all categories and counts exact hits", () => {
    const result = calculateTotal({
      groupMatches: [
        { points: 3, exact_hit: true },
        { points: 1, exact_hit: false },
        { points: 0, exact_hit: false },
        { points: 3, exact_hit: true },
      ],
      groupQualifiers: [
        { points: 6 },
        { points: 2 },
      ],
      knockout: [4, 8, 0],
      extras: [15, 0],
      firstScorerEsp: [10, 0, 10],
    });

    expect(result.group_matches).toBe(7);
    expect(result.group_qualifiers).toBe(8);
    expect(result.knockout).toBe(12);
    expect(result.extras).toBe(15);
    expect(result.first_scorer_esp).toBe(20);
    expect(result.total).toBe(62);
    expect(result.exact_hits).toBe(2);
  });

  it("handles empty inputs", () => {
    const result = calculateTotal({
      groupMatches: [],
      groupQualifiers: [],
      knockout: [],
      extras: [],
      firstScorerEsp: [],
    });
    expect(result.total).toBe(0);
    expect(result.exact_hits).toBe(0);
  });
});
