// ── Scoring Rules ──────────────────────────────────────────────────

export type ScoringRules = {
  match_sign: number;
  match_exact: number;
  spain_multiplier: number;

  elim_group: number;
  elim_r32: number;
  elim_r16: number;
  elim_qf: number;
  elim_sf: number;
  elim_runner_up: number;
  elim_champion: number;
  distance_1: number;
  distance_2: number;

  top_scorer: number;
  top_assister: number;
  best_player: number;
  most_goals_team: number;
  most_conceded_team: number;
};

export const DEFAULT_RULES: ScoringRules = {
  match_sign: 1,
  match_exact: 3,
  spain_multiplier: 2,

  elim_group: 2,
  elim_r32: 3,
  elim_r16: 5,
  elim_qf: 8,
  elim_sf: 12,
  elim_runner_up: 18,
  elim_champion: 25,
  distance_1: 0.5,
  distance_2: 0.25,

  top_scorer: 15,
  top_assister: 15,
  best_player: 10,
  most_goals_team: 10,
  most_conceded_team: 10,
};

// ── Match Scoring (Resultados) ─────────────────────────────────────

export type MatchPrediction = { home_score: number; away_score: number };
export type MatchResult = { home_score: number; away_score: number };
export type MatchScore = { points: number; exact_hit: boolean };

function getSign(home: number, away: number): "1" | "X" | "2" {
  if (home > away) return "1";
  if (home < away) return "2";
  return "X";
}

export function scoreGroupMatch(
  pred: MatchPrediction,
  result: MatchResult,
  rules: ScoringRules,
  isSpain = false
): MatchScore {
  const mult = isSpain ? rules.spain_multiplier : 1;

  if (pred.home_score === result.home_score && pred.away_score === result.away_score) {
    return { points: rules.match_exact * mult, exact_hit: true };
  }
  if (getSign(pred.home_score, pred.away_score) === getSign(result.home_score, result.away_score)) {
    return { points: rules.match_sign * mult, exact_hit: false };
  }
  return { points: 0, exact_hit: false };
}

// ── Elimination Scoring (Clasificación final) ──────────────────────

export type EliminationRound =
  | "GROUP"
  | "R32"
  | "R16"
  | "QF"
  | "SF"
  | "RUNNER_UP"
  | "CHAMPION";

export const ROUND_ORDER: EliminationRound[] = [
  "GROUP",
  "R32",
  "R16",
  "QF",
  "SF",
  "RUNNER_UP",
  "CHAMPION",
];

const ROUND_RULES: Record<EliminationRound, keyof ScoringRules> = {
  GROUP: "elim_group",
  R32: "elim_r32",
  R16: "elim_r16",
  QF: "elim_qf",
  SF: "elim_sf",
  RUNNER_UP: "elim_runner_up",
  CHAMPION: "elim_champion",
};

export function scoreElimination(
  predicted: EliminationRound,
  actual: EliminationRound,
  rules: ScoringRules,
  isSpain = false
): number {
  const predIdx = ROUND_ORDER.indexOf(predicted);
  const actualIdx = ROUND_ORDER.indexOf(actual);
  const distance = Math.abs(predIdx - actualIdx);

  let fraction: number;
  if (distance === 0) fraction = 1;
  else if (distance === 1) fraction = rules.distance_1;
  else if (distance === 2) fraction = rules.distance_2;
  else fraction = 0;

  if (fraction === 0) return 0;

  const ruleKey = ROUND_RULES[predicted];
  const basePoints = rules[ruleKey] as number;
  const mult = isSpain ? rules.spain_multiplier : 1;

  return Math.round(basePoints * fraction * mult);
}

// ── Extras Scoring ─────────────────────────────────────────────────

export type ExtraKind =
  | "TOP_SCORER"
  | "BEST_PLAYER"
  | "TOP_ASSISTER"
  | "MOST_GOALS_TEAM"
  | "MOST_CONCEDED_TEAM";

export type ExtraPrediction = { kind: ExtraKind; value: string };

const EXTRA_RULES: Record<ExtraKind, keyof ScoringRules> = {
  TOP_SCORER: "top_scorer",
  BEST_PLAYER: "best_player",
  TOP_ASSISTER: "top_assister",
  MOST_GOALS_TEAM: "most_goals_team",
  MOST_CONCEDED_TEAM: "most_conceded_team",
};

export function scoreExtra(
  pred: ExtraPrediction,
  actualValue: string,
  rules: ScoringRules
): number {
  if (pred.value.toLowerCase().trim() !== actualValue.toLowerCase().trim()) return 0;
  const ruleKey = EXTRA_RULES[pred.kind];
  return rules[ruleKey] as number;
}

// ── Total Calculation ──────────────────────────────────────────────

type TotalInput = {
  matchResults: MatchScore[];
  eliminations: number[];
  extras: number[];
};

export function calculateTotal(input: TotalInput) {
  const results = input.matchResults.reduce((s, m) => s + m.points, 0);
  const classifications = input.eliminations.reduce((s, e) => s + e, 0);
  const extras = input.extras.reduce((s, e) => s + e, 0);
  const exact_hits = input.matchResults.filter((m) => m.exact_hit).length;

  return {
    results,
    classifications,
    extras,
    total: results + classifications + extras,
    exact_hits,
  };
}
