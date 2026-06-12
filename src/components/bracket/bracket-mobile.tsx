"use client";

import { useState } from "react";
import { Trophy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/team-flag";
import { BracketMatchCard } from "./bracket-match";
import { STAGES, STAGE_LABELS, STAGE_MATCH_COUNTS, type Stage } from "@/lib/bracket/mapping";
import type { BracketState } from "@/lib/bracket/engine";
import type { TeamInfo } from "@/lib/bracket/standings";

type Props = {
  bracketState: BracketState;
  disabled: boolean;
  onPickWinner: (stage: Stage, slot: number, teamId: string) => void;
  onClear?: () => void;
};

const MOBILE_TABS: { stage: Stage; short: string }[] = [
  { stage: "R32", short: "R32" },
  { stage: "R16", short: "R16" },
  { stage: "QF", short: "QF" },
  { stage: "SF", short: "SF" },
  { stage: "FINAL", short: "F" },
];

export function BracketMobileView({ bracketState, disabled, onPickWinner, onClear }: Props) {
  const [activeRound, setActiveRound] = useState<Stage>("R32");
  const matches = bracketState.matches[activeRound];
  const label = STAGE_LABELS[activeRound];
  const total = STAGE_MATCH_COUNTS[activeRound];
  const filled = matches.filter((m) => m.winner).length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Round tabs */}
      <div className="flex gap-1.5 px-4 py-2 shrink-0">
        {MOBILE_TABS.map(({ stage, short }) => {
          const active = activeRound === stage;
          const roundFilled = bracketState.matches[stage].filter((m) => m.winner).length;
          const roundTotal = STAGE_MATCH_COUNTS[stage];
          const complete = roundFilled === roundTotal;
          return (
            <button
              key={stage}
              onClick={() => setActiveRound(stage)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border",
                active
                  ? "bg-purple-500/12 border-purple-500 text-purple-400"
                  : complete
                    ? "bg-zinc-800/60 border-zinc-700 text-zinc-300"
                    : "bg-zinc-900/60 border-zinc-800/80 text-zinc-500"
              )}
            >
              {short}
            </button>
          );
        })}
      </div>

      {/* Round header */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <span className="text-[12px] text-zinc-400">
          {label}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-zinc-500 tabular-nums">
            {filled}/{total} partidos
          </span>
          {!disabled && bracketState.filledCount > 0 && onClear && (
            <button
              onClick={onClear}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
              title="Limpiar bracket"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Match list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pt-1 pb-3 space-y-2.5">
        {matches.map((m) => (
          <BracketMatchCard
            key={`${m.stage}:${m.slot}`}
            homeTeam={m.homeTeam}
            awayTeam={m.awayTeam}
            winner={m.winner}
            disabled={disabled}
            onPickWinner={(teamId) => onPickWinner(m.stage, m.slot, teamId)}
          />
        ))}
      </div>

      {/* Champion badge */}
      {bracketState.champion && (
        <ChampionBadge champion={bracketState.champion} />
      )}
    </div>
  );
}

function ChampionBadge({ champion }: { champion: TeamInfo }) {
  return (
    <div className="shrink-0 mx-4 mb-3 flex items-center gap-2.5 rounded-xl border border-primary/40 bg-primary/8 px-4 py-2.5">
      <Trophy className="w-4 h-4 text-primary shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500">Tu campeón</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <TeamFlag code={champion.code} size={16} className="shrink-0" />
          <span className="text-[13px] font-semibold text-zinc-50 truncate">{champion.name}</span>
        </div>
      </div>
    </div>
  );
}
