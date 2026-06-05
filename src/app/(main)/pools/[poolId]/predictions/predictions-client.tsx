"use client";

import {
  useState,
  useCallback,
  useRef,
  useTransition,
  useMemo,
  useEffect,
} from "react";
import {
  Lock,
  Check,
  LayoutGrid,
  GitBranch,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Snowflake,
  Settings,
  Trash2,
} from "lucide-react";
import type { ViewMode } from "./page";
import { MatchCard } from "@/components/predictions/match-card";
import { StandingsStrip } from "@/components/predictions/standings-strip";
import {
  savePrediction,
  saveExtra,
  deleteExtra,
  saveKnockoutPrediction,
  deleteKnockoutPredictions,
  saveGroupTiebreak,
  deleteGroupTiebreak,
  saveAdminExtra,
  deleteAdminExtra,
  clearGroupPredictions,
  clearAllExtras,
  clearAllBracket,
} from "./actions";
import {
  ExtrasSection,
  EXTRAS_TOTAL,
} from "@/components/predictions/extras-section";
import {
  AdminExtrasSection,
  ADMIN_EXTRAS_TOTAL,
} from "@/components/predictions/admin-extras-section";
import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/team-flag";
import { computeStandings } from "@/lib/bracket/standings";
import {
  deriveAllGroupStandings,
  rankThirdPlacedTeams,
  resolveThirds,
  buildBracketState,
  cascadeInvalidation,
  type BracketState,
} from "@/lib/bracket/engine";
import { TOTAL_BRACKET_PICKS, type Stage } from "@/lib/bracket/mapping";
import { detectGroupTies } from "@/lib/bracket/standings";
import { BracketMobileView } from "@/components/bracket/bracket-mobile";
import { BracketDesktopView } from "@/components/bracket/bracket-desktop";
import { ThirdsTiebreaker } from "@/components/bracket/thirds-tiebreaker";
import { GroupTiebreakModal } from "@/components/bracket/group-tiebreak-modal";
import { ConfirmModal } from "@/components/confirm-modal";

type Section = "groups" | "bracket" | "extras" | "admin";

type Team = {
  id: string;
  name: string;
  code: string;
  flag_emoji: string | null;
};

type Match = {
  id: string;
  group_letter: string | null;
  match_number: number;
  kickoff: string;
  home_team_data: Team;
  away_team_data: Team;
};

type Prediction = {
  match_id: string;
  home_score: number;
  away_score: number;
};

type ExtraPrediction = {
  kind: string;
  value: string;
};

type KnockoutPrediction = {
  stage: string;
  slot: number;
  team_id: string;
};

type PoolParticipant = {
  userId: string;
  displayName: string;
};

type SavedTiebreak = {
  group_letter: string;
  ordered_team_ids: string[];
};

type Props = {
  poolId: string;
  matches: Match[];
  predictions: Prediction[];
  extraPredictions: ExtraPrediction[];
  allTeams: Team[];
  knockoutPredictions: KnockoutPrediction[];
  disabled: boolean;
  viewMode: ViewMode;
  ownPredictions?: Prediction[] | null;
  targetDisplayName?: string | null;
  poolParticipants?: PoolParticipant[] | null;
  targetUserId?: string;
  savedTiebreaks: SavedTiebreak[];
  isAdmin?: boolean;
  adminResults?: { kind: string; value: string }[];
};

const VIEW_COLORS: Record<ViewMode, string> = {
  "own-open": "#1B9E5B",
  "own-closed": "#F59E0B",
  "viewing-other": "#A855F7",
};

const GROUPS = "ABCDEFGHIJKL".split("");

function getMatchday(matchNumber: number): number {
  if (matchNumber <= 24) return 1;
  if (matchNumber <= 48) return 2;
  return 3;
}

