"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/team-flag";
import type { TeamInfo } from "@/lib/bracket/standings";

type Props = {
  homeTeam: TeamInfo | null;
  awayTeam: TeamInfo | null;
  winner: TeamInfo | null;
  disabled: boolean;
  onPickWinner: (teamId: string) => void;
};

function TeamRow({
  team,
  isWinner,
  disabled,
  onClick,
}: {
  team: TeamInfo | null;
  isWinner: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  if (!team) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-zinc-600 italic">
        Por definir
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 w-full text-left transition-colors",
        "disabled:cursor-not-allowed",
        isWinner
          ? "bg-primary/10 border-l-2 border-l-primary"
          : "border-l-2 border-l-transparent hover:bg-zinc-800/40"
      )}
    >
      <TeamFlag code={team.code} size={22} className="shrink-0" />
      <span
        className={cn(
          "text-[13px] font-medium truncate flex-1 min-w-0",
          isWinner ? "text-zinc-50" : "text-zinc-300"
        )}
      >
        {team.name}
      </span>
      {isWinner && (
        <span className="flex items-center gap-1 shrink-0 text-[10px] font-semibold text-primary uppercase tracking-wider">
          <Check className="w-3 h-3" />
          Pasa
        </span>
      )}
    </button>
  );
}

export function BracketMatchCard({ homeTeam, awayTeam, winner, disabled, onPickWinner }: Props) {
  const bothTeamsPresent = homeTeam && awayTeam;

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
      <TeamRow
        team={homeTeam}
        isWinner={!!winner && winner.id === homeTeam?.id}
        disabled={disabled || !bothTeamsPresent}
        onClick={() => homeTeam && onPickWinner(homeTeam.id)}
      />
      <div className="border-t border-zinc-800/60" />
      <TeamRow
        team={awayTeam}
        isWinner={!!winner && winner.id === awayTeam?.id}
        disabled={disabled || !bothTeamsPresent}
        onClick={() => awayTeam && onPickWinner(awayTeam.id)}
      />
    </div>
  );
}
