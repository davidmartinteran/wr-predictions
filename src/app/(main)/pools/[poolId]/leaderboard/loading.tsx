import { Skeleton } from "@/components/ui/skeleton";

function CategoryFilterSkeleton() {
  return (
    <div className="flex gap-1.5 -mx-1 px-1">
      {[
        { w: "w-14" },
        { w: "w-20" },
        { w: "w-16" },
        { w: "w-16" },
      ].map((s, i) => (
        <Skeleton
          key={i}
          className={`shrink-0 h-[30px] ${s.w} rounded-full`}
        />
      ))}
    </div>
  );
}

function MobilePlayerRowSkeleton({ rank }: { rank: number }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 ${rank > 0 ? "border-t border-zinc-800/60" : ""}`}>
      <div className="w-5 text-right shrink-0">
        <Skeleton className="h-3.5 w-3.5 ml-auto" />
      </div>
      <div className="w-3.5 shrink-0">
        <Skeleton className="h-2.5 w-2.5" />
      </div>
      <Skeleton className="w-[30px] h-[30px] rounded-full shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="mt-1 h-2.5 w-14" />
      </div>
      <div className="text-right shrink-0">
        <Skeleton className="h-4 w-8 ml-auto" />
        <Skeleton className="mt-1 h-2.5 w-10 ml-auto" />
      </div>
      <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
    </div>
  );
}

function MobilePodiumSkeleton() {
  return (
    <div className="flex items-end justify-center gap-3 pt-4 pb-6">
      {/* 2nd place */}
      <div className="flex flex-col items-center w-[90px]">
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="mt-1.5 h-3 w-16" />
        <Skeleton className="mt-1 h-2.5 w-10" />
        <div className="w-full mt-2 h-14 rounded-t-lg border border-b-0 border-zinc-700/50 bg-zinc-800/40 flex items-center justify-center">
          <Skeleton className="h-5 w-4" />
        </div>
      </div>
      {/* 1st place */}
      <div className="flex flex-col items-center w-[90px]">
        <Skeleton className="w-4 h-4 rounded mb-1" />
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="mt-1.5 h-3 w-16" />
        <Skeleton className="mt-1 h-2.5 w-10" />
        <div className="w-full mt-2 h-20 rounded-t-lg border border-b-0 border-amber-500/40 bg-zinc-800/40 flex items-center justify-center">
          <Skeleton className="h-5 w-4" />
        </div>
      </div>
      {/* 3rd place */}
      <div className="flex flex-col items-center w-[90px]">
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="mt-1.5 h-3 w-16" />
        <Skeleton className="mt-1 h-2.5 w-10" />
        <div className="w-full mt-2 h-10 rounded-t-lg border border-b-0 border-zinc-700/50 bg-zinc-800/40 flex items-center justify-center">
          <Skeleton className="h-5 w-4" />
        </div>
      </div>
    </div>
  );
}

function DesktopPodiumSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { border: "border-amber-500/50" },
        { border: "border-zinc-700" },
        { border: "border-zinc-700" },
      ].map((s, i) => (
        <div key={i} className={`rounded-xl border bg-zinc-900/40 p-4 ${s.border}`}>
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-2.5 w-10 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-10" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

function DesktopPlayerRowSkeleton({ rank }: { rank: number }) {
  return (
    <div className={`flex items-center px-4 py-3 ${rank > 0 ? "border-t border-zinc-800/60" : ""}`}>
      {/* Position */}
      <div className="w-[52px] flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-2.5 w-2.5" />
      </div>
      {/* Player */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="min-w-0">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="mt-1 h-2.5 w-14" />
        </div>
      </div>
      {/* Category scores */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-[80px] flex justify-end">
          <Skeleton className="h-3.5 w-12" />
        </div>
      ))}
      {/* Total */}
      <div className="w-[72px] flex justify-end">
        <Skeleton className="h-4 w-10" />
      </div>
      {/* Chevron */}
      <div className="w-[28px] flex justify-end">
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </div>
  );
}

export default function LeaderboardLoading() {
  return (
    <>
      {/* ─── Mobile ─── */}
      <div className="contents lg:hidden">
        <div className="flex flex-col h-full">
          <div className="px-5 pt-2 pb-3 border-b border-zinc-800/80 shrink-0">
            <div className="flex items-baseline justify-between mb-2.5">
              <div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-1.5 h-5 w-32" />
              </div>
            </div>
            <CategoryFilterSkeleton />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24">
            <MobilePodiumSkeleton />

            <div className="flex items-baseline justify-between mb-2 px-1">
              <Skeleton className="h-3 w-44" />
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-2 w-6" />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
              {[0, 1, 2, 3, 4].map((i) => (
                <MobilePlayerRowSkeleton key={i} rank={i} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Desktop ─── */}
      <div className="hidden lg:contents">
        <div className="h-full overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-10 py-7">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-7 w-72" />
                <Skeleton className="mt-2 h-4 w-52" />
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <CategoryFilterSkeleton />
            </div>

            {/* Podium cards */}
            <DesktopPodiumSkeleton />

            {/* Table */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
              {/* Header row */}
              <div className="flex items-center px-4 py-2.5 border-b border-zinc-800/80">
                <div className="w-[52px]">
                  <Skeleton className="h-2.5 w-8" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-2.5 w-14" />
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-[80px] flex justify-end">
                    <Skeleton className="h-2.5 w-12" />
                  </div>
                ))}
                <div className="w-[72px] flex justify-end">
                  <Skeleton className="h-2.5 w-10" />
                </div>
                <div className="w-[28px]" />
              </div>
              {/* Rows */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <DesktopPlayerRowSkeleton key={i} rank={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
