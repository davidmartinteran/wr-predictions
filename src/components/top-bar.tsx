"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  poolId: string;
  poolName: string;
  participantCount: number;
  displayName: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TopBar({ poolId, poolName, participantCount, displayName }: Props) {
  const pathname = usePathname();
  const base = `/pools/${poolId}`;

  const tabs = [
    { href: `${base}/calendar`, label: "Calendario" },
    { href: `${base}/predictions`, label: "Pronósticos" },
    { href: `${base}/leaderboard`, label: "Clasificación" },
    { href: `/pools`, label: "Mi Porra" },
  ];

  return (
    <header className="hidden lg:flex h-14 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur shrink-0 items-center px-6">
      <Link href="/pools" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
          <Trophy className="w-4 h-4 text-zinc-950" />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-zinc-50">{poolName}</div>
          <div className="text-[10.5px] text-zinc-500 tabular-nums">
            {participantCount} {participantCount === 1 ? "jugador" : "jugadores"}
          </div>
        </div>
      </Link>

      <nav className="ml-10 flex items-center gap-1">
        {tabs.map(({ href, label }) => {
          const active =
            href === "/pools"
              ? pathname === "/pools" || pathname.startsWith("/pools/new")
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 text-[13px] rounded-md transition-colors",
                active
                  ? "bg-zinc-900 text-zinc-50 border border-zinc-800"
                  : "text-zinc-400 hover:text-zinc-300"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div
          title={displayName}
          className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-semibold text-zinc-200"
        >
          {getInitials(displayName)}
        </div>
      </div>
    </header>
  );
}
