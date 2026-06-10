"use client";

import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDayAbbrev, isTodayKey } from "@/lib/calendar/utils";
import type { TournamentDay } from "@/lib/calendar/types";

type Props = {
  days: TournamentDay[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
};

export function DateStrip({ days, selectedDate, onSelectDate }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedDate]);

  const currentIdx = days.findIndex((d) => d.dateKey === selectedDate);

  function navigate(dir: -1 | 1) {
    const next = currentIdx + dir;
    if (next >= 0 && next < days.length) {
      onSelectDate(days[next].dateKey);
    }
  }

  return (
    <div className="flex items-center gap-1 px-2 py-2">
      <button
        onClick={() => navigate(-1)}
        disabled={currentIdx <= 0}
        className="shrink-0 p-1.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {days.map((day) => {
          const { dayName, dayNum, monthShort } = formatDayAbbrev(day.date);
          const isSelected = day.dateKey === selectedDate;
          const isToday = isTodayKey(day.dateKey);

          return (
            <button
              key={day.dateKey}
              ref={isSelected ? selectedRef : undefined}
              onClick={() => onSelectDate(day.dateKey)}
              className={cn(
                "relative flex flex-col items-center shrink-0 w-12 py-1.5 rounded-lg text-center transition-colors",
                isSelected
                  ? "bg-primary text-zinc-950"
                  : isToday
                    ? "border border-primary/60 text-zinc-200"
                    : "text-zinc-400 hover:bg-zinc-800/60"
              )}
            >
              <span className="text-[10px] font-medium tracking-wider">
                {dayName}
              </span>
              <span className="text-[15px] font-semibold leading-tight">
                {dayNum}
              </span>
              <span
                className={cn(
                  "text-[9px]",
                  isSelected ? "text-zinc-950/70" : "text-zinc-500"
                )}
              >
                {monthShort}
              </span>
              {day.hasLive && !isSelected && (
                <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => navigate(1)}
        disabled={currentIdx >= days.length - 1}
        className="shrink-0 p-1.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
