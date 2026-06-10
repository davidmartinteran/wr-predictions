"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatDayAbbrev, isTodayKey } from "@/lib/calendar/utils";
import type { TournamentDay } from "@/lib/calendar/types";

type Props = {
  days: TournamentDay[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
};

function getPhaseGroup(stage: string): string {
  return stage === "GROUP" ? "FASE DE GRUPOS" : "ELIMINATORIAS";
}

export function DaySidebar({ days, selectedDate, onSelectDate }: Props) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedDate]);

  const groups: { label: string; days: TournamentDay[] }[] = [];
  let currentGroup = "";

  for (const day of days) {
    const group = getPhaseGroup(day.matches[0].stage);
    if (group !== currentGroup) {
      groups.push({ label: group, days: [day] });
      currentGroup = group;
    } else {
      groups[groups.length - 1].days.push(day);
    }
  }

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-zinc-800/80 overflow-y-auto">
      <div className="px-4 pt-5 pb-3">
        <p className="text-[10.5px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
          MUNDIAL 2026
        </p>
        <h2 className="text-lg font-semibold text-zinc-50 mt-0.5">Calendario</h2>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="px-2 pb-2">
          <p className="px-2 pt-3 pb-1.5 text-[9.5px] uppercase tracking-[0.14em] text-zinc-600 font-medium">
            {group.label}
          </p>
          {group.days.map((day) => {
            const { dayName, dayNum } = formatDayAbbrev(day.date);
            const isSelected = day.dateKey === selectedDate;
            const isToday = isTodayKey(day.dateKey);

            return (
              <button
                key={day.dateKey}
                ref={isSelected ? selectedRef : undefined}
                onClick={() => onSelectDate(day.dateKey)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  isSelected
                    ? "bg-zinc-900 border border-zinc-800"
                    : "hover:bg-zinc-900/50",
                  isToday && !isSelected && "border-l-2 border-primary"
                )}
              >
                <div className="flex flex-col items-center w-8 shrink-0">
                  <span
                    className={cn(
                      "text-[9px] uppercase tracking-wider font-medium",
                      isSelected || isToday ? "text-primary" : "text-zinc-500"
                    )}
                  >
                    {dayName}
                  </span>
                  <span
                    className={cn(
                      "text-[15px] font-semibold",
                      isSelected ? "text-zinc-50" : "text-zinc-300"
                    )}
                  >
                    {dayNum}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-[12px] truncate",
                      isSelected ? "text-zinc-200" : "text-zinc-400"
                    )}
                  >
                    {day.phase}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {day.hasLive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  )}
                  <span className="text-[11px] text-zinc-500 tabular-nums">
                    {day.matches.length}
                  </span>
                </div>
                {isToday && (
                  <span className="text-[9px] font-semibold bg-primary/15 text-primary px-1.5 py-0.5 rounded">
                    HOY
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