export function PredictionsClient({
  poolId,
  matches,
  predictions,
  extraPredictions,
  allTeams,
  knockoutPredictions,
  disabled,
  viewMode,
  ownPredictions,
  targetDisplayName,
  poolParticipants,
  targetUserId,
  savedTiebreaks,
  isAdmin,
  adminResults,
}: Props) {
  const [activeSection, setActiveSection] = useState<Section>("groups");
  const [activeGroup, setActiveGroup] = useState("A");
  const [scores, setScores] = useState<
    Record<string, { home: number | null; away: number | null }>
  >(() => {
    const initial: Record<
      string,
      { home: number | null; away: number | null }
    > = {};
    for (const p of predictions) {
      initial[p.match_id] = { home: p.home_score, away: p.away_score };
    }
    return initial;
  });
  const [extras, setExtras] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const p of extraPredictions) {
      initial[p.kind] = p.value;
    }
    return initial;
  });
  const [knockoutPicks, setKnockoutPicks] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      for (const p of knockoutPredictions) {
        initial[`${p.stage}:${p.slot}`] = p.team_id;
      }
      return initial;
    },
  );
  const [groupTiebreaks, setGroupTiebreaks] = useState<
    Record<string, string[]>
  >(() => {
    const initial: Record<string, string[]> = {};
    for (const t of savedTiebreaks) {
      initial[t.group_letter] = t.ordered_team_ids;
    }
    return initial;
  });
  const [adminExtras, setAdminExtras] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const r of adminResults ?? []) {
      initial[r.kind] = r.value;
    }
    return initial;
  });
  const [selectedThirds, setSelectedThirds] = useState<string[]>([]);
  const [tiebreakModal, setTiebreakModal] = useState<{ group: string } | null>(
    null,
  );
  const [, startTransition] = useTransition();
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );
  const extraTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const knockoutTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );
  const adminTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const groupMatches = matches
    .filter((m) => m.group_letter === activeGroup)
    .sort((a, b) => a.match_number - b.match_number);

  const isMatchComplete = useCallback(
    (m: Match) => {
      const s = scores[m.id];
      if (!s || s.home === null || s.away === null) return false;
      return true;
    },
    [scores],
  );

  const totalMatches = matches.length;
  const completedCount = matches.filter(isMatchComplete).length;

  const groupFilled = groupMatches.filter(isMatchComplete).length;

  const groupComplete = useCallback(
    (group: string) => {
      const gm = matches.filter((m) => m.group_letter === group);
      return gm.every(isMatchComplete);
    },
    [matches, isMatchComplete],
  );

  const groupFilledCount = useCallback(
    (group: string) => {
      const gm = matches.filter((m) => m.group_letter === group);
      return gm.filter(isMatchComplete).length;
    },
    [matches, isMatchComplete],
  );

  const standings = useMemo(() => {
    const base = computeStandings(activeGroup, matches, scores);
    const tiebreak = groupTiebreaks[activeGroup];
    if (!tiebreak) return base;
    // Only reorder the tied teams in-place, keeping everyone else in their original position
    const rows = [...base.rows];
    const tiedIndices = rows
      .map((r, i) => (tiebreak.includes(r.id) ? i : -1))
      .filter((i) => i !== -1);
    const reordered = tiebreak
      .map((id) => rows.find((r) => r.id === id)!)
      .filter(Boolean);
    for (let i = 0; i < tiedIndices.length; i++) {
      rows[tiedIndices[i]] = reordered[i];
    }
    return { ...base, rows };
  }, [activeGroup, matches, scores, groupTiebreaks]);

  const handleScoreChange = useCallback(
    (matchId: string, home: number | null, away: number | null) => {
      setScores((prev) => ({ ...prev, [matchId]: { home, away } }));

      if (home !== null && away !== null) {
        if (debounceTimers.current[matchId]) {
          clearTimeout(debounceTimers.current[matchId]);
        }
        debounceTimers.current[matchId] = setTimeout(() => {
          startTransition(async () => {
            await savePrediction({
              match_id: matchId,
              pool_id: poolId,
              home_score: home,
              away_score: away,
            });
          });
        }, 500);
      }
    },
    [poolId],
  );

  const goNextGroup = useCallback(() => {
    const idx = GROUPS.indexOf(activeGroup);
    if (idx < GROUPS.length - 1) {
      setActiveGroup(GROUPS[idx + 1]);
    }
  }, [activeGroup]);

  const goToBracket = useCallback(() => {
    setActiveSection("bracket");
  }, []);

  const handleExtraChange = useCallback(
    (kind: string, value: string | null) => {
      if (value) {
        setExtras((prev) => ({ ...prev, [kind]: value }));
      } else {
        setExtras((prev) => {
          const next = { ...prev };
          delete next[kind];
          return next;
        });
      }

      if (extraTimers.current[kind]) {
        clearTimeout(extraTimers.current[kind]);
      }
      extraTimers.current[kind] = setTimeout(() => {
        startTransition(async () => {
          if (value) {
            await saveExtra({
              pool_id: poolId,
              kind: kind as "TOP_SCORER",
              value,
            });
          } else {
            await deleteExtra({ pool_id: poolId, kind: kind as "TOP_SCORER" });
          }
        });
      }, 500);
    },
    [poolId],
  );

  const extrasFilledCount = useMemo(() => {
    return Object.keys(extras).length;
  }, [extras]);

  const handleAdminExtraChange = useCallback(
    (kind: string, value: string | null) => {
      if (value) {
        setAdminExtras((prev) => ({ ...prev, [kind]: value }));
      } else {
        setAdminExtras((prev) => {
          const next = { ...prev };
          delete next[kind];
          return next;
        });
      }

      if (adminTimers.current[kind]) {
        clearTimeout(adminTimers.current[kind]);
      }
      adminTimers.current[kind] = setTimeout(() => {
        startTransition(async () => {
          if (value) {
            await saveAdminExtra({
              pool_id: poolId,
              kind: kind as "TOP_SCORER",
              value,
            });
          } else {
            await deleteAdminExtra({ pool_id: poolId, kind });
          }
        });
      }, 500);
    },
    [poolId],
  );

  const adminFilledCount = useMemo(() => {
    return Object.keys(adminExtras).length;
  }, [adminExtras]);

  const allGroupsComplete = completedCount === totalMatches;

  // Bracket computation — recomputes on any score change so group changes propagate
  const allStandings = useMemo(
    () => (allGroupsComplete ? deriveAllGroupStandings(matches, scores) : null),
    [allGroupsComplete, matches, scores],
  );

  const thirdsRanking = useMemo(
    () => (allStandings ? rankThirdPlacedTeams(allStandings) : null),
    [allStandings],
  );

  // Clear stale selectedThirds when thirds ranking changes
  const prevTiedIds = useRef<string>("");
  useEffect(() => {
    if (!thirdsRanking) return;
    const tiedIds = thirdsRanking.tied.map((t) => t.id).join(",");
    if (tiedIds !== prevTiedIds.current) {
      prevTiedIds.current = tiedIds;
      setSelectedThirds([]);
    }
  }, [thirdsRanking]);

  const thirdsResolved = useMemo(() => {
    if (!thirdsRanking) return false;
    if (thirdsRanking.tied.length === 0) return true;
    return selectedThirds.length === thirdsRanking.neededFromTied;
  }, [thirdsRanking, selectedThirds]);

  const bracketState = useMemo<BracketState | null>(() => {
    if (!allStandings || !thirdsRanking || !thirdsResolved) return null;
    const resolvedThirdTeams =
      thirdsRanking.tied.length === 0
        ? thirdsRanking.autoQualified
        : resolveThirds(
            thirdsRanking.autoQualified,
            thirdsRanking.tied.filter((t) => selectedThirds.includes(t.id)),
          );
    return buildBracketState(
      allStandings,
      resolvedThirdTeams,
      knockoutPicks,
      groupTiebreaks,
    );
  }, [
    allStandings,
    thirdsRanking,
    thirdsResolved,
    selectedThirds,
    knockoutPicks,
    groupTiebreaks,
  ]);

  // Clear all knockout picks when R32 teams change (group results altered qualified teams)
  const prevR32Hash = useRef<string>("");
  const knockoutPicksRef = useRef(knockoutPicks);
  useEffect(() => {
    knockoutPicksRef.current = knockoutPicks;
  }, [knockoutPicks]);
  useEffect(() => {
    if (!bracketState) return;
    const hash = bracketState.matches.R32.map(
      (m) => `${m.homeTeam?.id ?? ""},${m.awayTeam?.id ?? ""}`,
    ).join("|");
    if (prevR32Hash.current && prevR32Hash.current !== hash) {
      setKnockoutPicks({});
      startTransition(async () => {
        const allPicks = Object.keys(knockoutPicksRef.current).map((k) => {
          const [stage, slot] = k.split(":");
          return { stage: stage as Stage, slot: Number(slot) };
        });
        if (allPicks.length > 0) {
          await deleteKnockoutPredictions({ pool_id: poolId, picks: allPicks });
        }
      });
    }
    prevR32Hash.current = hash;
  }, [bracketState, poolId]);

  const handleKnockoutPick = useCallback(
    (stage: Stage, slot: number, teamId: string) => {
      const key = `${stage}:${slot}`;
      const oldPick = knockoutPicks[key];

      // If picking same team, deselect
      if (oldPick === teamId) {
        const invalidated = cascadeInvalidation(knockoutPicks, stage, slot);
        const allToRemove = [{ stage, slot }, ...invalidated];
        setKnockoutPicks((prev) => {
          const next = { ...prev };
          for (const r of allToRemove) delete next[`${r.stage}:${r.slot}`];
          return next;
        });
        startTransition(async () => {
          await deleteKnockoutPredictions({
            pool_id: poolId,
            picks: allToRemove,
          });
        });
        return;
      }

      // Cascade invalidation for old pick
      const invalidated = oldPick
        ? cascadeInvalidation(knockoutPicks, stage, slot)
        : [];

      setKnockoutPicks((prev) => {
        const next = { ...prev, [key]: teamId };
        for (const r of invalidated) delete next[`${r.stage}:${r.slot}`];
        return next;
      });

      // Delete invalidated picks
      if (invalidated.length > 0) {
        startTransition(async () => {
          await deleteKnockoutPredictions({
            pool_id: poolId,
            picks: invalidated,
          });
        });
      }

      // Save new pick with debounce
      if (knockoutTimers.current[key])
        clearTimeout(knockoutTimers.current[key]);
      knockoutTimers.current[key] = setTimeout(() => {
        startTransition(async () => {
          await saveKnockoutPrediction({
            pool_id: poolId,
            stage,
            slot,
            team_id: teamId,
          });
        });
      }, 300);
    },
    [poolId, knockoutPicks],
  );

  const handleThirdToggle = useCallback((teamId: string) => {
    setSelectedThirds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  }, []);

  const handleTiebreakResolve = useCallback(
    (group: string, ordered: string[]) => {
      setGroupTiebreaks((prev) => ({ ...prev, [group]: ordered }));
      setTiebreakModal(null);
      startTransition(async () => {
        await saveGroupTiebreak({
          pool_id: poolId,
          group_letter: group,
          ordered_team_ids: ordered,
        });
      });
    },
    [poolId],
  );

  // Track standings hash per group to detect changes and invalidate tiebreaks
  const prevStandingsHash = useRef<Record<string, string>>({});
  useEffect(() => {
    for (const g of GROUPS) {
      if (!groupComplete(g)) continue;
      const s = computeStandings(g, matches, scores);
      const hash = s.rows
        .map((r) => `${r.id}:${r.pts}:${r.gd}:${r.gf}`)
        .join(",");
      const prev = prevStandingsHash.current[g];
      if (prev && prev !== hash) {
        // Standings changed — clear old tiebreak resolution
        setGroupTiebreaks((tb) => {
          if (!tb[g]) return tb;
          const next = { ...tb };
          delete next[g];
          return next;
        });
        startTransition(async () => {
          await deleteGroupTiebreak({ pool_id: poolId, group_letter: g });
        });
      }
      prevStandingsHash.current[g] = hash;
    }
  }, [scores, groupComplete, matches, poolId]);

  // Auto-trigger group tiebreak modal when a complete group has a tie without resolution (only in own-open)
  const pendingTiebreakGroup = useMemo(() => {
    if (viewMode !== "own-open") return null;
    if (tiebreakModal) return null;
    for (const g of GROUPS) {
      if (groupTiebreaks[g]) continue;
      if (!groupComplete(g)) continue;
      const s = computeStandings(g, matches, scores);
      const tie = detectGroupTies(s);
      if (tie) return g;
    }
    return null;
  }, [viewMode, scores, groupComplete, matches, groupTiebreaks, tiebreakModal]);

  useEffect(() => {
    if (pendingTiebreakGroup) {
      (document.activeElement as HTMLElement)?.blur();
      setActiveGroup(pendingTiebreakGroup);
      setActiveSection("groups");
      setTiebreakModal({ group: pendingTiebreakGroup });
    }
  }, [pendingTiebreakGroup]);

  const sectionCounts = useMemo(
    () => ({
      groups: { filled: completedCount, total: totalMatches },
      bracket: {
        filled: bracketState?.filledCount ?? 0,
        total: TOTAL_BRACKET_PICKS,
      },
      extras: { filled: extrasFilledCount, total: EXTRAS_TOTAL },
      admin: { filled: adminFilledCount, total: ADMIN_EXTRAS_TOTAL },
    }),
    [
      completedCount,
      totalMatches,
      extrasFilledCount,
      bracketState,
      adminFilledCount,
    ],
  );

  const ownScores = useMemo(() => {
    if (!ownPredictions) return null;
    const map: Record<string, { home: number | null; away: number | null }> =
      {};
    for (const p of ownPredictions) {
      map[p.match_id] = { home: p.home_score, away: p.away_score };
    }
    return map;
  }, [ownPredictions]);

  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const handleClearGroup = useCallback(
    (group: string) => {
      const ids = matches.filter((m) => m.group_letter === group).map((m) => m.id);
      if (!ids.length) return;
      setConfirmModal({
        title: `Limpiar Grupo ${group}`,
        description: "Se borrarán todos los resultados de este grupo. Podrás volver a rellenarlos.",
        confirmLabel: "Borrar",
        onConfirm: () => {
          setScores((prev) => {
            const next = { ...prev };
            for (const id of ids) delete next[id];
            return next;
          });
          setGroupTiebreaks((prev) => {
            if (!prev[group]) return prev;
            const next = { ...prev };
            delete next[group];
            return next;
          });
          startTransition(async () => {
            await clearGroupPredictions({ pool_id: poolId, match_ids: ids });
            await deleteGroupTiebreak({ pool_id: poolId, group_letter: group });
          });
        },
      });
    },
    [matches, poolId],
  );

  const handleClearExtras = useCallback(() => {
    setConfirmModal({
      title: "Limpiar extras",
      description: "Se borrarán todas las predicciones extra. Podrás volver a elegirlas.",
      confirmLabel: "Borrar",
      onConfirm: () => {
        setExtras({});
        startTransition(async () => {
          await clearAllExtras({ pool_id: poolId });
        });
      },
    });
  }, [poolId]);

  const handleClearBracket = useCallback(() => {
    setConfirmModal({
      title: "Limpiar bracket",
      description: "Se borrarán todas las predicciones del bracket. Podrás volver a rellenarlas.",
      confirmLabel: "Borrar",
      onConfirm: () => {
        setKnockoutPicks({});
        startTransition(async () => {
          await clearAllBracket({ pool_id: poolId });
        });
      },
    });
  }, [poolId]);

  const sharedProps = {
    activeSection,
    setActiveSection,
    sectionCounts,
    allGroupsComplete,
    activeGroup,
    setActiveGroup,
    groupMatches,
    matches,
    scores,
    completedCount,
    totalMatches,
    groupFilled,
    groupComplete,
    isMatchComplete,
    standings,
    disabled,
    handleScoreChange,
    goNextGroup,
    goToBracket,
    extras,
    allTeams,
    handleExtraChange,
    extrasFilledCount,
    poolId,
    bracketState,
    thirdsRanking,
    thirdsResolved,
    selectedThirds,
    handleKnockoutPick,
    handleThirdToggle,
    groupTiebreaks,
    tiebreakModal,
    setTiebreakModal,
    handleTiebreakResolve,
    viewMode,
    ownScores,
    targetDisplayName,
    poolParticipants,
    targetUserId,
    isAdmin,
    adminExtras,
    handleAdminExtraChange,
    adminFilledCount,
    handleClearGroup,
    handleClearExtras,
    handleClearBracket,
  };

  return (
    <>
      <div className="contents lg:hidden">
        <MobileLayout {...sharedProps} />
      </div>
      <div className="hidden lg:contents">
        <DesktopLayout {...sharedProps} groupFilledCount={groupFilledCount} />
      </div>
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          description={confirmModal.description}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </>
  );
}

