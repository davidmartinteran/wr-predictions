"use client";

import { useState, useCallback, useRef, useTransition, useMemo } from "react";
import { Lock, Check } from "lucide-react";
import { MatchCard } from "@/components/predictions/match-card";
import { ProgressBar } from "@/components/predictions/progress-bar";
import { StandingsStrip } from "@/components/predictions/standings-strip";
import { savePrediction } from "./actions";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TeamFlag } from "@/components/team-flag";

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

type Props = {
  poolId: string;
  matches: Match[];
  predictions: Prediction[];
  disabled: boolean;
};

const GROUPS = "ABCDEFGHIJKL".split("");

function getMatchday(matchNumber: number): number {
  if (matchNumber <= 24) return 1;
  if (matchNumber <= 48) return 2;
  return 3;
}

function computeStandings(
  groupId: string,
  matches: Match[],
  scores: Record<string, { home: number | null; away: number | null }>
) {
  const groupMatches = matches.filter((m) => m.group_letter === groupId);
  const teams: Record<string, { code: string; flag: string | null; name: string; pts: number; gf: number; ga: number; gd: number; pj: number }> = {};

  for (const m of groupMatches) {
    if (!teams[m.home_team_data.code]) {
      teams[m.home_team_data.code] = { code: m.home_team_data.code, flag: m.home_team_data.flag_emoji, name: m.home_team_data.name, pts: 0, gf: 0, ga: 0, gd: 0, pj: 0 };
    }
    if (!teams[m.away_team_data.code]) {
      teams[m.away_team_data.code] = { code: m.away_team_data.code, flag: m.away_team_data.flag_emoji, name: m.away_team_data.name, pts: 0, gf: 0, ga: 0, gd: 0, pj: 0 };
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

export function PredictionsClient({ poolId, matches, predictions, disabled }: Props) {
  const [activeGroup, setActiveGroup] = useState("A");
  const [scores, setScores] = useState<Record<string, { home: number | null; away: number | null }>>(() => {
    const initial: Record<string, { home: number | null; away: number | null }> = {};
    for (const p of predictions) {
      initial[p.match_id] = { home: p.home_score, away: p.away_score };
    }
    return initial;
  });
  const [, startTransition] = useTransition();
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const groupMatches = matches
    .filter((m) => m.group_letter === activeGroup)
    .sort((a, b) => a.match_number - b.match_number);

  const totalMatches = matches.length;
  const completedCount = Object.values(scores).filter(
    (s) => s.home !== null && s.away !== null
  ).length;

  const groupFilled = groupMatches.filter((m) => {
    const s = scores[m.id];
    return s && s.home !== null && s.away !== null;
  }).length;

  const groupComplete = useCallback((group: string) => {
    const gm = matches.filter((m) => m.group_letter === group);
    return gm.every((m) => {
      const s = scores[m.id];
      return s && s.home !== null && s.away !== null;
    });
  }, [matches, scores]);

  const groupFilledCount = useCallback((group: string) => {
    const gm = matches.filter((m) => m.group_letter === group);
    return gm.filter((m) => {
      const s = scores[m.id];
      return s && s.home !== null && s.away !== null;
    }).length;
  }, [matches, scores]);

  const standings = useMemo(
    () => computeStandings(activeGroup, matches, scores),
    [activeGroup, matches, scores]
  );

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
    [poolId]
  );

  const goNextGroup = useCallback(() => {
    const idx = GROUPS.indexOf(activeGroup);
    if (idx < GROUPS.length - 1) {
      setActiveGroup(GROUPS[idx + 1]);
    }
  }, [activeGroup]);

  if (isDesktop) {
    return <DesktopLayout
      activeGroup={activeGroup}
      setActiveGroup={setActiveGroup}
      groupMatches={groupMatches}
      matches={matches}
      scores={scores}
      completedCount={completedCount}
      totalMatches={totalMatches}
      groupFilled={groupFilled}
      groupComplete={groupComplete}
      groupFilledCount={groupFilledCount}
      standings={standings}
      disabled={disabled}
      handleScoreChange={handleScoreChange}
      goNextGroup={goNextGroup}
    />;
  }

  return (
    <MobileLayout
      activeGroup={activeGroup}
      setActiveGroup={setActiveGroup}
      groupMatches={groupMatches}
      scores={scores}
      completedCount={completedCount}
      totalMatches={totalMatches}
      groupFilled={groupFilled}
      groupComplete={groupComplete}
      standings={standings}
      disabled={disabled}
      handleScoreChange={handleScoreChange}
      goNextGroup={goNextGroup}
    />
  );
}

// ─── Mobile Layout ───────────────────────────────────────────

function MobileLayout({
  activeGroup,
  setActiveGroup,
  groupMatches,
  scores,
  completedCount,
  totalMatches,
  groupFilled,
  groupComplete,
  standings,
  disabled,
  handleScoreChange,
  goNextGroup,
}: {
  activeGroup: string;
  setActiveGroup: (g: string) => void;
  groupMatches: Match[];
  scores: Record<string, { home: number | null; away: number | null }>;
  completedCount: number;
  totalMatches: number;
  groupFilled: number;
  groupComplete: (g: string) => boolean;
  standings: ReturnType<typeof computeStandings>;
  disabled: boolean;
  handleScoreChange: (matchId: string, home: number | null, away: number | null) => void;
  goNextGroup: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-2 pb-3 border-b border-zinc-800/80 shrink-0">
        <div className="flex items-baseline justify-between mb-2.5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
              Pronósticos
            </div>
            <h1 className="text-[20px] font-semibold text-zinc-50 leading-tight mt-0.5">
              Fase de grupos
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
            <Lock className="w-3 h-3" />
            <span>Hasta 11 jun</span>
          </div>
        </div>
        <ProgressBar current={completedCount} total={totalMatches} />
      </div>

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
                  active ? "text-zinc-50" : "text-zinc-500"
                )}
              >
                Grupo {g}
                {done && (
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full ml-1.5 align-middle bg-primary">
                    <Check className="w-2.5 h-2.5 text-zinc-950" />
                  </span>
                )}
                {active && (
                  <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-zinc-50" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Match list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pt-3 pb-52 min-h-0">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
            {groupMatches.length} partidos · Grupo {activeGroup}
          </div>
          <div className="text-[11px] text-zinc-500 tabular-nums">
            {groupFilled}/{groupMatches.length}
          </div>
        </div>
        <div className="space-y-2.5">
          {groupMatches.map((match) => (
            <MatchCard
              key={match.id}
              matchId={match.id}
              matchday={getMatchday(match.match_number)}
              homeTeam={match.home_team_data}
              awayTeam={match.away_team_data}
              kickoff={match.kickoff}
              homeScore={scores[match.id]?.home ?? null}
              awayScore={scores[match.id]?.away ?? null}
              disabled={disabled}
              onScoreChange={handleScoreChange}
            />
          ))}
        </div>
      </div>

      {/* Fixed bottom section: button + standings, above BottomNav */}
      <div className="fixed bottom-16 inset-x-0 z-40">
        {activeGroup !== "L" && (
          <div className="px-4 pb-2">
            <button
              onClick={goNextGroup}
              className="w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Siguiente grupo
            </button>
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
    </div>
  );
}

// ─── Desktop Layout ──────────────────────────────────────────

function DesktopLayout({
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
  standings,
  disabled,
  handleScoreChange,
  goNextGroup,
}: {
  activeGroup: string;
  setActiveGroup: (g: string) => void;
  groupMatches: Match[];
  matches: Match[];
  scores: Record<string, { home: number | null; away: number | null }>;
  completedCount: number;
  totalMatches: number;
  groupFilled: number;
  groupComplete: (g: string) => boolean;
  groupFilledCount: (g: string) => number;
  standings: ReturnType<typeof computeStandings>;
  disabled: boolean;
  handleScoreChange: (matchId: string, home: number | null, away: number | null) => void;
  goNextGroup: () => void;
}) {
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

  return (
    <div className="flex h-full min-h-0">
      {/* LEFT — group sidebar */}
      <aside className="w-[260px] border-r border-zinc-800/80 bg-zinc-950 shrink-0 flex flex-col">
        <div className="p-5 border-b border-zinc-800/80">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-1">
            Pronósticos
          </div>
          <h2 className="text-[17px] font-semibold text-zinc-50">Fase de grupos</h2>
        </div>
        <div className="p-3 flex-1 overflow-y-auto scrollbar-thin">
          {GROUPS.map((g) => {
            const filled = groupFilledCount(g);
            const active = g === activeGroup;
            const done = groupComplete(g);
            const gMatches = matches.filter((m) => m.group_letter === g);
            const teamCodes = gMatches
              .reduce<string[]>((acc, m) => {
                if (!acc.includes(m.home_team_data.code)) acc.push(m.home_team_data.code);
                if (!acc.includes(m.away_team_data.code)) acc.push(m.away_team_data.code);
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
                    : "border border-transparent hover:bg-zinc-900/50"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold",
                    active ? "bg-zinc-100 text-zinc-950" : "bg-zinc-800 text-zinc-300"
                  )}
                >
                  {g}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-[13px] font-medium", active ? "text-zinc-50" : "text-zinc-300")}>
                    Grupo {g}
                  </div>
                  <div className="flex items-center gap-1">
                    {teamCodes.map((c) => (
                      <TeamFlag key={c} code={c} size={14} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="text-[10.5px] text-zinc-500 tabular-nums">{filled}/6</div>
                  {done && (
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-primary">
                      <Check className="w-2.5 h-2.5 text-zinc-950" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* CENTER — selected group */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-10 py-7 max-w-[920px]">
          {/* Group header */}
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-3">
              <h1 className="text-[32px] font-bold text-zinc-50 leading-none">
                Grupo {activeGroup}
              </h1>
              <div className="text-[13px] text-zinc-500">
                6 partidos · {groupFilled} completados
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
              <Lock className="w-3 h-3" />
              <span>Bloqueo: 11 jun 17:00</span>
            </div>
          </div>

          {/* Teams strip */}
          <div className="grid grid-cols-4 gap-2 mt-4 mb-6">
            {activeGroupTeams.map((t) => (
              <div
                key={t.code}
                className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5 flex items-center gap-2.5"
              >
                <TeamFlag code={t.code} size={32} />
                <div className="leading-tight">
                  <div className="text-[13px] text-zinc-100 font-medium">{t.name}</div>
                  <div className="text-[10.5px] text-zinc-500">{t.code}</div>
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
                <div className="grid grid-cols-2 gap-3">
                  {dayMatches.map((match) => {
                    const s = scores[match.id];
                    const complete = s && s.home !== null && s.away !== null;
                    const date = new Date(match.kickoff);
                    const day = date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
                    const time = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <DesktopMatchCard
                        key={match.id}
                        match={match}
                        homeScore={s?.home ?? null}
                        awayScore={s?.away ?? null}
                        complete={complete}
                        day={day}
                        time={time}
                        disabled={disabled}
                        onScoreChange={handleScoreChange}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {activeGroup !== "L" && (
            <button
              onClick={goNextGroup}
              className="mt-2 w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Siguiente grupo →
            </button>
          )}
        </div>
      </main>

      {/* RIGHT — standings & progress */}
      <aside className="w-[280px] border-l border-zinc-800/80 bg-zinc-950 shrink-0 p-5 overflow-y-auto scrollbar-thin">
        {/* Standings preview */}
        <DesktopStandingsCard
          groupId={activeGroup}
          standings={standings}
        />

        {/* Progress card */}
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
            style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
          >
            {completedCount}
            <span className="text-zinc-600">/{totalMatches}</span>
          </div>
          <div className="text-[11px] text-zinc-500 mb-3">partidos de fase de grupos</div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(completedCount / totalMatches) * 100}%` }}
            />
          </div>
          {/* Per-group mini bars */}
          <div className="grid grid-cols-6 gap-1 mt-3.5">
            {GROUPS.map((g) => {
              const gm = matches.filter((m) => m.group_letter === g);
              const f = gm.filter((m) => {
                const s = scores[m.id];
                return s && s.home !== null && s.away !== null;
              }).length;
              const pct = f / 6;
              return (
                <div key={g} className="flex flex-col items-center gap-1">
                  <div className="w-full h-8 bg-zinc-800/80 rounded-sm overflow-hidden relative">
                    <div
                      className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                      style={{
                        height: `${pct * 100}%`,
                        background: f === 6 ? "var(--color-primary)" : "rgb(82 82 91)",
                      }}
                    />
                  </div>
                  <div className="text-[9.5px] text-zinc-500 tabular-nums">{g}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 mb-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-2">
            Pendiente
          </div>
          <ul className="space-y-1.5 text-[12px] text-zinc-300">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              Eliminatorias (bracket)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              Máximo goleador
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              Mejor jugador (MVP)
            </li>
          </ul>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500 text-center">
          Tus pronósticos son <span className="text-zinc-300">anónimos</span> hasta el 11 jun.
        </p>
      </aside>
    </div>
  );
}

// ─── Desktop sub-components ──────────────────────────────────

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
  onScoreChange: (matchId: string, home: number | null, away: number | null) => void;
}) {
  const handleHome = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      const v = raw === "" ? null : Math.min(15, parseInt(raw, 10));
      onScoreChange(match.id, v, awayScore);
    },
    [match.id, awayScore, onScoreChange]
  );

  const handleAway = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      const v = raw === "" ? null : Math.min(15, parseInt(raw, 10));
      onScoreChange(match.id, homeScore, v);
    },
    [match.id, homeScore, onScoreChange]
  );

  return (
    <div
      className={cn(
        "rounded-xl border bg-zinc-900/40 p-4 transition-colors",
        complete ? "border-zinc-700" : "border-zinc-800/80"
      )}
    >
      <div className="flex items-center justify-between mb-3 text-[10.5px] uppercase tracking-[0.12em] text-zinc-500">
        <div>{day} · {time}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <TeamFlag code={match.home_team_data.code} size={36} className="shrink-0" />
          <div className="text-[15px] text-zinc-100 font-medium">
            {match.home_team_data.name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={2}
            value={homeScore ?? ""}
            placeholder="–"
            onChange={handleHome}
            disabled={disabled}
            className="w-[52px] h-[52px] rounded-lg bg-zinc-950 border border-zinc-800 text-center text-[26px] font-bold tabular-nums text-zinc-50 placeholder:text-zinc-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
            className="w-[52px] h-[52px] rounded-lg bg-zinc-950 border border-zinc-800 text-center text-[26px] font-bold tabular-nums text-zinc-50 placeholder:text-zinc-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
          />
        </div>
        <div className="flex items-center gap-2.5 flex-1 justify-end text-right">
          <div className="text-[15px] text-zinc-100 font-medium">
            {match.away_team_data.name}
          </div>
          <TeamFlag code={match.away_team_data.code} size={36} className="shrink-0" />
        </div>
      </div>
    </div>
  );
}

function DesktopStandingsCard({
  groupId,
  standings,
}: {
  groupId: string;
  standings: ReturnType<typeof computeStandings>;
}) {
  const { rows, counted, total } = standings;
  const provisional = counted < total;

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
            Tu clasificación
          </div>
          <div className="text-[13px] font-semibold text-zinc-100 leading-tight">
            Grupo {groupId}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10.5px] text-zinc-500 tabular-nums">{counted}/{total}</div>
          {provisional && counted > 0 && (
            <div className="text-[10px] text-amber-400/80">Provisional</div>
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
              <tr className="text-[9.5px] uppercase tracking-[0.1em] text-zinc-500">
                <th className="text-left font-medium pl-3 py-1.5 w-5">#</th>
                <th className="text-left font-medium py-1.5">Equipo</th>
                <th className="text-right font-medium px-1.5 tabular-nums w-7">PJ</th>
                <th className="text-right font-medium px-1.5 tabular-nums w-9">DG</th>
                <th className="text-right font-medium pr-3 tabular-nums w-9">PTS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const passes = i < 2;
                return (
                  <tr key={r.code} className="border-t border-zinc-800/60">
                    <td className="pl-3 py-1.5">
                      <span
                        className={cn(
                          "inline-block w-1 h-3 rounded-full mr-1 align-middle",
                          passes
                            ? provisional
                              ? "bg-primary opacity-40"
                              : "bg-primary"
                            : "opacity-0"
                        )}
                      />
                      <span className="text-zinc-500 tabular-nums">{i + 1}</span>
                    </td>
                    <td className="py-1.5 text-zinc-100">
                      <span className="inline-flex items-center gap-1.5">
                        <TeamFlag code={r.code} size={16} />
                        <span className={cn("text-[11.5px]", r.pj > 0 ? "" : "text-zinc-500")}>
                          {r.name}
                        </span>
                      </span>
                    </td>
                    <td className="text-right text-zinc-400 tabular-nums px-1.5">{r.pj}</td>
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
