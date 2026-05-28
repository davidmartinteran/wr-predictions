import { describe, it, expect } from "vitest";
import {
  scoreGroupMatch,
  scoreElimination,
  scoreExtra,
  calculateTotal,
  DEFAULT_RULES,
  ROUND_ORDER,
  type MatchResult,
  type MatchPrediction,
  type MatchScore,
  type ExtraPrediction,
  type EliminationRound,
} from "./engine";

const R = DEFAULT_RULES;

// ── World Cup 2026 simulation ──────────────────────────────────────
// 12 groups (A-L), 4 teams each, 3 matchdays = 72 group matches
// Then R32(16) → R16(8) → QF(4) → SF(2) → Final(1)

// ── Group definitions ──────────────────────────────────────────────
// Match order per group: T1vT2, T3vT4, T1vT3, T2vT4, T1vT4, T2vT3

type GroupDef = {
  teams: [string, string, string, string];
  results: [number, number][];
};

const GROUPS: Record<string, GroupDef> = {
  A: { teams: ["ESP", "ECU", "NZL", "BEL"], results: [[2,0],[1,1],[3,0],[2,1],[1,0],[0,1]] },
  B: { teams: ["POR", "IRN", "MEX", "USA"], results: [[2,0],[0,1],[1,1],[1,2],[3,0],[2,1]] },
  C: { teams: ["FRA", "AUS", "DEN", "TUN"], results: [[3,1],[0,0],[2,0],[1,0],[4,0],[1,1]] },
  D: { teams: ["ARG", "NGA", "KSA", "POL"], results: [[1,0],[2,1],[2,0],[0,1],[3,0],[1,0]] },
  E: { teams: ["BRA", "SUI", "CMR", "SRB"], results: [[1,0],[2,1],[2,1],[0,0],[3,0],[1,1]] },
  F: { teams: ["ENG", "JPN", "CRC", "GER"], results: [[2,1],[0,3],[1,0],[1,2],[0,0],[1,0]] },
  G: { teams: ["NED", "SEN", "QAT", "URU"], results: [[2,0],[0,2],[1,1],[0,3],[2,0],[1,0]] },
  H: { teams: ["CRO", "CAN", "MAR", "KOR"], results: [[1,0],[2,1],[0,0],[2,0],[2,1],[0,1]] },
  I: { teams: ["COL", "EGY", "CHI", "WAL"], results: [[2,0],[1,0],[1,1],[2,1],[3,0],[0,0]] },
  J: { teams: ["ITA", "GHA", "UKR", "PER"], results: [[2,0],[1,1],[1,0],[2,0],[3,0],[1,0]] },
  K: { teams: ["JOR", "CIV", "PAR", "ALG"], results: [[0,1],[2,0],[1,2],[1,0],[0,0],[3,1]] },
  L: { teams: ["TUR", "CHN", "AUT", "SCO"], results: [[1,0],[2,1],[2,0],[0,1],[1,1],[0,2]] },
};

const PAIRINGS: [number, number][] = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]];

type SimMatch = {
  id: string;
  group: string;
  home: string;
  away: string;
  result: MatchResult;
};

function buildGroupMatches(): SimMatch[] {
  const out: SimMatch[] = [];
  let n = 1;
  for (const [g, { teams, results }] of Object.entries(GROUPS)) {
    for (let i = 0; i < 6; i++) {
      const [hi, ai] = PAIRINGS[i];
      out.push({
        id: `m-${g}${n++}`,
        group: g,
        home: teams[hi],
        away: teams[ai],
        result: { home_score: results[i][0], away_score: results[i][1] },
      });
    }
  }
  return out;
}