// ─── Mobile Layout ───────────────────────────────────────────

type SectionCounts = {
  groups: { filled: number; total: number };
  bracket: { filled: number; total: number };
  extras: { filled: number; total: number };
  admin: { filled: number; total: number };
};

type LayoutProps = {
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  sectionCounts: SectionCounts;
  allGroupsComplete: boolean;
  activeGroup: string;
  setActiveGroup: (g: string) => void;
  groupMatches: Match[];
  matches: Match[];
  scores: Record<string, { home: number | null; away: number | null }>;
  completedCount: number;
  totalMatches: number;
  groupFilled: number;
  groupComplete: (g: string) => boolean;
  isMatchComplete: (m: Match) => boolean;
  standings: ReturnType<typeof computeStandings>;
  disabled: boolean;
  handleScoreChange: (
    matchId: string,
    home: number | null,
    away: number | null,
  ) => void;
  goNextGroup: () => void;
  goToBracket: () => void;
  extras: Record<string, string>;
  allTeams: Team[];
  handleExtraChange: (kind: string, value: string | null) => void;
  extrasFilledCount: number;
  poolId: string;
  bracketState: BracketState | null;
  thirdsRanking: ReturnType<typeof rankThirdPlacedTeams> | null;
  thirdsResolved: boolean;
  selectedThirds: string[];
  handleKnockoutPick: (stage: Stage, slot: number, teamId: string) => void;
  handleThirdToggle: (teamId: string) => void;
  groupTiebreaks: Record<string, string[]>;
  tiebreakModal: { group: string } | null;
  setTiebreakModal: React.Dispatch<
    React.SetStateAction<{ group: string } | null>
  >;
  handleTiebreakResolve: (group: string, ordered: string[]) => void;
  viewMode: ViewMode;
  ownScores: Record<
    string,
    { home: number | null; away: number | null }
  > | null;
  targetDisplayName?: string | null;
  poolParticipants?: PoolParticipant[] | null;
  targetUserId?: string;
  isAdmin?: boolean;
  adminExtras: Record<string, string>;
  handleAdminExtraChange: (kind: string, value: string | null) => void;
  adminFilledCount: number;
  handleClearGroup: (group: string) => void;
  handleClearExtras: () => void;
  handleClearBracket: () => void;
};

