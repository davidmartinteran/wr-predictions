// FIFA 2026 bracket structure (48 teams, 12 groups A-L)
// Source: proposed FIFA format. Update when FIFA publishes official bracket.

export type GroupSource =
  | { type: "position"; group: string; rank: 1 | 2 }
  | { type: "third"; thirdSlot: number };

export type R32Matchup = {
  slot: number;
  home: GroupSource;
  away: GroupSource;
};

// R32: 16 matches
// Slots 0-11: 1st vs 2nd cross-group matchups
// Slots 12-15: best 3rd-placed teams (paired by rank: 1vs8, 2vs7, 3vs6, 4vs5)
export const R32_MATCHUPS: R32Matchup[] = [
  // Side A
  { slot: 0,  home: { type: "position", group: "A", rank: 1 }, away: { type: "position", group: "B", rank: 2 } },
  { slot: 1,  home: { type: "position", group: "C", rank: 1 }, away: { type: "position", group: "D", rank: 2 } },
  { slot: 2,  home: { type: "position", group: "E", rank: 1 }, away: { type: "position", group: "F", rank: 2 } },
  { slot: 3,  home: { type: "position", group: "G", rank: 1 }, away: { type: "position", group: "H", rank: 2 } },
  { slot: 4,  home: { type: "position", group: "I", rank: 1 }, away: { type: "position", group: "J", rank: 2 } },
  { slot: 5,  home: { type: "position", group: "K", rank: 1 }, away: { type: "position", group: "L", rank: 2 } },
  // Side B
  { slot: 6,  home: { type: "position", group: "B", rank: 1 }, away: { type: "position", group: "A", rank: 2 } },
  { slot: 7,  home: { type: "position", group: "D", rank: 1 }, away: { type: "position", group: "C", rank: 2 } },
  { slot: 8,  home: { type: "position", group: "F", rank: 1 }, away: { type: "position", group: "E", rank: 2 } },
  { slot: 9,  home: { type: "position", group: "H", rank: 1 }, away: { type: "position", group: "G", rank: 2 } },
  { slot: 10, home: { type: "position", group: "J", rank: 1 }, away: { type: "position", group: "I", rank: 2 } },
  { slot: 11, home: { type: "position", group: "L", rank: 1 }, away: { type: "position", group: "K", rank: 2 } },
  // 3rd-placed teams (ranked 1-8, paired: 1v8, 2v7, 3v6, 4v5)
  { slot: 12, home: { type: "third", thirdSlot: 0 }, away: { type: "third", thirdSlot: 7 } },
  { slot: 13, home: { type: "third", thirdSlot: 1 }, away: { type: "third", thirdSlot: 6 } },
  { slot: 14, home: { type: "third", thirdSlot: 2 }, away: { type: "third", thirdSlot: 5 } },
  { slot: 15, home: { type: "third", thirdSlot: 3 }, away: { type: "third", thirdSlot: 4 } },
];

export const STAGES = ["R32", "R16", "QF", "SF", "FINAL"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_MATCH_COUNTS: Record<Stage, number> = {
  R32: 16,
  R16: 8,
  QF: 4,
  SF: 2,
  FINAL: 1,
};

export const STAGE_LABELS: Record<Stage, string> = {
  R32: "Treintaidosavos",
  R16: "Octavos",
  QF: "Cuartos",
  SF: "Semifinales",
  FINAL: "Final",
};

export const TOTAL_BRACKET_PICKS = 31; // 16+8+4+2+1

// Binary bracket flow: each match in round N+1 is fed by 2 matches in round N
// R16[i] = winner(R32[i*2]) vs winner(R32[i*2+1])
// QF[i]  = winner(R16[i*2]) vs winner(R16[i*2+1])
// etc.
export function getParentSlots(stage: Stage, slot: number): { stage: Stage; homeSlot: number; awaySlot: number } | null {
  const idx = STAGES.indexOf(stage);
  if (idx <= 0) return null;
  const prevStage = STAGES[idx - 1];
  return { stage: prevStage, homeSlot: slot * 2, awaySlot: slot * 2 + 1 };
}

export function getChildSlot(stage: Stage, slot: number): { stage: Stage; slot: number; side: "home" | "away" } | null {
  const idx = STAGES.indexOf(stage);
  if (idx >= STAGES.length - 1) return null;
  const nextStage = STAGES[idx + 1];
  return {
    stage: nextStage,
    slot: Math.floor(slot / 2),
    side: slot % 2 === 0 ? "home" : "away",
  };
}
