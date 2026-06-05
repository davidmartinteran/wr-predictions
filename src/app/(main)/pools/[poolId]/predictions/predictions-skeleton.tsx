import { Skeleton } from "@/components/ui/skeleton";

function MatchCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5">
      {/* Date row */}
      <div className="flex items-center gap-2 mb-2.5">
        <Skeleton className="h-3 w-5" />
        <span className="text-zinc-800">·</span>
        <Skeleton className="h-3 w-14" />
        <span className="text-zinc-800">·</span>
        <Skeleton className="h-3 w-10" />
      </div>
      {/* Teams + scores */}
      <div className="flex items-center gap-2.5">
        {/* Home team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Skeleton className="w-7 h-7 rounded shrink-0" />
          <div className="min-w-0">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="mt-1 h-2.5 w-10" />
          </div>
        </div>
        {/* Score inputs */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Skeleton className="w-[44px] h-[44px] rounded-lg md:w-[52px] md:h-[52px]" />
          <span className="text-zinc-700 text-[14px]">:</span>
          <Skeleton className="w-[44px] h-[44px] rounded-lg md:w-[52px] md:h-[52px]" />
        </div>
        {/* Away team */}
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse text-right justify-end">
          <Skeleton className="w-7 h-7 rounded shrink-0" />
          <div className="min-w-0">
            <Skeleton className="h-3.5 w-16 ml-auto" />
            <Skeleton className="mt-1 h-2.5 w-12 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileSectionPillSkeleton() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-zinc-800/80 bg-zinc-900/60">
      <Skeleton className="w-3.5 h-3.5 rounded" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-2.5 w-8" />
      </div>
    </div>
  );
}

function StandingsStripSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-1.5 py-1 rounded-md border-b-2 border-zinc-800"
          >
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="w-[18px] h-[18px] rounded" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-2.5 w-4 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopGroupItemSkeleton({ active }: { active?: boolean }) {
  return (
    <div
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 border ${active ? "bg-zinc-900 border-zinc-800" : "border-transparent"}`}
    >
      <Skeleton className="w-7 h-7 rounded-md" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-3.5 w-16 mb-1" />
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-3.5 h-3.5 rounded" />
          ))}
        </div>
      </div>
      <Skeleton className="h-3 w-8" />
    </div>
  );
}

function DesktopSectionItemSkeleton({ active }: { active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${active ? "bg-zinc-900/80 border-zinc-800" : "border-transparent"}`}
    >
      <Skeleton className="w-4 h-4 rounded" />
      <Skeleton className="h-3.5 w-16 flex-1" />
      <Skeleton className="h-3 w-10" />
    </div>
  );
}

function DesktopMatchCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      {/* Date row */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-3 w-5" />
        <span className="text-zinc-800">·</span>
        <Skeleton className="h-3 w-14" />
        <span className="text-zinc-800">·</span>
        <Skeleton className="h-3 w-10" />
      </div>
      {/* Teams + scores */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Skeleton className="w-8 h-8 rounded shrink-0" />
          <div className="min-w-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-1 h-2.5 w-10" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Skeleton className="w-[52px] h-[52px] rounded-lg" />
          <span className="text-zinc-700 text-[14px]">:</span>
          <Skeleton className="w-[52px] h-[52px] rounded-lg" />
        </div>
        <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-row-reverse text-right justify-end">
          <Skeleton className="w-8 h-8 rounded shrink-0" />
          <div className="min-w-0">
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="mt-1 h-2.5 w-12 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PredictionsSkeleton() {
  return (
    <>
      {/* ─── Mobile ─── */}
      <div className="contents lg:hidden">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="px-5 pt-2 pb-3 border-b border-zinc-800/80 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-3 w-40" />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <Skeleton className="w-3 h-3 rounded" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            {/* Section tabs */}
            <div className="grid grid-cols-3 gap-1.5">
              <MobileSectionPillSkeleton />
              <MobileSectionPillSkeleton />
              <MobileSectionPillSkeleton />
            </div>
          </div>

          {/* Group tabs */}
          <div className="border-b border-zinc-800/80 shrink-0">
            <div className="flex overflow-x-auto scrollbar-none px-3 gap-1">
              {["A", "B", "C", "D", "E", "F"].map((g, i) => (
                <div
                  key={g}
                  className={`relative shrink-0 px-3.5 py-3 text-[13px] font-medium ${i === 0 ? "text-zinc-50" : "text-zinc-500"}`}
                >
                  Grupo {g}
                  {i === 0 && (
                    <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-zinc-50" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Match list */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 min-h-0">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <MatchCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Bottom standings */}
          <div className="shrink-0 pt-3">
            <div className="border-t border-zinc-800/80 bg-zinc-900/70 px-4 py-2">
              <StandingsStripSkeleton />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Desktop ─── */}
      <div className="hidden lg:contents">
        <div className="flex flex-col flex-1 min-h-0 min-h-0">
          <div className="flex flex-1 min-h-0">
            {/* LEFT sidebar */}
            <aside className="w-55 xl:w-65 border-r border-zinc-800/80 bg-zinc-950 shrink-0 flex flex-col">
              <div className="p-5 border-b border-zinc-800/80">
                <Skeleton className="h-3 w-40" />
              </div>

              {/* Section nav */}
              <div className="p-3 border-b border-zinc-800/80 flex flex-col gap-1">
                <DesktopSectionItemSkeleton active />
                <DesktopSectionItemSkeleton />
                <DesktopSectionItemSkeleton />
              </div>

              {/* Group list */}
              <div className="p-3 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between px-3 mb-2">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-3 w-10" />
                </div>
                {["A", "B", "C", "D", "E", "F", "G", "H"].map((g, i) => (
                  <DesktopGroupItemSkeleton key={g} active={i === 0} />
                ))}
              </div>
            </aside>

            {/* CENTER */}
            <main className="flex-1 overflow-y-auto">
              <div className="px-6 xl:px-10 py-7 max-w-230">
                {/* Group header */}
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-baseline gap-3">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                    <Skeleton className="w-3 h-3 rounded" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>

                {/* Teams strip */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 mt-4 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5 flex items-center gap-2.5"
                    >
                      <Skeleton className="w-8 h-8 rounded" />
                      <div>
                        <Skeleton className="h-3.5 w-16" />
                        <Skeleton className="mt-1 h-2.5 w-8" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Matchdays */}
                {[1, 2, 3].map((md) => (
                  <div key={md} className="mb-7">
                    <div className="flex items-baseline gap-2 mb-2.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                    <div className="grid grid-cols-1 3xl:grid-cols-2 gap-3">
                      <DesktopMatchCardSkeleton />
                      <DesktopMatchCardSkeleton />
                    </div>
                  </div>
                ))}
              </div>
            </main>

            {/* RIGHT sidebar */}
            <aside className="w-60 xl:w-70 border-l border-zinc-800/80 bg-zinc-950 shrink-0 p-4 xl:p-5">
              {/* Standings card skeleton */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 mb-4">
                <Skeleton className="h-4 w-20 mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-3.5 flex-1" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Progress card skeleton */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-5 w-10 mb-2" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
