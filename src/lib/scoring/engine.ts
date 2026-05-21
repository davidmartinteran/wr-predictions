export type ScoringRules = {
  group_match_sign: number;
  group_match_exact: number;
  group_qualifier_any: number;
  group_qualifier_first: number;
  knockout_r16: number;
  knockout_qf: number;
  knockout_sf: number;
  champion: number;
  top_scorer: number;
  best_player: number;
  top_assister: number;
  most_goals_team: number;
  most_conceded_team: number;
  runner_up: number;
  third_place: number;
  spain_elim_round: number;
  spain_elim_rival: number;
  first_scorer_esp: number;
};

export type MatchPrediction = {
  home_score: number;
  away_score: number;
};

export type MatchResult = {
  home_score: number;
  away_score: number;
};

export type GroupQualifierPrediction = {
  first: string;
  second: string;
};

export type GroupQualifierResult = {
  first: string;
  second: string;
};

export type KnockoutPrediction = {
  stage: "R32" | "R16" | "QF" | "SF" | "FINAL" | "CHAMPION";
  team: string;
};

export type ExtraPrediction = {
  kind:
    | "TOP_SCORER"
    | "BEST_PLAYER"
    | "TOP_ASSISTER"
    | "MOST_GOALS_TEAM"
    | "MOST_CONCEDED_TEAM"
    | "RUNNER_UP"
    | "THIRD_PLACE"
    | "SPAIN_ELIM_ROUND"
    | "SPAIN_ELIM_RIVAL";
  value: string;
};

export type FirstScorerPrediction = {
  match_id: string;
  player_name: string;
};

type MatchScore = { points: number; exact_hit: boolean };

function getSign(home: number, away: number): "1" | "X" | "2" {
  if (home > away) return "1";
  if (home < away) return "2";
  return "X";
}

export function scoreGroupMatch(
  pred: MatchPrediction,
  result: MatchResult,
  rules: ScoringRules
): MatchScore {
  if (pred.home_score === result.home_score && pred.away_score === result.away_score) {
    return { points: rules.group_match_exact, exact_hit: true };
  }
  if (getSign(pred.home_score, pred.away_score) === getSign(result.home_score, result.away_score)) {
    return { points: rules.group_match_sign, exact_hit: false };
  }
  return { points: 0, exact_hit: false };
}

export function scoreGroupQualifiers(
  pred: GroupQualifierPrediction,
  result: GroupQualifierResult,
  rules: ScoringRules
): { points: number } {
  let points = 0;
  const qualifiers = [result.first, result.second];

  if (pred.first === result.first) {
    points += rules.group_qualifier_first;
  } else if (qualifiers.includes(pred.first)) {
    points += rules.group_qualifier_any;
  }

  if (pred.second === result.second) {
    points += rules.group_qualifier_first;
  } else if (qualifiers.includes(pred.second)) {
    points += rules.group_qualifier_any;
  }

  return { points };
}

const KNOCKOUT_STAGE_RULES: Record<string, keyof ScoringRules> = {
  R16: "knockout_r16",
  QF: "knockout_qf",
  SF: "knockout_sf",
  CHAMPION: "champion",
};

export function scoreKnockout(
  pred: KnockoutPrediction,
  actualTeam: string,
  rules: ScoringRules
): number {
  if (pred.team !== actualTeam) return 0;
  const ruleKey = KNOCKOUT_STAGE_RULES[pred.stage];
  if (!ruleKey) return 0;
  return rules[ruleKey] as number;
}

const EXTRA_KIND_RULES: Record<ExtraPrediction["kind"], keyof ScoringRules> = {
  TOP_SCORER: "top_scorer",
  BEST_PLAYER: "best_player",
  TOP_ASSISTER: "top_assister",
  MOST_GOALS_TEAM: "most_goals_team",
  MOST_CONCEDED_TEAM: "most_conceded_team",
  RUNNER_UP: "runner_up",
  THIRD_PLACE: "third_place",
  SPAIN_ELIM_ROUND: "spain_elim_round",
  SPAIN_ELIM_RIVAL: "spain_elim_rival",
};

export function scoreExtra(
  pred: ExtraPrediction,
  actualValue: string,
  rules: ScoringRules
): number {
  const match = pred.value.toLowerCase().trim() === actualValue.toLowerCase().trim();
  if (!match) return 0;
  const ruleKey = EXTRA_KIND_RULES[pred.kind];
  return rules[ruleKey] as number;
}

export function scoreFirstScorer(
  predPlayerName: string,
  actualFirstScorerName: string
): boolean {
  return predPlayerName.toLowerCase().trim() === actualFirstScorerName.toLowerCase().trim();
}

type TotalInput = {
  groupMatches: MatchScore[];
  groupQualifiers: { points: number }[];
  knockout: number[];
  extras: number[];
  firstScorerEsp: number[];
};

export function calculateTotal(input: TotalInput) {
  const group_matches = input.groupMatches.reduce((s, m) => s + m.points, 0);
  const group_qualifiers = input.groupQualifiers.reduce((s, g) => s + g.points, 0);
  const knockout = input.knockout.reduce((s, k) => s + k, 0);
  const extras = input.extras.reduce((s, e) => s + e, 0);
  const first_scorer_esp = input.firstScorerEsp.reduce((s, f) => s + f, 0);
  const exact_hits = input.groupMatches.filter((m) => m.exact_hit).length;

  return {
    group_matches,
    group_qualifiers,
    knockout,
    extras,
    first_scorer_esp,
    total: group_matches + group_qualifiers + knockout + extras + first_scorer_esp,
    exact_hits,
  };
}
