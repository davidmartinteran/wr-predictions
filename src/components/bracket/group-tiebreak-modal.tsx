"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/team-flag";
import type { StandingRow } from "@/lib/bracket/standings";

type Props = {
  groupLetter: string;
  tiedTeams: StandingRow[];
  tiedPositions: number[];
  onResolve: (orderedTeamIds: string[]) => void;
  onClose: () => void;
};

export function GroupTiebreakModal({
  groupLetter,
  tiedTeams,
  tiedPositions,
  onResolve,
  onClose,
}: Props) {
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handlePick = (teamId: string) => {
    if (order.includes(teamId)) {
      setOrder(order.filter((id) => id !== teamId));
      return;
    }
    const next = [...order, teamId];
    if (next.length === tiedTeams.length) {
      onResolve(next);
      return;
    }
    setOrder(next);
  };

  const posLabel = tiedPositions.map((p) => `${p + 1}º`).join("-");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 touch-none" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <div className="text-[10.5px] uppercase tracking-wider text-amber-400 font-medium">
            Empate · Grupo {groupLetter}
          </div>
          <h3 className="text-[15px] font-semibold text-zinc-50 mt-1">
            Posiciones {posLabel}
          </h3>
          <p className="text-[12px] text-zinc-500 mt-1">
            Estos equipos están empatados en puntos, diferencia de goles y goles a favor.
            Toca en el orden que quieres que queden.
          </p>
        </div>

        <div className="space-y-1.5">
          {tiedTeams.map((team) => {
            const idx = order.indexOf(team.id);
            const picked = idx !== -1;
            const position = picked ? tiedPositions[idx] : null;

            return (
              <button
                key={team.id}
                onClick={() => handlePick(team.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border transition-colors text-left",
                  picked
                    ? "border-primary/60 bg-primary/8"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                )}
              >
                {picked ? (
                  <span className="w-6 h-6 rounded-full bg-primary text-zinc-950 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {position! + 1}º
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 shrink-0" />
                )}
                <TeamFlag code={team.code} size={24} className="shrink-0" />
                <span className="text-[13px] font-medium text-zinc-100 flex-1 truncate">
                  {team.name}
                </span>
                <span className="text-[10px] text-zinc-500 tabular-nums shrink-0">
                  {team.pts}p · {team.gd > 0 ? "+" : ""}{team.gd} · {team.gf}gf
                </span>
              </button>
            );
          })}
        </div>

        {order.length < tiedTeams.length && (
          <p className="mt-3 text-[11px] text-zinc-500 text-center">
            {order.length === 0
              ? `Toca el equipo que quieres en ${tiedPositions[0] + 1}º posición`
              : `Toca el siguiente equipo para la posición ${tiedPositions[order.length] + 1}º`}
          </p>
        )}
      </div>
    </div>
  );
}
