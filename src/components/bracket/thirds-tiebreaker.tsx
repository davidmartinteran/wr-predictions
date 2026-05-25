"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/team-flag";
import type { ThirdPlaceTeam } from "@/lib/bracket/engine";

type Props = {
  autoQualified: ThirdPlaceTeam[];
  tiedTeams: ThirdPlaceTeam[];
  neededCount: number;
  selected: string[];
  onToggle: (teamId: string) => void;
};

export function ThirdsTiebreaker({
  autoQualified,
  tiedTeams,
  neededCount,
  selected,
  onToggle,
}: Props) {
  const canSelectMore = selected.length < neededCount;

  return (
    <div className="px-4 lg:px-6 py-6">
      <div className="max-w-lg mx-auto">
        <div className="mb-5">
          <div className="text-[10.5px] uppercase tracking-wider text-amber-400 font-medium">
            Empate entre terceros
          </div>
          <h3 className="text-[17px] font-semibold text-zinc-50 mt-1">
            Elige cuáles clasifican
          </h3>
          <p className="text-[12px] text-zinc-500 mt-1 leading-relaxed">
            Hay empate entre terceros de grupo en el corte de clasificación.
            Selecciona {neededCount} de {tiedTeams.length} para completar los 8 mejores terceros.
          </p>
        </div>

        {/* Auto-qualified thirds */}
        {autoQualified.length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">
              Clasificados directos ({autoQualified.length})
            </div>
            <div className="space-y-1">
              {autoQualified.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60"
                >
                  <TeamFlag code={team.code} size={20} className="shrink-0" />
                  <span className="text-[12px] text-zinc-300 flex-1 truncate">{team.name}</span>
                  <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Grupo {team.group}</span>
                  <span className="text-[10px] text-zinc-500 tabular-nums">
                    {team.pts}p · {team.gd > 0 ? "+" : ""}{team.gd}
                  </span>
                  <Check className="w-3 h-3 text-primary shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tied teams to pick from */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-600">
              Empatados — elige {neededCount}
            </span>
            <span className={cn(
              "text-[11px] tabular-nums font-medium",
              selected.length === neededCount ? "text-primary" : "text-zinc-500"
            )}>
              {selected.length}/{neededCount}
            </span>
          </div>
          <div className="space-y-1.5">
            {tiedTeams.map((team) => {
              const isSelected = selected.includes(team.id);
              const isDisabled = !isSelected && !canSelectMore;

              return (
                <button
                  key={team.id}
                  onClick={() => onToggle(team.id)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg border transition-colors text-left",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    isSelected
                      ? "border-primary/60 bg-primary/8"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  )}
                >
                  <TeamFlag code={team.code} size={22} className="shrink-0" />
                  <span className="text-[13px] font-medium text-zinc-100 flex-1 truncate">
                    {team.name}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider shrink-0">
                    Grupo {team.group}
                  </span>
                  <span className="text-[10px] text-zinc-500 tabular-nums shrink-0">
                    {team.pts}p · {team.gd > 0 ? "+" : ""}{team.gd} · {team.gf}gf
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