function deriveStandings(group: string, matches: SimMatch[]) {
  const gm = matches.filter((m) => m.group === group);
  const s: Record<string, { pts: number; gd: number; gf: number }> = {};
  for (const m of gm) {
    s[m.home] ??= { pts: 0, gd: 0, gf: 0 };
    s[m.away] ??= { pts: 0, gd: 0, gf: 0 };
    const h = m.result.home_score, a = m.result.away_score;
    s[m.home].gf += h; s[m.home].gd += h - a;
    s[m.away].gf += a; s[m.away].gd += a - h;
    if (h > a) s[m.home].pts += 3;
    else if (h < a) s[m.away].pts += 3;
    else { s[m.home].pts += 1; s[m.away].pts += 1; }
  }
  const sorted = Object.entries(s)
    .sort(([,a], [,b]) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    .map(([team]) => team);
  return { first: sorted[0], second: sorted[1], third: sorted[2], fourth: sorted[3] };
}

const allMatches = buildGroupMatches();
const allStandings: Record<string, ReturnType<typeof deriveStandings>> = {};
for (const g of "ABCDEFGHIJKL".split("")) {
  allStandings[g] = deriveStandings(g, allMatches);
}

// ── Actual tournament results ──────────────────────────────────────
// Define what actually happens in the knockout stage

// Teams that qualify from groups (1st + 2nd from each group + 8 best 3rds)
// For simplicity, best 8 thirds: groups A,C,D,E,F,G,H,I
const QUALIFYING_THIRDS = ["NZL","DEN","KSA","CMR","CRC","QAT","MAR","CHI"];

// Actual elimination round for every team (48 teams)
// Eliminated in GROUP: 16 teams (4th of each group = 16, minus 8 thirds that qualify = the other 4 thirds + all 4ths)
// Actually: 12 fourths + 4 thirds that don't qualify = 16
// Qualify: 12 firsts + 12 seconds + 8 thirds = 32

const ACTUAL_ELIM: Record<string, EliminationRound> = {};

// Set all teams to GROUP initially
for (const { teams } of Object.values(GROUPS)) {
  for (const t of teams) ACTUAL_ELIM[t] = "GROUP";
}

// Teams that pass groups → at least R32 elimination
const R32_TEAMS: string[] = [];
for (const g of "ABCDEFGHIJKL".split("")) {
  R32_TEAMS.push(allStandings[g].first, allStandings[g].second);
}
for (const t of QUALIFYING_THIRDS) R32_TEAMS.push(t);
for (const t of R32_TEAMS) ACTUAL_ELIM[t] = "R32";

// R16 qualifiers (win R32)
const R16_TEAMS = ["ESP", "FRA", "BRA", "NED", "COL", "ITA", "ARG", "ENG",
                   "POR", "CRO", "GER", "URU", "BEL", "USA", "SUI", "TUR"];
for (const t of R16_TEAMS) ACTUAL_ELIM[t] = "R16";

// QF qualifiers (win R16)
const QF_TEAMS = ["ESP", "FRA", "BRA", "NED", "COL", "ITA", "ARG", "ENG"];
for (const t of QF_TEAMS) ACTUAL_ELIM[t] = "QF";

// SF qualifiers (win QF)
const SF_TEAMS = ["ESP", "BRA", "ARG", "ENG"];
for (const t of SF_TEAMS) ACTUAL_ELIM[t] = "SF";

// Finalists
ACTUAL_ELIM["ESP"] = "CHAMPION";
ACTUAL_ELIM["ARG"] = "RUNNER_UP";

// Extras results
const EXTRAS_ACTUAL: Record<string, string> = {
  TOP_SCORER: "Mbappé",
  BEST_PLAYER: "Lamine Yamal",
  TOP_ASSISTER: "Pedri",
  MOST_GOALS_TEAM: "España",
  MOST_CONCEDED_TEAM: "Qatar",
};

// Spain match IDs
const spainMatchIds = allMatches.filter((m) => m.home === "ESP" || m.away === "ESP").map((m) => m.id);

// ── Helper to derive predicted elimination from bracket ────────────

function derivePredictedElim(
  groupPreds: Record<string, { first: string; second: string }>,
  qualifyingThirdsPred: string[],
  r16Winners: string[],
  qfWinners: string[],
  sfWinners: string[],
  champion: string,
  runnerUp: string,
): Record<string, EliminationRound> {
  const elim: Record<string, EliminationRound> = {};

  // All 48 teams start as GROUP
  for (const { teams } of Object.values(GROUPS)) {
    for (const t of teams) elim[t] = "GROUP";
  }

  // Group qualifiers → R32
  for (const g of "ABCDEFGHIJKL".split("")) {
    const pred = groupPreds[g];
    if (pred) {
      elim[pred.first] = "R32";
      elim[pred.second] = "R32";
    }
  }
  for (const t of qualifyingThirdsPred) elim[t] = "R32";

  // R16 winners → they survived R32, their actual elim is at least R16
  for (const t of r16Winners) elim[t] = "R16";

  // QF winners → survived R16
  for (const t of qfWinners) elim[t] = "QF";

  // SF winners → survived QF
  for (const t of sfWinners) elim[t] = "SF";

  // Runner-up and champion
  elim[runnerUp] = "RUNNER_UP";
  elim[champion] = "CHAMPION";

  return elim;
}

// ── Player profiles ────────────────────────────────────────────────

function isSpainMatch(m: SimMatch) {
  return m.home === "ESP" || m.away === "ESP";
}

type PlayerResult = ReturnType<typeof calculateTotal> & {
  matchDetails: MatchScore[];
  elimDetails: { team: string; predicted: EliminationRound; actual: EliminationRound; points: number }[];
  extraDetails: { kind: string; predicted: string; actual: string; points: number }[];
};

function scorePlayer(
  matchPreds: Record<string, MatchPrediction>,
  predictedElim: Record<string, EliminationRound>,
  extraPreds: ExtraPrediction[],
): PlayerResult {
  // 1. Match results
  const matchDetails = allMatches.map((m) => {
    const pred = matchPreds[m.id];
    if (!pred) return { points: 0, exact_hit: false };
    return scoreGroupMatch(pred, m.result, R, isSpainMatch(m));
  });

  // 2. Eliminations (48 teams)
  const allTeams = Object.values(GROUPS).flatMap((g) => g.teams);
  const elimDetails = allTeams.map((team) => {
    const predicted = predictedElim[team] ?? "GROUP";
    const actual = ACTUAL_ELIM[team];
    const points = scoreElimination(predicted, actual, R, team === "ESP");
    return { team, predicted, actual, points };
  });
  const elimScores = elimDetails.map((d) => d.points);

  // 3. Extras
  const extraDetails = extraPreds.map((pred) => {
    const actual = EXTRAS_ACTUAL[pred.kind] ?? "";
    const points = scoreExtra(pred, actual, R);
    return { kind: pred.kind, predicted: pred.value, actual, points };
  });
  const extraScores = extraDetails.map((d) => d.points);

  const totals = calculateTotal({
    matchResults: matchDetails,
    eliminations: elimScores,
    extras: extraScores,
  });

  return { ...totals, matchDetails, elimDetails, extraDetails };
}

// ── Deterministic hash for "randomness" ────────────────────────────
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ── Player 1: "El Oráculo" — perfect everything ───────────────────

function buildOracle() {
  const matchPreds: Record<string, MatchPrediction> = {};
  for (const m of allMatches) {
    matchPreds[m.id] = { home_score: m.result.home_score, away_score: m.result.away_score };
  }

  const groupPreds: Record<string, { first: string; second: string }> = {};
  for (const g of "ABCDEFGHIJKL".split("")) {
    groupPreds[g] = { first: allStandings[g].first, second: allStandings[g].second };
  }

  const predictedElim = { ...ACTUAL_ELIM };

  const extras: ExtraPrediction[] = [
    { kind: "TOP_SCORER", value: "Mbappé" },
    { kind: "BEST_PLAYER", value: "Lamine Yamal" },
    { kind: "TOP_ASSISTER", value: "Pedri" },
    { kind: "MOST_GOALS_TEAM", value: "España" },
    { kind: "MOST_CONCEDED_TEAM", value: "Qatar" },
  ];

  return { matchPreds, predictedElim, extras };
}

// ── Player 2: "El Buen Ojo" — decent, ~60% signs, some knockouts ──

function buildDecentPlayer() {
  const matchPreds: Record<string, MatchPrediction> = {};
  for (const m of allMatches) {
    const r = hash(m.id) % 10;
    const h = m.result.home_score, a = m.result.away_score;
    if (r < 2) {
      matchPreds[m.id] = { home_score: h, away_score: a }; // 20% exact
    } else if (r < 6) {
      // 40% correct sign, wrong score
      if (h > a) matchPreds[m.id] = { home_score: h + 1, away_score: a };
      else if (h < a) matchPreds[m.id] = { home_score: h, away_score: a + 1 };
      else matchPreds[m.id] = { home_score: 1, away_score: 1 };
    } else {
      // 40% wrong sign
      if (h >= a) matchPreds[m.id] = { home_score: 0, away_score: 2 };
      else matchPreds[m.id] = { home_score: 2, away_score: 0 };
    }
  }

  // Predicts most teams close to correct, some off
  const predictedElim: Record<string, EliminationRound> = {};
  for (const { teams } of Object.values(GROUPS)) {
    for (const t of teams) {
      const actual = ACTUAL_ELIM[t];
      const r = hash(t) % 5;
      if (r < 2) {
        predictedElim[t] = actual; // 40% exact
      } else if (r < 4) {
        // 40% off by 1
        const idx = ROUND_ORDER.indexOf(actual);
        const off = (hash(t + "off") % 2 === 0) ? 1 : -1;
        const newIdx = Math.max(0, Math.min(ROUND_ORDER.length - 1, idx + off));
        predictedElim[t] = ROUND_ORDER[newIdx];
      } else {
        // 20% off by 2+
        const idx = ROUND_ORDER.indexOf(actual);
        const newIdx = Math.max(0, idx - 2);
        predictedElim[t] = ROUND_ORDER[newIdx];
      }
    }
  }

  const extras: ExtraPrediction[] = [
    { kind: "TOP_SCORER", value: "Kane" },           // wrong
    { kind: "BEST_PLAYER", value: "Lamine Yamal" },  // correct
    { kind: "TOP_ASSISTER", value: "Pedri" },         // correct
    { kind: "MOST_GOALS_TEAM", value: "Francia" },    // wrong
    { kind: "MOST_CONCEDED_TEAM", value: "Qatar" },   // correct
  ];

  return { matchPreds, predictedElim, extras };
}

// ── Player 3: "El Bote" — nearly everything wrong ──────────────────

function buildBotePlayer() {
  const matchPreds: Record<string, MatchPrediction> = {};
  for (const m of allMatches) {
    const h = m.result.home_score, a = m.result.away_score;
    if (h >= a) matchPreds[m.id] = { home_score: 0, away_score: 3 };
    else matchPreds[m.id] = { home_score: 3, away_score: 0 };
  }

  // Predicts most teams way off
  const predictedElim: Record<string, EliminationRound> = {};
  for (const { teams } of Object.values(GROUPS)) {
    for (const t of teams) {
      const actual = ACTUAL_ELIM[t];
      if (actual === "CHAMPION") predictedElim[t] = "GROUP";
      else if (actual === "GROUP") predictedElim[t] = "CHAMPION";
      else {
        const idx = ROUND_ORDER.indexOf(actual);
        const opposite = ROUND_ORDER.length - 1 - idx;
        predictedElim[t] = ROUND_ORDER[opposite];
      }
    }
  }

  const extras: ExtraPrediction[] = [
    { kind: "TOP_SCORER", value: "Rashford" },
    { kind: "BEST_PLAYER", value: "Rashford" },
    { kind: "TOP_ASSISTER", value: "Rashford" },
    { kind: "MOST_GOALS_TEAM", value: "Canada" },
    { kind: "MOST_CONCEDED_TEAM", value: "España" },
  ];

  return { matchPreds, predictedElim, extras };
}

// ── Tests ──────────────────────────────────────────────────────────

describe("Full tournament simulation", () => {

  describe("Sanity checks", () => {
    it("72 group matches generated", () => {
      expect(allMatches).toHaveLength(72);
    });

    it("12 groups with valid standings", () => {
      for (const [g, s] of Object.entries(allStandings)) {
        expect(GROUPS[g].teams).toContain(s.first);
        expect(GROUPS[g].teams).toContain(s.second);
        expect(s.first).not.toBe(s.second);
      }
    });

    it("3 Spain group matches", () => {
      expect(spainMatchIds).toHaveLength(3);
    });

    it("48 teams have elimination rounds", () => {
      expect(Object.keys(ACTUAL_ELIM)).toHaveLength(48);
    });

    it("exactly 1 champion and 1 runner-up", () => {
      const champs = Object.values(ACTUAL_ELIM).filter((r) => r === "CHAMPION");
      const runners = Object.values(ACTUAL_ELIM).filter((r) => r === "RUNNER_UP");
      expect(champs).toHaveLength(1);
      expect(runners).toHaveLength(1);
    });
  });

  describe("El Oráculo — perfect predictions", () => {
    const { matchPreds, predictedElim, extras } = buildOracle();
    const result = scorePlayer(matchPreds, predictedElim, extras);

    it("72 exact hits", () => {
      expect(result.exact_hits).toBe(72);
    });

    it("results: 69×3 + 3×6 (Spain ×2) = 225", () => {
      // 69 normal exact (3 pts) + 3 Spain exact (6 pts)
      expect(result.results).toBe(69 * 3 + 3 * 6);
      expect(result.results).toBe(225);
    });

    it("classifications: all 48 teams exact", () => {
      // Every team predicted perfectly → full points for each
      // Sum depends on distribution of teams per round
      const groupElim = Object.values(ACTUAL_ELIM).filter((r) => r === "GROUP").length;
      const r32Elim = Object.values(ACTUAL_ELIM).filter((r) => r === "R32").length;
      const r16Elim = Object.values(ACTUAL_ELIM).filter((r) => r === "R16").length;
      const qfElim = Object.values(ACTUAL_ELIM).filter((r) => r === "QF").length;
      const sfElim = Object.values(ACTUAL_ELIM).filter((r) => r === "SF").length;
      const runnerUp = 1;
      const champion = 1;

      // Spain = CHAMPION → 25 × 2 = 50
      // All other teams at their normal rate
      const expectedNonSpain =
        groupElim * R.elim_group +
        r32Elim * R.elim_r32 +
        r16Elim * R.elim_r16 +
        qfElim * R.elim_qf +
        sfElim * R.elim_sf +
        runnerUp * R.elim_runner_up +
        champion * R.elim_champion;
      // Spain is already counted in champion above at base rate, add the extra multiplier
      const spainBonus = R.elim_champion; // one extra ×1 (since ×2 total - ×1 already counted)
      const expected = expectedNonSpain + spainBonus;

      expect(result.classifications).toBe(expected);
    });

    it("extras: 15+10+15+10+10 = 60", () => {
      expect(result.extras).toBe(60);
    });

    it("total = results + classifications + extras", () => {
      expect(result.total).toBe(result.results + result.classifications + result.extras);
    });

    it("total is the maximum achievable", () => {
      // This IS the max since everything is perfect
      expect(result.total).toBeGreaterThan(400);
    });
  });

  describe("El Buen Ojo — decent predictions", () => {
    const { matchPreds, predictedElim, extras } = buildDecentPlayer();
    const result = scorePlayer(matchPreds, predictedElim, extras);

    it("some but not all exact hits", () => {
      expect(result.exact_hits).toBeGreaterThan(0);
      expect(result.exact_hits).toBeLessThan(72);
    });

    it("results > 0 and < max (225)", () => {
      expect(result.results).toBeGreaterThan(0);
      expect(result.results).toBeLessThan(225);
    });

    it("classifications > 0 (distance gives partial credit)", () => {
      expect(result.classifications).toBeGreaterThan(0);
    });

    it("extras: 3 correct (10+15+10) = 35", () => {
      expect(result.extras).toBe(10 + 15 + 10);
      expect(result.extras).toBe(35);
    });

    it("total is between Bote and Oracle", () => {
      const oracle = scorePlayer(...Object.values(buildOracle()) as [any, any, any]);
      const bote = scorePlayer(...Object.values(buildBotePlayer()) as [any, any, any]);
      expect(result.total).toBeLessThan(oracle.total);
      expect(result.total).toBeGreaterThan(bote.total);
    });

    it("total = sum of categories", () => {
      expect(result.total).toBe(result.results + result.classifications + result.extras);
    });
  });

  describe("El Bote — almost everything wrong", () => {
    const { matchPreds, predictedElim, extras } = buildBotePlayer();
    const result = scorePlayer(matchPreds, predictedElim, extras);

    it("0 exact hits", () => {
      expect(result.exact_hits).toBe(0);
    });

    it("results: 0 (all wrong signs)", () => {
      // Every prediction has opposite sign
      expect(result.results).toBe(0);
    });

    it("classifications: mostly 0 (distance > 2 for most teams)", () => {
      // Predictions are inverted: CHAMPION predicted as GROUP, GROUP as CHAMPION
      // Distance for champion: |6-0| = 6 → 0 pts
      // Distance for group-stage teams: |0-6| = 6 → 0 pts
      // Some mid-table teams might be distance ≤ 2 though
      expect(result.classifications).toBeLessThan(80);
    });

    it("extras: 0 (all wrong)", () => {
      expect(result.extras).toBe(0);
    });

    it("total = sum of categories", () => {
      expect(result.total).toBe(result.results + result.classifications + result.extras);
    });

    it("total is the lowest of the three players", () => {
      const oracle = scorePlayer(...Object.values(buildOracle()) as [any, any, any]);
      const decent = scorePlayer(...Object.values(buildDecentPlayer()) as [any, any, any]);
      expect(result.total).toBeLessThan(decent.total);
      expect(result.total).toBeLessThan(oracle.total);
    });
  });

  describe("Scoring integrity", () => {
    it("no category returns negative points", () => {
      for (const build of [buildOracle, buildDecentPlayer, buildBotePlayer]) {
        const { matchPreds, predictedElim, extras } = build();
        const result = scorePlayer(matchPreds, predictedElim, extras);
        expect(result.results).toBeGreaterThanOrEqual(0);
        expect(result.classifications).toBeGreaterThanOrEqual(0);
        expect(result.extras).toBeGreaterThanOrEqual(0);
        expect(result.total).toBeGreaterThanOrEqual(0);
      }
    });

    it("exact_hits ≤ 72", () => {
      for (const build of [buildOracle, buildDecentPlayer, buildBotePlayer]) {
        const { matchPreds, predictedElim, extras } = build();
        const result = scorePlayer(matchPreds, predictedElim, extras);
        expect(result.exact_hits).toBeGreaterThanOrEqual(0);
        expect(result.exact_hits).toBeLessThanOrEqual(72);
      }
    });

    it("Spain matches get ×2 multiplier", () => {
      // Score a Spain match as exact → should be 6, not 3
      const spainMatch = allMatches.find((m) => isSpainMatch(m))!;
      const s = scoreGroupMatch(
        { home_score: spainMatch.result.home_score, away_score: spainMatch.result.away_score },
        spainMatch.result,
        R,
        true
      );
      expect(s.points).toBe(6);

      // Same match without Spain flag → 3
      const s2 = scoreGroupMatch(
        { home_score: spainMatch.result.home_score, away_score: spainMatch.result.away_score },
        spainMatch.result,
        R,
        false
      );
      expect(s2.points).toBe(3);
    });

    it("Spain elimination gets ×2 multiplier", () => {
      // ESP = CHAMPION actual, predicted CHAMPION → 25 × 2 = 50
      const pts = scoreElimination("CHAMPION", "CHAMPION", R, true);
      expect(pts).toBe(50);

      // Non-Spain champion → 25
      const pts2 = scoreElimination("CHAMPION", "CHAMPION", R, false);
      expect(pts2).toBe(25);
    });

    it("distance mechanics work symmetrically", () => {
      // Predicted QF, actual SF (distance 1) = same as predicted SF, actual QF
      const a = scoreElimination("QF", "SF", R);
      const b = scoreElimination("SF", "QF", R);
      // Both use distance_1 (0.5) but on different base points
      // a = QF base (8) × 0.5 = 4
      // b = SF base (12) × 0.5 = 6
      expect(a).toBe(Math.round(8 * 0.5));
      expect(b).toBe(Math.round(12 * 0.5));
    });

    it("max theoretical scores match the design", () => {
      const oracle = scorePlayer(...Object.values(buildOracle()) as [any, any, any]);
      // Results max: 225
      expect(oracle.results).toBe(225);
      // Extras max: 60
      expect(oracle.extras).toBe(60);
      // Total should be around 530 (225 + ~245 + 60)
      expect(oracle.total).toBeGreaterThan(500);
      expect(oracle.total).toBeLessThan(600);
    });
  });

  describe("Detailed breakdown logging", () => {
    it("prints scoreboard for all three players", () => {
      const players = [
        { name: "El Oráculo", ...buildOracle() },
        { name: "El Buen Ojo", ...buildDecentPlayer() },
        { name: "El Bote", ...buildBotePlayer() },
      ];

      const scoreboard: string[] = ["\n╔══════════════════════════════════════════════╗"];
      scoreboard.push("║          CLASIFICACIÓN FINAL                 ║");
      scoreboard.push("╠══════════════════════════════════════════════╣");

      for (const p of players) {
        const result = scorePlayer(p.matchPreds, p.predictedElim, p.extras);
        scoreboard.push(`║ ${p.name.padEnd(16)} │ TOTAL: ${String(result.total).padStart(4)} pts  ║`);
        scoreboard.push(`║${"".padEnd(18)}│ Resultados: ${String(result.results).padStart(4)}    ║`);
        scoreboard.push(`║${"".padEnd(18)}│ Clasificac: ${String(result.classifications).padStart(4)}    ║`);
        scoreboard.push(`║${"".padEnd(18)}│ Extras:     ${String(result.extras).padStart(4)}    ║`);
        scoreboard.push(`║${"".padEnd(18)}│ Exactos:    ${String(result.exact_hits).padStart(4)}    ║`);
        scoreboard.push("╠══════════════════════════════════════════════╣");
      }
      scoreboard.push("╚══════════════════════════════════════════════╝");

      console.log(scoreboard.join("\n"));
      expect(true).toBe(true);
    });
  });
});
