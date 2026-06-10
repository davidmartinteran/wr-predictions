"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDayHeader, isTodayKey } from "@/lib/calendar/utils";
import type { TournamentDay } from "@/lib/calendar/types";

type Props = {
  day: TournamentDay;
  liveCount: number;
  onPrevDay: () => void;
  onNextDay: () => void;
  hasPrev: boolean;
  hasNext: boolean;
};

export function DayHeader({
  day,
  liveCount,
  onPrevDay,
  onNextDay,
  hasPrev,
  hasNext,
}: Props) {
  const isToday = isTodayKey(day.dateKey);
  const title = formatDayHeader(day.date);

  return (
    <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 lg:px-0 lg:pt-0 lg:pb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[10.5px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
            {day.phase}
          </p>
          {isToday && (
            <span className="text-[9px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded">
              HOY
            </span>
          )}
          {liveCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold bg-rose-500/15 text-rose-400 px-1.5 py-0.5 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              {liveCount} EN VIVO
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-zinc-50 capitalize">{title}</h2>
      </div>

      <div className="flex items-center gap-1 shrink-0 mt-2">
        <button
          onClick={onPrevDay}
          disabled={!hasPrev}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            hasPrev ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60" : "text-zinc-700"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[11px] text-zinc-500 tabular-nums min-w-[70px] text-center">
          {day.matches.length} {day.matches.length === 1 ? "partido" : "partidos"}
        </span>
        <button
          onClick={onNextDay}
          disabled={!hasNext}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            hasNext ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60" : "text-zinc-700"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
