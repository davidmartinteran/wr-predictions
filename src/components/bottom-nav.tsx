"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/predictions", label: "Pronósticos", icon: List },
  { href: "/leaderboard", label: "Clasificación", icon: Trophy },
  { href: "/profile", label: "Mi Porra", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-sm lg:hidden">
      <div className="flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
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
