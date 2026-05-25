import {
  R32_MATCHUPS,
  STAGES,
  STAGE_MATCH_COUNTS,
  getParentSlots,
  getChildSlot,
  type Stage,
} from "./mapping";
import { computeStandings, type TeamInfo, type StandingRow, type GroupStandings } from "./standings";

// ── Types ────────────────────────────────────────────────────────

export type BracketMatch = {
  stage: Stage;
  slot: number;
  homeTeam: TeamInfo | null;
  awayTeam: TeamInfo | null;
  winner: TeamInfo | null;
};

export type BracketState = {
  matches: Record<Stage, BracketMatch[]>;
  champion: TeamInfo | null;
  filledCount: number;
};

export type ThirdPlaceTeam = StandingRow & { group: string };

export type ThirdPlaceRanking = {
  autoQualified: ThirdPlaceTeam[];
  tied: ThirdPlaceTeam[];
  autoEliminated: ThirdPlaceTeam[];
  neededFromTied: number;
};

export type AllGroupStandings = Record<string, GroupStandings>;

// ── Group standings ──────────────────────────────────────────────

type MatchLike = {
  id: string;
  group_letter: string | null;
  home_team_data: TeamInfo;
  away_team_data: TeamInfo;
};

type ScoreMap = Record<string, { home: number | null; away: number | null }>;

const GROUPS = "ABCDEFGHIJKL".split("");

export function deriveAllGroupStandings(
  matches: MatchLike[],
  scores: ScoreMap
): AllGroupStandings {
  const result: AllGroupStandings = {};
  for (const g of GROUPS) {
    result[g] = computeStandings(g, matches, scores);
  }
  return result;
}

// ── Third-place ranking ──────────────────────────────────────────

export function rankThirdPlacedTeams(
  allStandings: AllGroupStandings
): ThirdPlaceRanking {
  const thirds: ThirdPlaceTeam[] = [];

  for (const g of GROUPS) {
    const s = allStandings[g];
    if (s.rows.length >= 3) {
      thirds.push({ ...s.rows[2], group: g });
    }
  }

  thirds.sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.group.localeCompare(b.group)
  );

  if (thirds.length <= 8) {
    return { autoQualified: thirds, tied: [], autoEliminated: [], neededFromTied: 0 };
  }

  const TARGET = 8;
  const autoQualified: ThirdPlaceTeam[] = [];
  const tied: ThirdPlaceTeam[] = [];
  const autoEliminated: ThirdPlaceTeam[] = [];

  // Find where the cut happens and if there's a tie at the boundary
  let i = 0;
  while (i < thirds.length) {
    // Find the extent of this stats group (same pts, gd, gf)
    let j = i;
    while (
      j < thirds.length &&
      thirds[j].pts === thirds[i].pts &&
      thirds[j].gd === thirds[i].gd &&
      thirds[j].gf === thirds[i].gf
    ) {
      j++;
    }

    const groupSize = j - i;

    if (autoQualified.length + groupSize <= TARGET) {
      // Entire group fits above the cut
      for (let k = i; k < j; k++) autoQualified.push(thirds[k]);
    } else if (autoQualified.length >= TARGET) {
      // Entire group is below the cut
      for (let k = i; k < j; k++) autoEliminated.push(thirds[k]);
    } else {
      // This group straddles the cut — all are tied
      for (let k = i; k < j; k++) tied.push(thirds[k]);
    }

    i = j;
  }

  return {
    autoQualified,
    tied,
    autoEliminated,
    neededFromTied: TARGET - autoQualified.length,
  };
}

export function resolveThirds(
  autoQualified: ThirdPlaceTeam[],
  userPickedFromTied: ThirdPlaceTeam[]
): ThirdPlaceTeam[] {
  return [...autoQualified, ...userPickedFromTied];
}

// ── Bracket state builder ────────────────────────────────────────

function teamInfoFromRow(row: StandingRow): TeamInfo {
  return { id: row.id, name: row.name, code: row.code, flag_emoji: row.flag };
}