function MobileLayout(props: LayoutProps) {
  const {
    activeSection,
    setActiveSection,
    sectionCounts,
    allGroupsComplete,
    activeGroup,
    setActiveGroup,
    groupMatches,
    matches,
    scores,
    completedCount,
    totalMatches,
    groupFilled,
    groupComplete,
    isMatchComplete,
    standings,
    disabled,
    handleScoreChange,
    goNextGroup,
    goToBracket,
    extras,
    allTeams,
    handleExtraChange,
    extrasFilledCount,
    poolId,
    bracketState,
    thirdsRanking,
    thirdsResolved,
    selectedThirds,
    handleKnockoutPick,
    handleThirdToggle,
    tiebreakModal,
    setTiebreakModal,
    handleTiebreakResolve,
    viewMode,
    ownScores,
    targetDisplayName,
    poolParticipants,
    targetUserId,
    isAdmin,
    adminExtras,
    handleAdminExtraChange,
    adminFilledCount,
    handleClearGroup,
    handleClearExtras,
    handleClearBracket,
  } = props;

  const accentColor = VIEW_COLORS[viewMode];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Frozen banner (own-closed) */}
      {viewMode === "own-closed" && (
        <div className="px-5 py-2.5 border-b border-amber-500/20 bg-amber-500/8 flex items-center gap-2">
          <Snowflake className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[12px] text-amber-200 font-medium">
            Pronósticos congelados
          </span>
          <span className="text-[11px] text-amber-400/60 ml-auto">
            Sólo lectura
          </span>
        </div>
      )}

      {/* Viewing other player header */}
      {viewMode === "viewing-other" && (
        <ViewingOtherHeader
          targetDisplayName={targetDisplayName ?? "Jugador"}
          poolParticipants={poolParticipants ?? []}
          targetUserId={targetUserId}
          poolId={poolId}
        />
      )}

      {/* Header */}
      <div className="px-5 pt-2 pb-3 border-b border-zinc-800/80 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
            {viewMode === "viewing-other"
              ? `Porra de ${targetDisplayName}`
              : "Pronósticos · Mundial 2026"}
          </div>
          {viewMode === "own-open" && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
              <Lock className="w-3 h-3" />
              <span>Hasta 11 jun</span>
            </div>
          )}
          {viewMode === "viewing-other" && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] font-medium"
              style={{
                background: "rgba(168, 85, 247, 0.1)",
                borderColor: "rgba(168, 85, 247, 0.3)",
                color: "#A855F7",
              }}
            >
              <Eye className="w-3 h-3" />
              <span>Sólo lectura</span>
            </div>
          )}
        </div>

        {/* Section tabs */}
        <div
          className={`grid gap-1.5 ${isAdmin ? "grid-cols-4" : "grid-cols-3"}`}
        >
          <MobileSectionPill
            active={activeSection === "groups"}
            icon={<LayoutGrid className="w-3.5 h-3.5" />}
            label="Grupos"
            count={`${sectionCounts.groups.filled}/${sectionCounts.groups.total}`}
            color={viewMode === "own-open" ? "#1B9E5B" : accentColor}
            onClick={() => setActiveSection("groups")}
          />
          <MobileSectionPill
            active={activeSection === "bracket"}
            icon={<GitBranch className="w-3.5 h-3.5" />}
            label="Bracket"
            count={`${sectionCounts.bracket.filled}/${sectionCounts.bracket.total}`}
            color={viewMode === "own-open" ? "#A855F7" : accentColor}
            locked={viewMode === "own-open"}
            onClick={() => setActiveSection("bracket")}
          />
          <MobileSectionPill
            active={activeSection === "extras"}
            icon={<Star className="w-3.5 h-3.5" />}
            label="Extras"
            count={`${sectionCounts.extras.filled}/${sectionCounts.extras.total}`}
            color={viewMode === "own-open" ? "#F59E0B" : accentColor}
            onClick={() => setActiveSection("extras")}
          />
          {isAdmin && (
            <MobileSectionPill
              active={activeSection === "admin"}
              icon={<Settings className="w-3.5 h-3.5" />}
              label="Admin"
              count={`${sectionCounts.admin.filled}/${sectionCounts.admin.total}`}
              color="#f43f5e"
              onClick={() => setActiveSection("admin")}
            />
          )}
        </div>
      </div>

      {activeSection === "groups" && (
        <>
          {/* Group tabs */}
          <div className="border-b border-zinc-800/80 shrink-0">
            <div className="flex overflow-x-auto scrollbar-none px-3 gap-1">
              {GROUPS.map((g) => {
                const done = groupComplete(g);
                const active = g === activeGroup;
                return (
                  <button
                    key={g}
                    onClick={() => setActiveGroup(g)}
                    className={cn(
                      "relative shrink-0 px-3.5 py-3 text-[13px] font-medium transition-colors",
                      active ? "text-zinc-50" : "text-zinc-500",
                    )}
                  >
                    Grupo {g}
                    {done && (
                      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full ml-1.5 align-middle bg-primary">
                        <Check className="w-2.5 h-2.5 text-zinc-950" />
                      </span>
                    )}
                    {active && (
                      <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-zinc-50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pt-3 pb-4 min-h-0">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
                {groupMatches.length} partidos · Grupo {activeGroup}
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-zinc-500 tabular-nums">
                  {groupFilled}/{groupMatches.length}
                </span>
                {viewMode === "own-open" && groupFilled > 0 && (
                  <button
                    onClick={() => handleClearGroup(activeGroup)}
                    className="text-zinc-600 hover:text-zinc-400 transition-colors"
                    title="Limpiar grupo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2.5">
              {groupMatches.map((match) => (
                <div key={match.id}>
                  <MatchCard
                    matchId={match.id}
                    matchday={getMatchday(match.match_number)}
                    homeTeam={match.home_team_data}
                    awayTeam={match.away_team_data}
                    kickoff={match.kickoff}
                    homeScore={scores[match.id]?.home ?? null}
                    awayScore={scores[match.id]?.away ?? null}
                    disabled={disabled}
                    onScoreChange={handleScoreChange}
                    complete={isMatchComplete(match)}
                  />
                  {viewMode === "viewing-other" && ownScores && (
                    <OwnPredictionLine
                      homeScore={ownScores[match.id]?.home ?? null}
                      awayScore={ownScores[match.id]?.away ?? null}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom section: button + standings */}
          <div className="shrink-0 pt-3">
            {viewMode === "own-open" && (
              <div className="px-4 pb-2">
                {activeGroup === "L" ? (
                  <button
                    onClick={goToBracket}
                    className="w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
                  >
                    Continuar al bracket →
                  </button>
                ) : (
                  <button
                    onClick={goNextGroup}
                    className="w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
                  >
                    Siguiente grupo →
                  </button>
                )}
              </div>
            )}
            <div className="border-t border-zinc-800/80 bg-zinc-900/70 backdrop-blur px-4 py-2">
              <StandingsStrip
                groupId={activeGroup}
                rows={standings.rows}
                counted={standings.counted}
                total={standings.total}
              />
            </div>
          </div>
        </>
      )}

      {activeSection === "bracket" &&
        (!allGroupsComplete ? (
          <SectionPlaceholder
            section="bracket"
            groupsComplete={false}
            completedCount={completedCount}
            totalMatches={totalMatches}
            onGoToGroups={() => setActiveSection("groups")}
          />
        ) : thirdsRanking &&
          thirdsRanking.tied.length > 0 &&
          !thirdsResolved ? (
          <ThirdsTiebreaker
            autoQualified={thirdsRanking.autoQualified}
            tiedTeams={thirdsRanking.tied}
            neededCount={thirdsRanking.neededFromTied}
            selected={selectedThirds}
            onToggle={handleThirdToggle}
          />
        ) : bracketState ? (
          <BracketMobileView
            bracketState={bracketState}
            disabled={disabled}
            onPickWinner={handleKnockoutPick}
            onClear={handleClearBracket}
          />
        ) : null)}
      {activeSection === "extras" && (
        <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
          <ExtrasSection
            extras={extras}
            allTeams={allTeams}
            disabled={disabled}
            onExtraChange={handleExtraChange}
            filledCount={extrasFilledCount}
            onClear={handleClearExtras}
          />
        </div>
      )}
      {activeSection === "admin" && isAdmin && (
        <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
          <AdminExtrasSection
            poolId={poolId}
            results={adminExtras}
            allTeams={allTeams}
            onResultChange={handleAdminExtraChange}
            filledCount={adminFilledCount}
          />
        </div>
      )}

      {/* Group tiebreak modal */}
      {tiebreakModal &&
        (() => {
          const s = computeStandings(tiebreakModal.group, matches, scores);
          const tie = detectGroupTies(s);
          if (!tie) return null;
          return (
            <GroupTiebreakModal
              groupLetter={tiebreakModal.group}
              tiedTeams={tie.teams}
              tiedPositions={tie.positions}
              onResolve={(ordered) =>
                handleTiebreakResolve(tiebreakModal.group, ordered)
              }
              onClose={() => setTiebreakModal(null)}
            />
          );
        })()}
    </div>
  );
}

function hexAlpha(hex: string, a: number) {
  return (
    hex +
    Math.round(a * 255)
      .toString(16)
      .padStart(2, "0")
  );
}

function MobileSectionPill({
  active,
  icon,
  label,
  count,
  color,
  locked,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: string;
  color: string;
  locked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-colors border text-left"
      style={
        active
          ? { background: hexAlpha(color, 0.12), borderColor: color }
          : {
              background: "rgb(24 24 27 / 0.6)",
              borderColor: "rgba(39, 39, 42, 0.8)",
            }
      }
    >
      <span style={{ color: active ? color : "rgb(113 113 122)" }}>{icon}</span>
      <div className="flex flex-col leading-tight min-w-0">
        <span
          className="text-[11.5px] font-semibold truncate"
          style={{ color: active ? color : "rgb(228 228 231)" }}
        >
          {label}
        </span>
        <span
          className="text-[9.5px] tabular-nums"
          style={{
            color: active ? hexAlpha(color, 0.75) : "rgb(113 113 122)",
            fontFamily: "var(--font-mono), ui-monospace, monospace",
          }}
        >
          {count}
        </span>
      </div>
      {locked && !active && (
        <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-zinc-600" />
      )}
    </button>
  );
}

function SectionPlaceholder({
  section,
  groupsComplete,
  completedCount,
  totalMatches,
  onGoToGroups,
}: {
  section: "bracket" | "extras";
  groupsComplete: boolean;
  completedCount: number;
  totalMatches: number;
  onGoToGroups: () => void;
}) {
  const config = {
    bracket: {
      icon: <GitBranch className="w-8 h-8 text-zinc-600" />,
      title: "Eliminatorias",
      lockedDescription: `Completa los ${totalMatches} partidos de la fase de grupos para desbloquear el bracket. Los clasificados de cada grupo se calcularán automáticamente a partir de tus marcadores.`,
      readyDescription:
        "Predice los cruces desde dieciseisavos de final hasta la gran final.",
    },
    extras: {
      icon: <Star className="w-8 h-8 text-zinc-600" />,
      title: "Extras",
      lockedDescription:
        "Máximo goleador, mejor jugador, y más predicciones bonus.",
      readyDescription:
        "Máximo goleador, mejor jugador, y más predicciones bonus.",
    },
  };

  const { icon, title, lockedDescription, readyDescription } = config[section];
  const locked = section === "bracket" && !groupsComplete;
  const description = locked ? lockedDescription : readyDescription;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4 min-h-full">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h2 className="text-[17px] font-semibold text-zinc-50 mb-1">{title}</h2>
        <p className="text-[13px] text-zinc-500 leading-relaxed max-w-70">
          {description}
        </p>
      </div>
      {locked && (
        <>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
            <Lock className="w-3 h-3" />
            <span className="tabular-nums">
              {completedCount}/{totalMatches} partidos completados
            </span>
          </div>
          <button
            onClick={onGoToGroups}
            className="mt-1 h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            Completar fase de grupos
          </button>
        </>
      )}
    </div>
  );
}

// ─── Desktop Layout ──────────────────────────────────────────

function DesktopLayout(
  props: LayoutProps & { groupFilledCount: (g: string) => number },
) {
  const {
    activeSection,
    setActiveSection,
    sectionCounts,
    allGroupsComplete,
    activeGroup,
    setActiveGroup,
    groupMatches,
    matches,
    scores,
    completedCount,
    totalMatches,
    groupFilled,
    groupComplete,
    groupFilledCount,
    isMatchComplete,
    standings,
    disabled,
    handleScoreChange,
    goNextGroup,
    goToBracket,
    extras,
    allTeams,
    handleExtraChange,
    extrasFilledCount,
    poolId,
    bracketState,
    thirdsRanking,
    thirdsResolved,
    selectedThirds,
    handleKnockoutPick,
    handleThirdToggle,
    tiebreakModal,
    setTiebreakModal,
    handleTiebreakResolve,
    viewMode,
    ownScores,
    targetDisplayName,
    poolParticipants,
    targetUserId,
    isAdmin,
    adminExtras,
    handleAdminExtraChange,
    adminFilledCount,
    handleClearGroup,
    handleClearExtras,
    handleClearBracket,
  } = props;
  const accentColor = VIEW_COLORS[viewMode];
  const activeGroupTeams = useMemo(() => {
    const teamMap: Record<string, Team> = {};
    for (const m of groupMatches) {
      teamMap[m.home_team_data.code] = m.home_team_data;
      teamMap[m.away_team_data.code] = m.away_team_data;
    }
    return Object.values(teamMap);
  }, [groupMatches]);

  const matchesByDay = useMemo(() => {
    const days: Record<number, Match[]> = { 1: [], 2: [], 3: [] };
    for (const m of groupMatches) {
      const md = getMatchday(m.match_number);
      days[md].push(m);
    }
    return days;
  }, [groupMatches]);

  const targetInitials = targetDisplayName
    ? targetDisplayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top header bar for viewing-other */}
      {viewMode === "viewing-other" && (
        <div className="h-12 border-b border-zinc-800/80 bg-zinc-950 flex items-center px-5 shrink-0 gap-4">
          <a
            href={`/pools/${poolId}/leaderboard`}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Clasificación</span>
          </a>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{
                background: "rgba(168, 85, 247, 0.2)",
                color: "#A855F7",
              }}
            >
              {targetInitials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] uppercase tracking-[0.12em] text-purple-400 font-medium">
                  Porra de
                </span>
                <span className="text-[14px] font-semibold text-zinc-50 truncate">
                  {targetDisplayName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(() => {
              const currentIdx = (poolParticipants ?? []).findIndex(
                (p) => p.userId === targetUserId,
              );
              const prev =
                currentIdx > 0
                  ? (poolParticipants ?? [])[currentIdx - 1]
                  : null;
              const next =
                currentIdx < (poolParticipants ?? []).length - 1
                  ? (poolParticipants ?? [])[currentIdx + 1]
                  : null;
              return (
                <>
                  {prev ? (
                    <a
                      href={`/pools/${poolId}/predictions?player=${prev.userId}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      Jugador anterior
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800/40 text-[11px] text-zinc-600 cursor-not-allowed">
                      <ChevronLeft className="w-3 h-3" />
                      Jugador anterior
                    </span>
                  )}
                  {next ? (
                    <a
                      href={`/pools/${poolId}/predictions?player=${next.userId}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      Jugador siguiente
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800/40 text-[11px] text-zinc-600 cursor-not-allowed">
                      Jugador siguiente
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </>
              );
            })()}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-medium ml-2"
              style={{
                background: "rgba(168, 85, 247, 0.1)",
                borderColor: "rgba(168, 85, 247, 0.3)",
                color: "#A855F7",
              }}
            >
              <Eye className="w-3 h-3" />
              <span>Sólo lectura</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* LEFT — sidebar */}
        <aside className="w-55 xl:w-65 border-r border-zinc-800/80 bg-zinc-950 shrink-0 flex flex-col">
          <div className="p-5 border-b border-zinc-800/80">
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-1">
              Pronósticos · Mundial 2026
            </div>
            {viewMode !== "own-open" && (
              <div className="text-[10px] text-zinc-600">Sólo lectura</div>
            )}
          </div>

          {/* Frozen banner (desktop) */}
          {viewMode === "own-closed" && (
            <div className="px-4 py-3 border-b border-amber-500/20 bg-amber-500/8 flex items-center gap-2">
              <Snowflake className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[11px] text-amber-200 font-medium">
                  Congelados
                </div>
                <div className="text-[10px] text-amber-400/60">
                  Sólo lectura
                </div>
              </div>
            </div>
          )}

          {/* Section nav */}
          <div className="p-3 border-b border-zinc-800/80 flex flex-col gap-1">
            <DesktopSectionItem
              active={activeSection === "groups"}
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Grupos"
              filled={sectionCounts.groups.filled}
              total={sectionCounts.groups.total}
              color={viewMode === "own-open" ? "#1B9E5B" : accentColor}
              onClick={() => setActiveSection("groups")}
            />
            <DesktopSectionItem
              active={activeSection === "bracket"}
              icon={<GitBranch className="w-4 h-4" />}
              label="Bracket"
              filled={sectionCounts.bracket.filled}
              total={sectionCounts.bracket.total}
              color={viewMode === "own-open" ? "#A855F7" : accentColor}
              locked={viewMode === "own-open"}
              onClick={() => setActiveSection("bracket")}
            />
            <DesktopSectionItem
              active={activeSection === "extras"}
              icon={<Star className="w-4 h-4" />}
              label="Extras"
              filled={sectionCounts.extras.filled}
              total={sectionCounts.extras.total}
              color={viewMode === "own-open" ? "#F59E0B" : accentColor}
              onClick={() => setActiveSection("extras")}
            />
            {isAdmin && (
              <DesktopSectionItem
                active={activeSection === "admin"}
                icon={<Settings className="w-4 h-4" />}
                label="Admin"
                filled={sectionCounts.admin.filled}
                total={sectionCounts.admin.total}
                color="#f43f5e"
                onClick={() => setActiveSection("admin")}
              />
            )}
          </div>

          {/* Group list (only when groups section active) */}
          {activeSection === "groups" && (
            <div className="p-3 flex-1 overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between px-3 mb-2">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
                  Grupos
                </div>
                <div className="text-[10.5px] text-zinc-500 tabular-nums">
                  {completedCount}/{totalMatches}
                </div>
              </div>
              {GROUPS.map((g) => {
                const filled = groupFilledCount(g);
                const active = g === activeGroup;
                const done = groupComplete(g);
                const gMatches = matches.filter((m) => m.group_letter === g);
                const teamCodes = gMatches
                  .reduce<string[]>((acc, m) => {
                    if (!acc.includes(m.home_team_data.code))
                      acc.push(m.home_team_data.code);
                    if (!acc.includes(m.away_team_data.code))
                      acc.push(m.away_team_data.code);
                    return acc;
                  }, [])
                  .slice(0, 4);

                return (
                  <button
                    key={g}
                    onClick={() => setActiveGroup(g)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-colors",
                      active
                        ? "bg-zinc-900 border border-zinc-800"
                        : "border border-transparent hover:bg-zinc-900/50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold",
                        active
                          ? "bg-zinc-100 text-zinc-950"
                          : "bg-zinc-800 text-zinc-300",
                      )}
                    >
                      {g}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "text-[13px] font-medium",
                          active ? "text-zinc-50" : "text-zinc-300",
                        )}
                      >
                        Grupo {g}
                      </div>
                      <div className="flex items-center gap-1">
                        {teamCodes.map((c) => (
                          <TeamFlag key={c} code={c} size={14} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {viewMode === "own-open" && (
                        <div className="text-[10.5px] text-zinc-500 tabular-nums">
                          {filled}/6
                        </div>
                      )}
                      {done && viewMode === "own-open" && (
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-primary">
                          <Check className="w-2.5 h-2.5 text-zinc-950" />
                        </div>
                      )}
                      {viewMode !== "own-open" && (
                        <Lock className="w-3.5 h-3.5 text-zinc-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* CENTER */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {activeSection === "groups" && (
            <div className="px-6 xl:px-10 py-7 max-w-230">
              {/* Group header */}
              <div className="flex items-baseline justify-between mb-1">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-[32px] font-bold text-zinc-50 leading-none">
                    Grupo {activeGroup}
                  </h1>
                  <div className="text-[13px] text-zinc-500">
                    6 partidos · {groupFilled}/{groupMatches.length} completos
                  </div>
                </div>
                {viewMode === "own-open" && (
                  <div className="flex items-center gap-2">
                    {groupFilled > 0 && (
                      <button
                        onClick={() => handleClearGroup(activeGroup)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Limpiar</span>
                      </button>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
                      <Lock className="w-3 h-3" />
                      <span>Bloqueo: 11 jun 17:00</span>
                    </div>
                  </div>
                )}
                {viewMode === "viewing-other" && (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium"
                    style={{
                      background: "rgba(168, 85, 247, 0.1)",
                      borderColor: "rgba(168, 85, 247, 0.3)",
                      color: "#A855F7",
                    }}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Pronósticos de {targetDisplayName}</span>
                  </div>
                )}
              </div>

              {/* Teams strip */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 mt-4 mb-6">
                {activeGroupTeams.map((t) => (
                  <div
                    key={t.code}
                    className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5 flex items-center gap-2.5"
                  >
                    <TeamFlag code={t.code} size={32} />
                    <div className="leading-tight">
                      <div className="text-[13px] text-zinc-100 font-medium">
                        {t.name}
                      </div>
                      <div className="text-[10.5px] text-zinc-500">
                        {t.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Matchdays */}
              {[1, 2, 3].map((md) => {
                const dayMatches = matchesByDay[md];
                if (!dayMatches || dayMatches.length === 0) return null;
                const firstDate = new Date(dayMatches[0].kickoff);
                const dateStr = firstDate.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                });

                return (
                  <div key={md} className="mb-7">
                    <div className="flex items-baseline gap-2 mb-2.5">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
                        Jornada {md}
                      </div>
                      <div className="text-[11px] text-zinc-600">{dateStr}</div>
                    </div>
                    <div className="grid grid-cols-1 3xl:grid-cols-2 gap-3">
                      {dayMatches.map((match) => {
                        const s = scores[match.id];
                        const complete = isMatchComplete(match);
                        const date = new Date(match.kickoff);
                        const day = date.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        });
                        const time = date.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div key={match.id}>
                            <DesktopMatchCard
                              match={match}
                              homeScore={s?.home ?? null}
                              awayScore={s?.away ?? null}
                              complete={complete}
                              day={day}
                              time={time}
                              disabled={disabled}
                              onScoreChange={handleScoreChange}
                            />
                            {viewMode === "viewing-other" && ownScores && (
                              <OwnPredictionLine
                                homeScore={ownScores[match.id]?.home ?? null}
                                awayScore={ownScores[match.id]?.away ?? null}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {viewMode === "own-open" &&
                (activeGroup === "L" ? (
                  <button
                    onClick={goToBracket}
                    className="mt-2 w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
                  >
                    Continuar al bracket →
                  </button>
                ) : (
                  <button
                    onClick={goNextGroup}
                    className="mt-2 w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
                  >
                    Siguiente grupo →
                  </button>
                ))}
            </div>
          )}

          {activeSection === "bracket" &&
            (!allGroupsComplete ? (
              <SectionPlaceholder
                section="bracket"
                groupsComplete={false}
                completedCount={completedCount}
                totalMatches={totalMatches}
                onGoToGroups={() => setActiveSection("groups")}
              />
            ) : thirdsRanking &&
              thirdsRanking.tied.length > 0 &&
              !thirdsResolved ? (
              <ThirdsTiebreaker
                autoQualified={thirdsRanking.autoQualified}
                tiedTeams={thirdsRanking.tied}
                neededCount={thirdsRanking.neededFromTied}
                selected={selectedThirds}
                onToggle={handleThirdToggle}
              />
            ) : bracketState ? (
              <BracketDesktopView
                bracketState={bracketState}
                disabled={disabled}
                onPickWinner={handleKnockoutPick}
                onClear={handleClearBracket}
              />
            ) : null)}

          {activeSection === "extras" && (
            <ExtrasSection
              extras={extras}
              allTeams={allTeams}
              disabled={disabled}
              onExtraChange={handleExtraChange}
              filledCount={extrasFilledCount}
              onClear={handleClearExtras}
            />
          )}

          {activeSection === "admin" && isAdmin && (
            <AdminExtrasSection
              poolId={poolId}
              results={adminExtras}
              allTeams={allTeams}
              onResultChange={handleAdminExtraChange}
              filledCount={adminFilledCount}
            />
          )}
        </main>

        {/* RIGHT — standings & progress (only for groups) */}
        {activeSection === "groups" && (
          <aside className="w-60 xl:w-70 border-l border-zinc-800/80 bg-zinc-950 shrink-0 p-4 xl:p-5 overflow-y-auto scrollbar-thin">
            <DesktopStandingsCard
              groupId={activeGroup}
              standings={standings}
              viewMode={viewMode}
            />

            {/* Progress card (only own modes) */}
            {viewMode !== "viewing-other" && (
              <>
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 mb-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
                      Tu progreso
                    </div>
                    <div className="text-[11px] tabular-nums font-medium text-primary">
                      {Math.round((completedCount / totalMatches) * 100)}%
                    </div>
                  </div>
                  <div
                    className="text-[28px] font-bold text-zinc-50 tabular-nums leading-none"
                    style={{
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                    }}
                  >
                    {completedCount}
                    <span className="text-zinc-600">/{totalMatches}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mb-3">
                    partidos de fase de grupos
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${(completedCount / totalMatches) * 100}%`,
                      }}
                    />
                  </div>
                  {/* Per-group mini bars */}
                  <div className="grid grid-cols-6 gap-1 mt-3.5">
                    {GROUPS.map((g) => {
                      const gm = matches.filter((m) => m.group_letter === g);
                      const f = gm.filter(isMatchComplete).length;
                      const pct = f / 6;
                      return (
                        <div
                          key={g}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="w-full h-8 bg-zinc-800/80 rounded-sm overflow-hidden relative">
                            <div
                              className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                              style={{
                                height: `${pct * 100}%`,
                                background:
                                  f === 6
                                    ? "var(--color-primary)"
                                    : "rgb(82 82 91)",
                              }}
                            />
                          </div>
                          <div className="text-[9.5px] text-zinc-500 tabular-nums">
                            {g}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-zinc-500 text-center">
                  Tus pronósticos son{" "}
                  <span className="text-zinc-300">anónimos</span> hasta el 11
                  jun.
                </p>
              </>
            )}

            {/* VS. TU PORRA section (viewing-other) */}
            {viewMode === "viewing-other" && ownScores && (
              <DesktopComparisonCard
                groupMatches={groupMatches}
                theirScores={scores}
                ownScores={ownScores}
                activeGroup={activeGroup}
                targetDisplayName={targetDisplayName}
              />
            )}
          </aside>
        )}

        {/* Group tiebreak modal */}
        {tiebreakModal &&
          (() => {
            const s = computeStandings(tiebreakModal.group, matches, scores);
            const tie = detectGroupTies(s);
            if (!tie) return null;
            return (
              <GroupTiebreakModal
                groupLetter={tiebreakModal.group}
                tiedTeams={tie.teams}
                tiedPositions={tie.positions}
                onResolve={(ordered) =>
                  handleTiebreakResolve(tiebreakModal.group, ordered)
                }
                onClose={() => setTiebreakModal(null)}
              />
            );
          })()}
      </div>
    </div>
  );
}

// ─── Desktop sub-components ──────────────────────────────────

function DesktopSectionItem({
  active,
  icon,
  label,
  filled,
  total,
  color,
  locked,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  filled: number;
  total: number;
  color: string;
  locked?: boolean;
  onClick: () => void;
}) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
      style={
        active
          ? {
              background: hexAlpha(color, 0.1),
              border: `1px solid ${hexAlpha(color, 0.33)}`,
            }
          : { border: "1px solid transparent" }
      }
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{
          background: active ? hexAlpha(color, 0.16) : "rgb(39 39 42 / 0.6)",
        }}
      >
        <span style={{ color: active ? color : "rgb(161 161 170)" }}>
          {icon}
        </span>
      </div>
      <span
        className={cn(
          "text-[13px] font-medium leading-tight flex-1",
          active ? "text-zinc-50" : "text-zinc-300",
        )}
      >
        {label}
      </span>
      {locked && <Lock className="w-2.5 h-2.5 text-zinc-600" />}
      <div
        className="text-[10.5px] tabular-nums flex items-center gap-1.5 shrink-0"
        style={{
          color: active ? color : "rgb(113 113 122)",
          fontFamily: "var(--font-mono), ui-monospace, monospace",
        }}
      >
        <span>
          {filled}/{total}
        </span>
        <span className="text-zinc-700">·</span>
        <span>{pct}%</span>
      </div>
    </button>
  );
}

function DesktopMatchCard({
  match,
  homeScore,
  awayScore,
  complete,
  day,
  time,
  disabled,
  onScoreChange,
}: {
  match: Match;
  homeScore: number | null;
  awayScore: number | null;
  complete: boolean;
  day: string;
  time: string;
  disabled: boolean;
  onScoreChange: (
    matchId: string,
    home: number | null,
    away: number | null,
  ) => void;
}) {
  const handleHome = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      const v = raw === "" ? null : Math.min(15, parseInt(raw, 10));
      onScoreChange(match.id, v, awayScore);
    },
    [match.id, awayScore, onScoreChange],
  );

  const handleAway = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      const v = raw === "" ? null : Math.min(15, parseInt(raw, 10));
      onScoreChange(match.id, homeScore, v);
    },
    [match.id, homeScore, onScoreChange],
  );

  return (
    <div
      className={cn(
        "rounded-xl border bg-zinc-900/40 p-4 transition-colors",
        complete ? "border-zinc-700" : "border-zinc-800/80",
      )}
    >
      <div className="flex items-center justify-between mb-3 text-[10.5px] uppercase tracking-[0.12em] text-zinc-500">
        <div>
          {day} · {time}
        </div>
      </div>
      <div className="flex items-center gap-2 xl:gap-4 3xl:gap-3">
        <div className="flex items-center gap-2 xl:gap-3 3xl:gap-2.5 flex-1 min-w-0">
          <TeamFlag
            code={match.home_team_data.code}
            size={32}
            className="shrink-0 xl:w-10 xl:h-10 3xl:w-9 3xl:h-9"
          />
          <div className="text-[13px] xl:text-[17px] 3xl:text-[15px] text-zinc-100 font-medium truncate">
            {match.home_team_data.name}
          </div>
        </div>
        <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={2}
            value={homeScore ?? ""}
            placeholder="–"
            onChange={handleHome}
            disabled={disabled}
            className="w-11 h-11 xl:w-13 xl:h-13 rounded-lg bg-zinc-950 border border-zinc-800 text-center text-[22px] xl:text-[26px] font-bold tabular-nums text-zinc-50 placeholder:text-zinc-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
          />
          <span className="text-zinc-700">:</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={2}
            value={awayScore ?? ""}
            placeholder="–"
            onChange={handleAway}
            disabled={disabled}
            className="w-11 h-11 xl:w-13 xl:h-13 rounded-lg bg-zinc-950 border border-zinc-800 text-center text-[22px] xl:text-[26px] font-bold tabular-nums text-zinc-50 placeholder:text-zinc-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
          />
        </div>
        <div className="flex items-center gap-2 xl:gap-3 3xl:gap-2.5 flex-1 min-w-0 justify-end text-right">
          <div className="text-[13px] xl:text-[17px] 3xl:text-[15px] text-zinc-100 font-medium truncate">
            {match.away_team_data.name}
          </div>
          <TeamFlag
            code={match.away_team_data.code}
            size={32}
            className="shrink-0 xl:w-10 xl:h-10 3xl:w-9 3xl:h-9"
          />
        </div>
      </div>
    </div>
  );
}

// ─── View mode components ───────────────────────────────────

function ViewingOtherHeader({
  targetDisplayName,
  poolParticipants,
  targetUserId,
  poolId,
}: {
  targetDisplayName: string;
  poolParticipants: PoolParticipant[];
  targetUserId?: string;
  poolId: string;
}) {
  const currentIdx = poolParticipants.findIndex(
    (p) => p.userId === targetUserId,
  );
  const prevPlayer = currentIdx > 0 ? poolParticipants[currentIdx - 1] : null;
  const nextPlayer =
    currentIdx < poolParticipants.length - 1
      ? poolParticipants[currentIdx + 1]
      : null;

  return (
    <div className="px-4 py-2.5 border-b border-purple-500/20 bg-purple-500/8 flex items-center gap-2 shrink-0">
      <a
        href={`/pools/${poolId}/predictions`}
        className="p-1 rounded-md hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </a>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-purple-300 truncate">
          {targetDisplayName}
        </div>
        <div className="text-[10px] text-purple-400/60">Viendo su porra</div>
      </div>
      <div className="flex items-center gap-1">
        {prevPlayer && (
          <a
            href={`/pools/${poolId}/predictions?player=${prevPlayer.userId}`}
            className="p-1 rounded-md hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </a>
        )}
        {nextPlayer && (
          <a
            href={`/pools/${poolId}/predictions?player=${nextPlayer.userId}`}
            className="p-1 rounded-md hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function OwnPredictionLine({
  homeScore,
  awayScore,
}: {
  homeScore: number | null;
  awayScore: number | null;
}) {
  const hasPrediction = homeScore !== null && awayScore !== null;

  return (
    <div className="flex items-center gap-2 py-1.5 px-4 text-[11px]">
      <span className="text-zinc-600 text-[8px]">●</span>
      <span className="text-zinc-500">Tu pronóstico</span>
      {hasPrediction ? (
        <span
          className="text-zinc-400 tabular-nums font-medium"
          style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
        >
          {homeScore} – {awayScore}
        </span>
      ) : (
        <span className="text-zinc-600">—</span>
      )}
    </div>
  );
}

function DesktopComparisonCard({
  groupMatches,
  theirScores,
  ownScores,
  activeGroup,
  targetDisplayName,
}: {
  groupMatches: Match[];
  theirScores: Record<string, { home: number | null; away: number | null }>;
  ownScores: Record<string, { home: number | null; away: number | null }>;
  activeGroup: string;
  targetDisplayName?: string | null;
}) {
  let exact = 0;
  let sameSign = 0;
  let total = 0;

  for (const m of groupMatches) {
    const theirs = theirScores[m.id];
    const mine = ownScores[m.id];
    if (!theirs || !mine) continue;
    if (
      theirs.home === null ||
      theirs.away === null ||
      mine.home === null ||
      mine.away === null
    )
      continue;
    total++;
    if (theirs.home === mine.home && theirs.away === mine.away) {
      exact++;
      sameSign++;
    } else {
      const theirSign = Math.sign(theirs.home - theirs.away);
      const mySign = Math.sign(mine.home - mine.away);
      if (theirSign === mySign) sameSign++;
    }
  }

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/8 p-4 mb-4">
      <div className="text-[10.5px] uppercase tracking-[0.12em] text-purple-400 font-medium mb-3">
        VS. Tu porra · Grupo {activeGroup}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-3">
          <div className="text-[9.5px] uppercase tracking-widest text-zinc-500 font-medium mb-1">
            Marcadores exactos
          </div>
          <div className="flex items-baseline gap-0.5">
            <span
              className="text-[22px] font-bold text-zinc-50 tabular-nums"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
              }}
            >
              {exact}
            </span>
            <span
              className="text-[13px] text-zinc-600 tabular-nums"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
              }}
            >
              /{total}
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-3">
          <div className="text-[9.5px] uppercase tracking-widest text-zinc-500 font-medium mb-1">
            Mismo signo
          </div>
          <div className="flex items-baseline gap-0.5">
            <span
              className="text-[22px] font-bold text-purple-300 tabular-nums"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
              }}
            >
              {sameSign}
            </span>
            <span
              className="text-[13px] text-zinc-600 tabular-nums"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
              }}
            >
              /{total}
            </span>
          </div>
        </div>
      </div>
      <div className="text-[11px] text-zinc-500 leading-relaxed">
        {targetDisplayName} apostó parecido a ti en este grupo en{" "}
        <span className="text-zinc-300 font-medium">
          {sameSign} de {total}
        </span>{" "}
        partidos.
      </div>
    </div>
  );
}

function DesktopStandingsCard({
  groupId,
  standings,
  viewMode,
}: {
  groupId: string;
  standings: ReturnType<typeof computeStandings>;
  viewMode?: ViewMode;
}) {
  const { rows, counted, total } = standings;
  const provisional = counted < total;
  const isViewing = viewMode === "viewing-other";

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
            {isViewing ? "Su clasificación" : "Tu clasificación"}
          </div>
          <div className="text-[13px] font-semibold text-zinc-100 leading-tight">
            Grupo {groupId}
          </div>
        </div>
        <div className="text-right">
          {provisional ? (
            <>
              <div className="text-[10.5px] text-zinc-500 tabular-nums">
                {counted}/{total}
              </div>
              {counted > 0 && (
                <div className="text-[10px] text-amber-400/80">Provisional</div>
              )}
            </>
          ) : (
            <div className="text-[10px] font-medium text-primary">
              Definitiva
            </div>
          )}
        </div>
      </div>

      {counted === 0 ? (
        <div className="px-4 py-5 text-center">
          <div className="text-[11.5px] text-zinc-500 leading-relaxed">
            Mete un marcador y veré cómo
            <br />
            queda tu Grupo {groupId}.
          </div>
        </div>
      ) : (
        <>
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="text-[9.5px] uppercase tracking-widest text-zinc-500">
                <th className="text-left font-medium pl-3 py-1.5 w-5">#</th>
                <th className="text-left font-medium py-1.5">Equipo</th>
                <th className="text-right font-medium px-1.5 tabular-nums w-7">
                  PJ
                </th>
                <th className="text-right font-medium px-1.5 tabular-nums w-9">
                  DG
                </th>
                <th className="text-right font-medium pr-3 tabular-nums w-9">
                  PTS
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const passes = i < 2;
                return (
                  <tr
                    key={r.code}
                    className="border-t border-zinc-800/60 align-middle"
                  >
                    <td className="pl-3 py-2">
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "w-1 h-3 rounded-full shrink-0",
                            passes
                              ? provisional
                                ? "bg-primary opacity-40"
                                : "bg-primary"
                              : "opacity-0",
                          )}
                        />
                        <span className="text-zinc-500 tabular-nums">
                          {i + 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pl-2 text-zinc-100 max-w-0 overflow-hidden">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <TeamFlag
                          code={r.code}
                          size={16}
                          className="shrink-0"
                        />
                        <span
                          className={cn(
                            "text-[11.5px] truncate",
                            r.pj > 0 ? "" : "text-zinc-500",
                          )}
                        >
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td className="text-right text-zinc-400 tabular-nums px-1.5">
                      {r.pj}
                    </td>
                    <td className="text-right text-zinc-400 tabular-nums px-1.5">
                      {r.gd > 0 ? `+${r.gd}` : r.gd}
                    </td>
                    <td className="text-right text-zinc-50 font-semibold tabular-nums pr-3">
                      {r.pts}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 flex items-center gap-1.5">
            <span className="inline-block w-1 h-2.5 rounded-full bg-primary" />
            Pasan a octavos
          </div>
        </>
      )}
    </div>
  );
}
