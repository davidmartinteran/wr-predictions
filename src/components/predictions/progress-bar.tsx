import { cn } from "@/lib/utils";

type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const complete = current === total && total > 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[12px] text-zinc-400">
          <span className="text-zinc-100 font-semibold tabular-nums">{current}</span>
          <span className="text-zinc-500">/{total} partidos completados</span>
        </div>
        <div
          className={cn(
            "text-[12px] tabular-nums font-medium",
            complete ? "text-[#D4AF37]" : "text-primary"
          )}
        >
          {pct}%
        </div>
      </div>
      <div className="h-[6px] w-full rounded-full bg-zinc-800/80 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            complete ? "bg-[#D4AF37]" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