export function buildBracketState(
  allStandings: AllGroupStandings,
  resolvedThirds: ThirdPlaceTeam[],
  knockoutPicks: Record<string, string>, // key: "stage:slot", value: team_id
  groupTiebreaks: Record<string, string[]>, // key: group letter, value: ordered team IDs for tied positions
): BracketState {
  const matches: Record<Stage, BracketMatch[]> = {
    R32: [],
    R16: [],
    QF: [],
    SF: [],
    FINAL: [],
  };

  // Build team lookup: id → TeamInfo
  const teamLookup: Record<string, TeamInfo> = {};

  // Collect all teams from standings
  for (const g of GROUPS) {
    const s = allStandings[g];
    for (const r of s.rows) {
      teamLookup[r.id] = teamInfoFromRow(r);
    }
  }

  // Apply group tiebreaks to get resolved standings
  const resolvedStandings: Record<string, StandingRow[]> = {};
  for (const g of GROUPS) {
    const rows = [...allStandings[g].rows];
    const tiebreak = groupTiebreaks[g];
    if (tiebreak) {
      // Re-sort tied teams according to user's manual order
      rows.sort((a, b) => {
        const ai = tiebreak.indexOf(a.id);
        const bi = tiebreak.indexOf(b.id);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf;
      });
    }
    resolvedStandings[g] = rows;
  }

  // Rank the resolved thirds (0-indexed)
  const thirdsRanked = resolvedThirds.map((t) => teamInfoFromRow(t));

  // Build R32 matchups
  for (const matchup of R32_MATCHUPS) {
    let homeTeam: TeamInfo | null = null;
    let awayTeam: TeamInfo | null = null;

    if (matchup.home.type === "position") {
      const rows = resolvedStandings[matchup.home.group];
      const idx = matchup.home.rank - 1;
      if (rows && rows[idx]) homeTeam = teamInfoFromRow(rows[idx]);
    } else {
      homeTeam = thirdsRanked[matchup.home.thirdSlot] ?? null;
    }

    if (matchup.away.type === "position") {
      const rows = resolvedStandings[matchup.away.group];
      const idx = matchup.away.rank - 1;
      if (rows && rows[idx]) awayTeam = teamInfoFromRow(rows[idx]);
    } else {
      awayTeam = thirdsRanked[matchup.away.thirdSlot] ?? null;
    }

    const pickKey = `R32:${matchup.slot}`;
    const winnerId = knockoutPicks[pickKey];
    let winner: TeamInfo | null = null;
    if (winnerId) {
      if (homeTeam?.id === winnerId) winner = homeTeam;
      else if (awayTeam?.id === winnerId) winner = awayTeam;
      // If the picked team is no longer in this slot (group change), winner stays null
    }

    matches.R32.push({
      stage: "R32",
      slot: matchup.slot,
      homeTeam,
      awayTeam,
      winner,
    });
  }

  // Build subsequent rounds
  for (let si = 1; si < STAGES.length; si++) {
    const stage = STAGES[si];
    const count = STAGE_MATCH_COUNTS[stage];

    for (let slot = 0; slot < count; slot++) {
      const parents = getParentSlots(stage, slot);
      let homeTeam: TeamInfo | null = null;
      let awayTeam: TeamInfo | null = null;

      if (parents) {
        const prevStage = parents.stage;
        const homeParent = matches[prevStage][parents.homeSlot];
        const awayParent = matches[prevStage][parents.awaySlot];
        homeTeam = homeParent?.winner ?? null;
        awayTeam = awayParent?.winner ?? null;
      }

      const pickKey = `${stage}:${slot}`;
      const winnerId = knockoutPicks[pickKey];
      let winner: TeamInfo | null = null;
      if (winnerId) {
        if (homeTeam?.id === winnerId) winner = homeTeam;
        else if (awayTeam?.id === winnerId) winner = awayTeam;
      }

      matches[stage].push({ stage, slot, homeTeam, awayTeam, winner });
    }
  }

  // Champion = FINAL winner
  const finalMatch = matches.FINAL[0];
  const champion = finalMatch?.winner ?? null;

  // Count filled picks
  let filledCount = 0;
  for (const stage of STAGES) {
    for (const m of matches[stage]) {
      if (m.winner) filledCount++;
    }
  }

  return { matches, champion, filledCount };
}

// ── Cascading invalidation ───────────────────────────────────────

export function cascadeInvalidation(
  knockoutPicks: Record<string, string>,
  changedStage: Stage,
  changedSlot: number
): Array<{ stage: Stage; slot: number }> {
  const invalidated: Array<{ stage: Stage; slot: number }> = [];
  const oldWinnerId = knockoutPicks[`${changedStage}:${changedSlot}`];
  if (!oldWinnerId) return invalidated;

  let currentStage = changedStage;
  let currentSlot = changedSlot;

  while (true) {
    const child = getChildSlot(currentStage, currentSlot);
    if (!child) break;

    const childKey = `${child.stage}:${child.slot}`;
    const childPick = knockoutPicks[childKey];

    if (childPick === oldWinnerId) {
      invalidated.push({ stage: child.stage as Stage, slot: child.slot });
      currentStage = child.stage as Stage;
      currentSlot = child.slot;
    } else {
      break;
    }
  }

  return invalidated;
}
