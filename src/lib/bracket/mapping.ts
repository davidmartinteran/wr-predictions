// FIFA 2026 official bracket structure (48 teams, 12 groups A-L)
// Source: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage

export type GroupSource =
  | { type: "position"; group: string; rank: 1 | 2 }
  | { type: "third"; possibleGroups: string[] };

export type R32Matchup = {
  slot: number;
  fifaMatch: number;
  home: GroupSource;
  away: GroupSource;
};

// Slot ordering is determined by the binary bracket tree:
//   R16[i]  = W(R32[i*2]) vs W(R32[i*2+1])
//   QF[i]   = W(R16[i*2]) vs W(R16[i*2+1])
//   SF[i]   = W(QF[i*2])  vs W(QF[i*2+1])
//   FINAL   = W(SF[0])    vs W(SF[1])
//
// FIFA R16 pairings:
//   R16 slot 0 (M89) = W73 vs W75    R16 slot 4 (M91) = W76 vs W78
//   R16 slot 1 (M90) = W74 vs W77    R16 slot 5 (M92) = W79 vs W80
//   R16 slot 2 (M93) = W83 vs W84    R16 slot 6 (M95) = W86 vs W88
//   R16 slot 3 (M94) = W81 vs W82    R16 slot 7 (M96) = W85 vs W87

export const R32_MATCHUPS: R32Matchup[] = [
  // ── Side A (feeds into SF slot 0 → QF 0,1 → R16 0,1,2,3) ──
  // R16 slot 0 (M89) = W73 vs W75
  { slot: 0,  fifaMatch: 73, home: { type: "position", group: "A", rank: 2 }, away: { type: "position", group: "B", rank: 2 } },
  { slot: 1,  fifaMatch: 75, home: { type: "position", group: "F", rank: 1 }, away: { type: "position", group: "C", rank: 2 } },
  // R16 slot 1 (M90) = W74 vs W77
  { slot: 2,  fifaMatch: 74, home: { type: "position", group: "E", rank: 1 }, away: { type: "third", possibleGroups: ["A","B","C","D","F"] } },
  { slot: 3,  fifaMatch: 77, home: { type: "position", group: "I", rank: 1 }, away: { type: "third", possibleGroups: ["C","D","F","G","H"] } },
  // R16 slot 2 (M93) = W83 vs W84
  { slot: 4,  fifaMatch: 83, home: { type: "position", group: "K", rank: 2 }, away: { type: "position", group: "L", rank: 2 } },
  { slot: 5,  fifaMatch: 84, home: { type: "position", group: "H", rank: 1 }, away: { type: "position", group: "J", rank: 2 } },
  // R16 slot 3 (M94) = W81 vs W82
  { slot: 6,  fifaMatch: 81, home: { type: "position", group: "D", rank: 1 }, away: { type: "third", possibleGroups: ["B","E","F","I","J"] } },
  { slot: 7,  fifaMatch: 82, home: { type: "position", group: "G", rank: 1 }, away: { type: "third", possibleGroups: ["A","E","H","I","J"] } },

  // ── Side B (feeds into SF slot 1 → QF 2,3 → R16 4,5,6,7) ──
  // R16 slot 4 (M91) = W76 vs W78
  { slot: 8,  fifaMatch: 76, home: { type: "position", group: "C", rank: 1 }, away: { type: "position", group: "F", rank: 2 } },
  { slot: 9,  fifaMatch: 78, home: { type: "position", group: "E", rank: 2 }, away: { type: "position", group: "I", rank: 2 } },
  // R16 slot 5 (M92) = W79 vs W80
  { slot: 10, fifaMatch: 79, home: { type: "position", group: "A", rank: 1 }, away: { type: "third", possibleGroups: ["C","E","F","H","I"] } },
  { slot: 11, fifaMatch: 80, home: { type: "position", group: "L", rank: 1 }, away: { type: "third", possibleGroups: ["E","H","I","J","K"] } },
  // R16 slot 6 (M95) = W86 vs W88
  { slot: 12, fifaMatch: 86, home: { type: "position", group: "J", rank: 1 }, away: { type: "position", group: "H", rank: 2 } },
  { slot: 13, fifaMatch: 88, home: { type: "position", group: "D", rank: 2 }, away: { type: "position", group: "G", rank: 2 } },
  // R16 slot 7 (M96) = W85 vs W87
  { slot: 14, fifaMatch: 85, home: { type: "position", group: "B", rank: 1 }, away: { type: "third", possibleGroups: ["E","F","G","I","J"] } },
  { slot: 15, fifaMatch: 87, home: { type: "position", group: "K", rank: 1 }, away: { type: "third", possibleGroups: ["D","E","I","J","L"] } },
];

// ── Third-place assignment ──────────────────────────────────────
// FIFA Annex C: 495 combinations mapping which 8 groups produce
// qualifying thirds → which group's third goes to which R32 slot.
// Key = sorted 8-letter group combo, value = { slot → group }.

import combinationsData from "./third-place-combinations.json";

const COMBINATIONS = combinationsData as Record<string, Record<string, string>>;

export function assignThirdsToSlots(
  qualifyingGroups: string[]
): Record<number, string> | null {
  const key = [...qualifyingGroups].sort().join("");
  const entry = COMBINATIONS[key];
  if (!entry) return null;
  const result: Record<number, string> = {};
  for (const [slot, group] of Object.entries(entry)) {
    result[Number(slot)] = group;
  }
  return result;
}

// ── Stages & bracket navigation ─────────────────────────────────

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
