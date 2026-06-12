import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

function PoolCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-36" />
          <div className="mt-1.5 flex items-center gap-3">
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="h-3.5 w-14" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
      </div>
    </div>
  );
}

export default function PoolsListLoading() {
  return (
    <div className="flex flex-col h-dvh">
      {/* Desktop header — matches actual header */}
      <header className="hidden lg:flex h-14 border-b border-zinc-800/80 bg-zinc-950/95 shrink-0 items-center px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <Trophy className="w-4 h-4 text-zinc-950" />
          </div>
          <Skeleton className="h-4 w-28" />
        </div>
        <nav className="ml-10 flex items-center gap-1">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <span className="px-3 py-1.5 text-[13px] rounded-md bg-zinc-900 text-zinc-50 border border-zinc-800">
            Mi Porra
          </span>
        </nav>
      </header>

      <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:py-12">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
                Mis porras
              </h1>
              <Skeleton className="mt-1.5 h-4 w-16" />
            </div>
          </header>

          <ul className="space-y-3">
            {[1, 2, 3].map((i) => (
              <li key={i}>
                <PoolCardSkeleton />
              </li>
            ))}
          </ul>

          {/* Bottom actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1 h-3 w-36" />
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
