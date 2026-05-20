"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, List, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/predictions", label: "Pronósticos", icon: List },
  { href: "/leaderboard", label: "Clasificación", icon: Trophy },
  { href: "/profile", label: "Mi Porra", icon: User },
] as const;

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="hidden lg:flex h-14 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur shrink-0 items-center px-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
          <Trophy className="w-4 h-4 text-zinc-950" />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-zinc-50">
            Porra Mundial 2026
          </div>
          <div className="text-[10.5px] text-zinc-500 tabular-nums">
            Los Amigos · 30 jugadores
          </div>
        </div>
      </div>

      <nav className="ml-10 flex items-center gap-1">
        {tabs.map(({ href, label }) => {
          const active = pathname.startsWith(href);
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
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-semibold text-zinc-200">
          DM
        </div>
      </div>
    </header>
  );
}
