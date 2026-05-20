"use client";

import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/team-flag";

type StandingRow = {
  code: string;
  flag: string | null;
  pts: number;
};

type StandingsStripProps = {
  groupId: string;
  rows: StandingRow[];
  counted: number;
  total: number;
};

export function StandingsStrip({ groupId, rows, counted, total }: StandingsStripProps) {
  const provisional = counted < total;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[9.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
          Grupo {groupId}{" "}
          <span className="text-zinc-600 normal-case tracking-normal ml-1">
            · quién pasa
          </span>
        </div>
        <div
          className={cn(
            "text-[9.5px] tabular-nums",
            provisional ? "text-amber-400/85" : "text-primary"
          )}
        >
          {provisional ? `Provisional · ${counted}/${total}` : "Definitivo"}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {rows.map((r, i) => {
          const pass = i < 2;
          return (
            <div
              key={r.code}
              className={cn(
                "flex items-center gap-1.5 px-1.5 py-1 rounded-md",
                pass
                  ? "bg-primary/10 border-b-2 border-primary"
                  : "border-b-2 border-zinc-800"
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-semibold tabular-nums shrink-0",
                  pass ? "text-primary" : "text-zinc-600"
                )}
              >
                {i + 1}
              </span>
              <TeamFlag code={r.code} size={18} className="shrink-0" />
              <span
                className={cn(
                  "text-[11px] font-semibold tracking-wide font-mono",
                  pass ? "text-zinc-50" : "text-zinc-400"
                )}
              >
                {r.code}
              </span>
              <span className="text-[10px] tabular-nums text-zinc-500 ml-auto">
                {r.pts}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
