"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, List, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

function extractPoolId(pathname: string): string | null {
  const match = pathname.match(/^\/pools\/([^/]+)/);
  if (!match || match[1] === "new") return null;
  return match[1];
}

export function BottomNav({ firstPoolId }: { firstPoolId: string }) {
  const pathname = usePathname();
  const poolId = extractPoolId(pathname) ?? firstPoolId;
  const base = `/pools/${poolId}`;

  const tabs = [
    { href: `${base}/calendar`, label: "Calendario", icon: CalendarDays },
    { href: `${base}/predictions`, label: "Pronósticos", icon: List },
    { href: `${base}/leaderboard`, label: "Clasificación", icon: Trophy },
    { href: `/pools`, label: "Mi Porra", icon: User },
  ] as const;

  return (
    // El safe-area va en el nav (no dentro del h-16): la barra crece con el
    // inset en vez de comprimir su contenido, y el layout compensa con
    // pb-[calc(4rem+env(safe-area-inset-bottom))]
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/pools"
              ? pathname === "/pools" || pathname.startsWith("/pools/new")
              : pathname.startsWith(href);
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
