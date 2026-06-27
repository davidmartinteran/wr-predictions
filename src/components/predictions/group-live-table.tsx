"use client";

import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/team-flag";
import type { GroupStandings } from "@/lib/bracket/standings";

type GroupLiveTableProps = {
  groupId: string;
  standings: GroupStandings;
  isLive: boolean;
  // Partidos ya TERMINADOS del grupo (los en vivo tienen marcador pero no
  // cuentan): determina si la clasificación es definitiva o provisional.
  finishedCount: number;
};

// Clasificación REAL del grupo (marcadores reales de los partidos, no del
// pronóstico). Se muestra encima de las predicciones para ver cómo va el grupo
// y quién pasa en vivo. La franja de pronóstico (StandingsStrip) se mantiene.
export function GroupLiveTable({ groupId, standings, isLive, finishedCount }: GroupLiveTableProps) {
  const { rows, counted, total } = standings;
  const notStarted = counted === 0;
  const complete = finishedCount >= total;

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 mb-3 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/80">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
            Clasificación real
          </div>
          <div className="text-[12.5px] font-semibold text-zinc-100 leading-tight">
            Grupo {groupId}
          </div>
        </div>
        {isLive ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            EN VIVO
          </div>
        ) : notStarted ? (
          <div className="text-[10px] text-zinc-600">Sin empezar</div>
        ) : (
          <div className="text-[10px] tabular-nums text-zinc-500">
            {complete ? (
              <span className="text-primary font-medium">Definitiva</span>
            ) : (
              <>
                {finishedCount}/{total} jugados
              </>
            )}
          </div>
        )}
      </div>

      {notStarted ? (
        <div className="px-4 py-4 text-center text-[11.5px] text-zinc-500">
          Aún no hay resultados en el Grupo {groupId}.
        </div>
      ) : (
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="text-[9.5px] uppercase tracking-widest text-zinc-500">
              <th className="text-left font-medium pl-3 py-1.5 w-5">#</th>
              <th className="text-left font-medium py-1.5">Equipo</th>
              <th className="text-right font-medium px-1.5 tabular-nums w-7">PJ</th>
              <th className="text-right font-medium px-1.5 tabular-nums w-9">DG</th>
              <th className="text-right font-medium pr-3 tabular-nums w-9">PTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const passes = i < 2;
              return (
                <tr
                  key={r.code}
                  className="border-t border-zinc-800/60 align-middle"
                >
                  <td className="pl-3 py-2">
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          "w-1 h-3 rounded-full shrink-0",
                          passes
                            ? complete
                              ? "bg-primary"
                              : "bg-primary opacity-50"
                            : "opacity-0",
                        )}
                      />
                      <span className="text-zinc-500 tabular-nums">{i + 1}</span>
                    </div>
                  </td>
                  <td className="py-2 pl-2 text-zinc-100 max-w-0 overflow-hidden">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TeamFlag code={r.code} size={16} className="shrink-0" />
                      <span
                        className={cn(
                          "text-[11.5px] truncate",
                          r.pj > 0 ? "" : "text-zinc-500",
                        )}
                      >
                        {r.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-right text-zinc-400 tabular-nums px-1.5">
                    {r.pj}
                  </td>
                  <td className="text-right text-zinc-400 tabular-nums px-1.5">
                    {r.gd > 0 ? `+${r.gd}` : r.gd}
                  </td>
                  <td className="text-right text-zinc-50 font-semibold tabular-nums pr-3">
                    {r.pts}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!notStarted && (
        <div className="px-3 py-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 flex items-center gap-1.5">
          <span className="inline-block w-1 h-2.5 rounded-full bg-primary" />
          Pasan a octavos
        </div>
      )}
    </div>
  );
}
