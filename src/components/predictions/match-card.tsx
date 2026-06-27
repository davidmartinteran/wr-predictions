"use client";

import { useCallback } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { TeamBadge } from "./team-badge";
import { ScoreInput } from "./score-input";
import { cn } from "@/lib/utils";

type Team = {
  id: string;
  name: string;
  code: string;
  flag_emoji: string | null;
};

type MatchCardProps = {
  matchId: string;
  matchday: number;
  homeTeam: Team;
  awayTeam: Team;
  kickoff: string;
  homeScore: number | null;
  awayScore: number | null;
  disabled?: boolean;
  onScoreChange: (matchId: string, home: number | null, away: number | null) => void;
  complete?: boolean;
  calendarHref?: string;
};

export function MatchCard({
  matchId,
  matchday,
  homeTeam,
  awayTeam,
  kickoff,
  homeScore,
  awayScore,
  disabled,
  onScoreChange,
  complete: completeProp,
  calendarHref,
}: MatchCardProps) {
  const complete = completeProp ?? (homeScore !== null && awayScore !== null);

  const date = new Date(kickoff);
  const day = date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const time = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const handleHomeChange = useCallback(
    (v: number | null) => onScoreChange(matchId, v, awayScore),
    [matchId, awayScore, onScoreChange]
  );

  const handleAwayChange = useCallback(
    (v: number | null) => onScoreChange(matchId, homeScore, v),
    [matchId, homeScore, onScoreChange]
  );

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-colors",
        complete
          ? "border-zinc-700/80 bg-zinc-900/60"
          : "border-zinc-800/80 bg-zinc-900/40"
      )}
    >
      <div className="flex items-center gap-2 mb-2.5 text-[10.5px] uppercase tracking-[0.12em] text-zinc-500">
        <span>J{matchday}</span>
        <span className="text-zinc-700">·</span>
        <span>{day}</span>
        <span className="text-zinc-700">·</span>
        <span>{time}</span>
      </div>

      <div className="flex items-center gap-2.5">
        <TeamBadge
          name={homeTeam.name}
          code={homeTeam.code}
          flag={homeTeam.flag_emoji}
          side="home"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <ScoreInput
            value={homeScore}
            onChange={handleHomeChange}
            disabled={disabled}
          />
          <span className="text-zinc-700 text-[14px]">:</span>
          <ScoreInput
            value={awayScore}
            onChange={handleAwayChange}
            disabled={disabled}
          />
        </div>

        <TeamBadge
          name={awayTeam.name}
          code={awayTeam.code}
          flag={awayTeam.flag_emoji}
          side="away"
        />
      </div>

      {calendarHref && (
        <Link
          href={calendarHref}
          className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <CalendarDays className="w-3 h-3" />
          Ver en calendario
        </Link>
      )}
    </div>
  );
}
