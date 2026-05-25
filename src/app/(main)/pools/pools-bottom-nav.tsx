"use client";

import Link from "next/link";
import { List, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  firstPoolId?: string;
};

export function PoolsBottomNav({ firstPoolId }: Props) {
  const tabs = [
    ...(firstPoolId
      ? [
          { href: `/pools/${firstPoolId}/predictions`, label: "Pronósticos", icon: List },
          { href: `/pools/${firstPoolId}/leaderboard`, label: "Clasificación", icon: Trophy },
        ]
      : []),
    { href: "/pools", label: "Mis porras", icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-sm lg:hidden">
      <div className="flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/pools";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1.5 text-[11px]",
                active ? "text-zinc-50" : "text-zinc-500"
              )}
            >
              <Icon
                className={cn("h-5 w-5", active && "text-primary")}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
