import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/team-flag";

type TeamBadgeProps = {
  name: string;
  code: string;
  flag: string | null;
  side: "home" | "away";
};

export function TeamBadge({ name, code, side }: TeamBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 flex-1 min-w-0",
        side === "away" && "flex-row-reverse text-right justify-end"
      )}
    >
      <TeamFlag code={code} size={28} className="shrink-0" />
      <div className="min-w-0">
        <p className="text-[14px] text-zinc-100 font-medium truncate">{name}</p>
        <p className="text-[10px] text-zinc-500 tracking-wider uppercase">
          {side === "home" ? "Local" : "Visitante"}
        </p>
      </div>
    </div>
  );
}
