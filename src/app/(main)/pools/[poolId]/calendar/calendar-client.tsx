"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  groupMatchesByDay,
  findTodayOrNearest,
  isLiveMatch,
  isSpainMatch,
  isTodayKey,
} from "@/lib/calendar/utils";
import {
  scoreGroupMatch,
  DEFAULT_RULES,
  type ScoringRules,
  type MatchScore,
} from "@/lib/scoring/engine";
import { DateStrip } from "@/components/calendar/date-strip";
import { DaySidebar } from "@/components/calendar/day-sidebar";
import { DayHeader } from "@/components/calendar/day-header";
import { CalendarMatchCard } from "@/components/calendar/calendar-match-card";
import type {
  CalendarMatch,
  CalendarPrediction,
  TournamentDay,
} from "@/lib/calendar/types";

type Props = {
  matches: CalendarMatch[];
  predictions: CalendarPrediction[];
  scoringRules: ScoringRules | null;
};

export function CalendarClient({ matches, predictions, scoringRules }: Props) {
  const rules = scoringRules ?? DEFAULT_RULES;
  const router = useRouter();

  // Refresca datos del server cada 60s mientras haya partidos en ventana de
  // juego (la Edge Function poll-results actualiza la BD cada 5 min).
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      const active = matches.some((m) => {
        if (m.finished || m.status === "FINISHED") return false;
        if (m.status === "LIVE") return true;
        const kickoff = new Date(m.kickoff).getTime();
        return now >= kickoff - 5 * 60_000 && now <= kickoff + 3.5 * 3_600_000;
      });
      if (active) router.refresh();
    }, 60_000);
    return () => clearInterval(interval);
  }, [matches, router]);

  const predMap = useMemo(() => {
    const map = new Map<string, CalendarPrediction>();
    for (const p of predictions) map.set(p.match_id, p);
    return map;
  }, [predictions]);

  const days = useMemo(() => groupMatchesByDay(matches), [matches]);

  const [selectedDate, setSelectedDate] = useState(() =>
    findTodayOrNearest(days),
  );

  const currentDayIdx = days.findIndex((d) => d.dateKey === selectedDate);
  const currentDay: TournamentDay | undefined = days[currentDayIdx];

  const navigate = useCallback(
    (dir: -1 | 1) => {
      const next = currentDayIdx + dir;
      if (next >= 0 && next < days.length) {
        setSelectedDate(days[next].dateKey);
      }
    },
    [currentDayIdx, days],
  );

  const goToToday = useCallback(() => {
    setSelectedDate(findTodayOrNearest(days));
  }, [days]);

  function getScoring(match: CalendarMatch): MatchScore | null {
    if (!match.finished || match.stage !== "GROUP") return null;
    if (match.home_score === null || match.away_score === null) return null;
    const pred = predMap.get(match.id);
    if (!pred || pred.home_score === null || pred.away_score === null)
      return null;
    return scoreGroupMatch(
      { home_score: pred.home_score, away_score: pred.away_score },
      { home_score: match.home_score, away_score: match.away_score },
      rules,
      isSpainMatch(match),
    );
  }

  const liveCount = currentDay?.matches.filter(isLiveMatch).length ?? 0;

  if (!currentDay) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        No hay partidos programados
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Desktop sidebar */}
      <DaySidebar
        days={days}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden px-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
                MUNDIAL 2026
              </p>
              <h1 className="text-xl font-semibold text-zinc-50">Calendario</h1>
            </div>
            <button
              onClick={goToToday}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border",
                isTodayKey(selectedDate)
                  ? "border-primary/40 text-primary"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Hoy
            </button>
          </div>
        </div>

        {/* Mobile date strip */}
        <div className="lg:hidden">
          <DateStrip
            days={days}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Day content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 lg:px-6 lg:pt-5">
          {/* Desktop: "Hoy" button */}
          <div className="hidden lg:flex justify-end mb-3">
            <button
              onClick={goToToday}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border",
                isTodayKey(selectedDate)
                  ? "border-primary/40 text-primary"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Ir a hoy
            </button>
          </div>

          <DayHeader
            day={currentDay}
            liveCount={liveCount}
            onPrevDay={() => navigate(-1)}
            onNextDay={() => navigate(1)}
            hasPrev={currentDayIdx > 0}
            hasNext={currentDayIdx < days.length - 1}
          />

          {/* Match cards */}
          <div className="grid gap-2.5 lg:grid-cols-2">
            {currentDay.matches.map((match) => (
              <CalendarMatchCard
                key={match.id}
                match={match}
                prediction={predMap.get(match.id) ?? null}
                scoring={getScoring(match)}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
