export type TeamInfo = {
  id: string;
  name: string;
  code: string;
  flag_emoji: string | null;
};

export type StandingRow = {
  id: string;
  code: string;
  flag: string | null;
  name: string;
  pts: number;
  gf: number;
  ga: number;
  gd: number;
  pj: number;
};

export type GroupStandings = {
  rows: StandingRow[];
  counted: number;
  total: number;
};

type MatchLike = {
  id: string;
  group_letter: string | null;
  home_team_data: TeamInfo;
  away_team_data: TeamInfo;
};

type ScoreMap = Record<string, { home: number | null; away: number | null }>;

export function computeStandings(
  groupId: string,
  matches: MatchLike[],
  scores: ScoreMap
): GroupStandings {
  const groupMatches = matches.filter((m) => m.group_letter === groupId);
  const teams: Record<string, StandingRow> = {};

  for (const m of groupMatches) {
    if (!teams[m.home_team_data.code]) {
      teams[m.home_team_data.code] = {
        id: m.home_team_data.id,
        code: m.home_team_data.code,
        flag: m.home_team_data.flag_emoji,
        name: m.home_team_data.name,
        pts: 0, gf: 0, ga: 0, gd: 0, pj: 0,
      };
    }
    if (!teams[m.away_team_data.code]) {
      teams[m.away_team_data.code] = {
        id: m.away_team_data.id,
        code: m.away_team_data.code,
        flag: m.away_team_data.flag_emoji,
        name: m.away_team_data.name,
        pts: 0, gf: 0, ga: 0, gd: 0, pj: 0,
      };
    }
  }

  let counted = 0;
  for (const m of groupMatches) {
    const s = scores[m.id];
    if (!s || s.home === null || s.away === null) continue;
    counted++;
    const h = s.home;
    const a = s.away;
    teams[m.home_team_data.code].gf += h;
    teams[m.home_team_data.code].ga += a;
    teams[m.home_team_data.code].pj += 1;
    teams[m.away_team_data.code].gf += a;
    teams[m.away_team_data.code].ga += h;
    teams[m.away_team_data.code].pj += 1;
    if (h > a) teams[m.home_team_data.code].pts += 3;
    else if (h < a) teams[m.away_team_data.code].pts += 3;
    else {
      teams[m.home_team_data.code].pts += 1;
      teams[m.away_team_data.code].pts += 1;
    }
  }

  const rows = Object.values(teams)
    .map((r) => ({ ...r, gd: r.gf - r.ga }))
    .sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf);

  return { rows, counted, total: groupMatches.length };
}

export type TieInfo = {
  group: string;
  positions: number[];
  teams: StandingRow[];
};

export function detectGroupTies(standings: GroupStandings): TieInfo | null {
  const { rows } = standings;
  if (rows.length < 2) return null;

  const groups: StandingRow[][] = [];
  let current: StandingRow[] = [rows[0]];

  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const cur = rows[i];
    if (cur.pts === prev.pts && cur.gd === prev.gd && cur.gf === prev.gf) {
      current.push(cur);
    } else {
      if (current.length > 1) groups.push(current);
      current = [cur];
    }
  }
  if (current.length > 1) groups.push(current);

  if (groups.length === 0) return null;

  // Return the first tie group that crosses a meaningful boundary (affects 1st/2nd/3rd)
  for (const group of groups) {
    const startIdx = rows.indexOf(group[0]);
    // Any tie in the top 3 positions matters for bracket qualification
    if (startIdx < 3) {
      return {
        group: "",
        positions: group.map((_, i) => startIdx + i),
        teams: group,
      };
    }
  }

  return null;
}
