"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/team-flag";
import type { PlayerBracket, TeamPick } from "./page";

type Props = {
  poolName: string;
  players: PlayerBracket[];
  currentUserId: string;
  initialUserId?: string;
};

function PtsBadge({ points }: { points: number | null }) {
  if (points === null) {
    return (
      <span className="text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
        —
      </span>
    );
  }
  return (
    <span
      className={cn(
        "text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded",
        points > 0 ? "bg-primary/15 text-primary" : "bg-zinc-800 text-zinc-500",
      )}
    >
      {points > 0 ? `+${points}` : "0"}
    </span>
  );
}

function Round({ label, teams }: { label: string; teams: TeamPick[] }) {
  const [open, setOpen] = useState(false);
  if (teams.length === 0) return null;
  const total = teams.reduce((s, t) => s + (t.points ?? 0), 0);

  return (
    <div className="border-t border-zinc-800/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-zinc-800/20 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-zinc-600 transition-transform shrink-0",
              !open && "-rotate-90",
            )}
          />
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 shrink-0">
            {label}
          </span>
          <span className="text-[10px] text-zinc-600 tabular-nums shrink-0">
            {teams.length}
          </span>
          {!open && (
            <div className="flex items-center gap-1 ml-1 overflow-hidden">
              {teams.map((t) => (
                <TeamFlag key={t.code} code={t.code} size={15} className="shrink-0" />
              ))}
            </div>
          )}
        </div>
        <span className="text-[11px] font-semibold text-primary tabular-nums shrink-0 ml-2">
          +{total}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-2.5 pl-9 space-y-1.5">
          {teams.map((t) => (
            <div key={t.code} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[12px] text-zinc-200 min-w-0">
                <TeamFlag code={t.code} size={18} className="shrink-0" />
                <span className="truncate">{t.name}</span>
              </span>
              <PtsBadge points={t.points} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerCard({ p }: { p: PlayerBracket }) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
      <div className="px-4 py-3.5 bg-gradient-to-b from-amber-500/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 shrink-0">
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold">
                Campeón
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {p.champion ? (
                  <>
                    <TeamFlag code={p.champion.code} size={24} />
                    <span className="text-[16px] font-bold text-zinc-50 truncate">
                      {p.champion.name}
                    </span>
                  </>
                ) : (
                  <span className="text-[14px] text-zinc-600 italic">Sin pick</span>
                )}
              </div>
            </div>
          </div>
          {p.champion && <PtsBadge points={p.champion.points} />}
        </div>

        {p.runnerUp && (
          <div className="flex items-center justify-between mt-2.5 pl-12">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 shrink-0">
                Subcampeón
              </span>
              <TeamFlag code={p.runnerUp.code} size={18} />
              <span className="text-[13px] font-medium text-zinc-200 truncate">
                {p.runnerUp.name}
              </span>
            </div>
            <PtsBadge points={p.runnerUp.points} />
          </div>
        )}
      </div>

      <Round label="Semifinales" teams={p.sf} />
      <Round label="Cuartos" teams={p.qf} />
      <Round label="Octavos" teams={p.r16} />
      <Round label="Dieciseisavos" teams={p.r32} />
    </div>
  );
}

export function BracketsClient({ poolName, players, currentUserId, initialUserId }: Props) {
  const start = Math.max(
    0,
    players.findIndex((p) => p.userId === (initialUserId ?? currentUserId)),
  );
  const [i, setI] = useState(start);

  if (players.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-[13px] text-zinc-500">
        Aún no hay brackets que mostrar.
      </div>
    );
  }

  const p = players[i];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto max-w-sm px-4 py-5 lg:py-8">
        <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
          {poolName} · Brackets
        </div>

        <div className="flex items-center justify-between my-3">
          <button
            onClick={() => setI((i - 1 + players.length) % players.length)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center min-w-0 px-2">
            <div className="text-[15px] font-semibold text-zinc-100 truncate">
              {p.displayName}
              {p.userId === currentUserId && (
                <span className="text-[11px] ml-1.5 font-normal text-primary">· tú</span>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 tabular-nums">
              {i + 1} / {players.length} · {p.total} pts
            </div>
          </div>
          <button
            onClick={() => setI((i + 1) % players.length)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <PlayerCard p={p} />
      </div>
    </div>
  );
}
