"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronRight, ChevronDown, ArrowUp, ArrowDown, Minus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerEntry } from "./page";

type Category = "TOTAL" | "GROUP_MATCHES" | "GROUP_QUALIFIERS" | "KNOCKOUT" | "EXTRAS" | "FIRST_SCORER_ESP";

const SCORE_CATS: { key: Category; label: string; short: string; abbr: string; color: string; max: number }[] = [
  { key: "GROUP_MATCHES",    label: "Partidos de grupo", short: "Grupos",  abbr: "GR", color: "#1B9E5B", max: 216 },
  { key: "GROUP_QUALIFIERS", label: "Clasificados",      short: "Clasif.", abbr: "CL", color: "#3B82F6", max: 72  },
  { key: "KNOCKOUT",         label: "Eliminatorias",     short: "Elim.",   abbr: "EL", color: "#A855F7", max: 108 },
  { key: "EXTRAS",           label: "Premios",           short: "Premios", abbr: "PR", color: "#F59E0B", max: 120 },
  { key: "FIRST_SCORER_ESP", label: "Goleador España",   short: "Gol ES",  abbr: "ES", color: "#EF4444", max: 70  },
];

const GOLD = "#D4AF37";

function hexAlpha(hex: string, a: number) {
  return hex + Math.round(a * 255).toString(16).padStart(2, "0");
}

type Props = {
  poolId: string;
  poolName: string;
  players: PlayerEntry[];
  playerCount: number;
  isLive: boolean;
};

export function LeaderboardClient({ poolId, poolName, players, playerCount, isLive }: Props) {
  const [metric, setMetric] = useState<Category>("TOTAL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const list = [...players];
    if (metric === "TOTAL") {
      list.sort((a, b) => b.scores.TOTAL - a.scores.TOTAL || b.exactHits - a.exactHits);
    } else {
      list.sort((a, b) => b.scores[metric] - a.scores[metric] || b.scores.TOTAL - a.scores.TOTAL);
    }
    return list;
  }, [players, metric]);

  const toggleExpand = useCallback((userId: string) => {
    setExpandedId((prev) => (prev === userId ? null : userId));
  }, []);

  const sharedProps = { poolId, metric, setMetric, sorted, expandedId, toggleExpand, poolName, playerCount, isLive };

  return (
    <>
      <div className="contents lg:hidden">
        <MobileLayout {...sharedProps} />
      </div>
      <div className="hidden lg:contents">
        <DesktopLayout {...sharedProps} />
      </div>
    </>
  );
}

type LayoutProps = {
  poolId: string;
  metric: Category;
  setMetric: (m: Category) => void;
  sorted: PlayerEntry[];
  expandedId: string | null;
  toggleExpand: (userId: string) => void;
  poolName: string;
  playerCount: number;
  isLive: boolean;
};

// ─── Primitives ──────────────────────────────────────────────

function CategoryFilter({ active, onChange }: { active: Category; onChange: (m: Category) => void }) {
  const items: { key: Category; short: string; color: string }[] = [
    { key: "TOTAL", short: "Total", color: "#fafafa" },
    ...SCORE_CATS.map((c) => ({ key: c.key, short: c.short, color: c.color })),
  ];
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
      {items.map((it) => {
        const a = it.key === active;
        const isTotal = it.key === "TOTAL";
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className="shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5"
            style={a
              ? isTotal
                ? { background: "rgb(244 244 245)", color: "rgb(9 9 11)", borderColor: "rgb(244 244 245)" }
                : { background: hexAlpha(it.color, 0.14), color: it.color, borderColor: it.color }
              : { background: "rgb(24 24 27 / 0.6)", color: "rgb(161 161 170)", borderColor: "rgb(39 39 42)" }
            }
          >
            {a && !isTotal && <span className="w-1.5 h-1.5 rounded-full" style={{ background: it.color }} />}
            <span>{it.short}</span>
          </button>
        );
      })}
    </div>
  );
}

function Avatar({ initials, isMe, size = 32 }: { initials: string; isMe?: boolean; size?: number }) {
  return (
    <div
      className={cn("rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border", isMe ? "border-[#1B9E5B]" : "border-zinc-700")}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      <span className="font-semibold text-zinc-200">{initials}</span>
    </div>
  );
}

function MoveBadge({ move }: { move: number }) {
  if (move === 0) return <Minus className="w-2.5 h-2.5 text-zinc-700" />;
  const up = move > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[10px] tabular-nums", up ? "text-emerald-400" : "text-rose-400")}>
      {up ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
      {Math.abs(move)}
    </span>
  );
}

function PointsMono({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  return (
    <span
      className={cn("font-bold tabular-nums text-zinc-50", className)}
      style={{ fontFamily: "var(--font-mono), ui-monospace, monospace", fontSize: size }}
    >
      {value}
    </span>
  );
}

function StackedBar({ player, height = 6 }: { player: PlayerEntry; height?: number }) {
  const total = player.scores.TOTAL || 1;
  return (
    <div className="flex w-full overflow-hidden rounded-full" style={{ height, background: "rgb(39 39 42 / 0.6)" }}>
      {SCORE_CATS.map((c) => {
        const v = player.scores[c.key];
        if (v === 0) return null;
        return <div key={c.key} style={{ width: `${(v / total) * 100}%`, background: c.color, opacity: 0.85 }} />;
      })}
    </div>
  );
}

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
      <span>En directo</span>
    </div>
  );
}

function CategoryDots() {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
      {SCORE_CATS.map((c) => (
        <span key={c.key} className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
          {c.abbr}
        </span>
      ))}
    </div>
  );
}

// ─── Breakdown (expand) ──────────────────────────────────────

function MobileBreakdown({ player, poolId }: { player: PlayerEntry; poolId: string }) {
  return (
    <div className="px-3 pb-3 -mt-1">
      <div className="rounded-lg border border-zinc-800/60 p-3" style={{ background: "rgb(9 9 11 / 0.6)" }}>
        <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 mb-2.5">Desglose</div>
        <div className="space-y-2">
          {SCORE_CATS.map((c) => {
            const v = player.scores[c.key];
            const pct = Math.min(100, (v / c.max) * 100);
            return (
              <div key={c.key} className="flex items-center gap-2.5">
                <div className="w-[88px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-[11px] text-zinc-300 truncate">{c.short}</span>
                </div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(39 39 42 / 0.6)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color, opacity: 0.85 }} />
                </div>
                <div className="w-14 text-right">
                  <span className="text-[11px] font-semibold tabular-nums" style={{ color: c.color, fontFamily: "var(--font-mono), ui-monospace, monospace" }}>{v}</span>
                  <span className="text-[9.5px] text-zinc-600 tabular-nums">/{c.max}</span>
                </div>
              </div>
            );
          })}
        </div>
        <a
          href={player.isCurrentUser ? `/pools/${poolId}/predictions` : `/pools/${poolId}/predictions?player=${player.userId}`}
          className="mt-3 block w-full h-8 rounded-lg text-[11.5px] font-medium text-zinc-300 border border-zinc-800 hover:bg-zinc-800/60 transition-colors flex items-center justify-center"
        >
          Ver porra de {player.displayName.split(" ")[0]} →
        </a>
      </div>
    </div>
  );
}

function DesktopBreakdown({ player, poolId }: { player: PlayerEntry; poolId: string }) {
  return (
    <div className="px-4 py-4 border-t border-zinc-800/60" style={{ background: "rgb(9 9 11 / 0.4)" }}>
      <div className="flex gap-8">
        {/* Left — category bars */}
        <div className="flex-1">
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-3">
            Desglose · cómo se construyen los {player.scores.TOTAL} pts
          </div>
          <div className="space-y-2.5">
            {SCORE_CATS.map((c) => {
              const v = player.scores[c.key];
              const pct = Math.min(100, (v / c.max) * 100);
              return (
                <div key={c.key} className="flex items-center gap-3">
                  <div className="w-[130px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-[12px] text-zinc-300">{c.label}</span>
                  </div>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(39 39 42 / 0.6)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color, opacity: 0.85 }} />
                  </div>
                  <div className="w-16 text-right tabular-nums">
                    <span className="text-[13px] font-semibold" style={{ color: c.color, fontFamily: "var(--font-mono), ui-monospace, monospace" }}>{v}</span>
                    <span className="text-[10px] text-zinc-600"> / {c.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — stats */}
        <div className="w-[200px] shrink-0">
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-3">Stats</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Exactos</div>
              <PointsMono value={player.exactHits} size={22} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Hoy</div>
              <span className="text-[20px] font-bold tabular-nums text-zinc-500" style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}>0</span>
            </div>
          </div>
          <a
            href={player.isCurrentUser ? `/pools/${poolId}/predictions` : `/pools/${poolId}/predictions?player=${player.userId}`}
            className="block w-full h-9 rounded-lg text-[12.5px] font-medium text-zinc-200 border border-zinc-800 hover:bg-zinc-900 transition-colors flex items-center justify-center"
          >
            Ver pronósticos de {player.displayName.split(" ")[0]} →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Layout ───────────────────────────────────────────

function MobileLayout({ poolId, metric, setMetric, sorted, expandedId, toggleExpand, playerCount, isLive }: LayoutProps) {
  const podium = sorted.slice(0, 3);
  const showPodium = metric === "TOTAL" && podium.length >= 3;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-2 pb-3 border-b border-zinc-800/80 shrink-0">
        <div className="flex items-baseline justify-between mb-2.5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">Clasificación</div>
            <h1 className="text-[20px] font-semibold text-zinc-50 leading-tight mt-0.5">{playerCount} jugadores</h1>
          </div>
          {isLive && <LiveBadge />}
        </div>
        <CategoryFilter active={metric} onChange={setMetric} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24">
        {showPodium && <MobilePodium podium={podium} />}

        <div className="flex items-baseline justify-between mb-2 px-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium">
            Toca una fila para ver el desglose
          </div>
          <CategoryDots />
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
          {sorted.map((p, i) => {
            const isOpen = expandedId === p.userId;
            const value = metric === "TOTAL" ? p.scores.TOTAL : p.scores[metric];
            return (
              <div
                key={p.userId}
                className={i > 0 ? "border-t border-zinc-800/60" : ""}
                style={p.isCurrentUser ? { background: "rgba(27,158,91,0.06)", boxShadow: "inset 2px 0 0 var(--color-primary)" } : {}}
              >
                <button onClick={() => toggleExpand(p.userId)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                  <div className="w-5 text-right shrink-0">
                    <span className="text-[12px] font-semibold tabular-nums" style={i < 3 ? { color: GOLD } : { color: "rgb(161 161 170)" }}>{i + 1}</span>
                  </div>
                  <div className="w-3.5 shrink-0"><MoveBadge move={0} /></div>
                  <Avatar initials={p.initials} isMe={p.isCurrentUser} size={30} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-zinc-100 font-medium truncate">
                      {p.displayName}
                      {p.isCurrentUser && <span className="text-[10px] ml-1.5 font-normal" style={{ color: "var(--color-primary)" }}>· tú</span>}
                    </div>
                    <div className="text-[10.5px] text-zinc-500 tabular-nums">{p.exactHits} exactos · {p.signHits} signos</div>
                  </div>
                  <div className="text-right shrink-0">
                    <PointsMono value={value} size={16} />
                    <div className="text-[10px] tabular-nums text-zinc-600">0 hoy</div>
                  </div>
                  <ChevronRight className={cn("w-3.5 h-3.5 text-zinc-600 transition-transform shrink-0", isOpen && "rotate-90")} />
                </button>
                {isOpen && <MobileBreakdown player={p} poolId={poolId} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobilePodium({ podium }: { podium: PlayerEntry[] }) {
  const [second, first, third] = [podium[1], podium[0], podium[2]];
  return (
    <div className="flex items-end justify-center gap-3 pt-4 pb-6">
      <PodiumSlot player={second} rank={2} height="h-14" avatarSize={56} />
      <PodiumSlot player={first} rank={1} height="h-20" avatarSize={64} showStar />
      <PodiumSlot player={third} rank={3} height="h-10" avatarSize={56} />
    </div>
  );
}

function PodiumSlot({ player, rank, height, avatarSize, showStar }: {
  player: PlayerEntry; rank: number; height: string; avatarSize: number; showStar?: boolean;
}) {
  const borderColor = rank === 1 ? "border-amber-500/40" : "border-zinc-700/50";
  return (
    <div className="flex flex-col items-center w-[90px]">
      {showStar && <Star className="w-4 h-4 text-amber-500 fill-amber-500 mb-1" />}
      <Avatar initials={player.initials} isMe={player.isCurrentUser} size={avatarSize} />
      <div className="text-[12px] text-zinc-300 font-medium mt-1.5 truncate max-w-full text-center">{player.displayName}</div>
      <div className="text-[11px] text-zinc-500 tabular-nums">{player.scores.TOTAL} pts</div>
      <div className={cn("w-full mt-2 rounded-t-lg border border-b-0 flex items-center justify-center", height, borderColor)} style={{ background: "rgb(39 39 42 / 0.4)" }}>
        {rank === 1
          ? <span className="text-[20px] font-bold" style={{ color: GOLD }}>{rank}</span>
          : <span className="text-[20px] font-bold text-zinc-500">{rank}</span>
        }
      </div>
    </div>
  );
}

// ─── Desktop Layout ──────────────────────────────────────────

function DesktopLayout({ poolId, metric, setMetric, sorted, expandedId, toggleExpand, poolName, playerCount, isLive }: LayoutProps) {
  const podium = sorted.slice(0, 3);
  const showPodium = metric === "TOTAL" && podium.length >= 3;

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-[1200px] mx-auto px-10 py-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-1">Clasificación</div>
            <h1 className="text-[28px] font-bold text-zinc-50 leading-tight">{poolName} · Mundial 2026</h1>
            <div className="text-[13px] text-zinc-500 mt-1">
              {playerCount} jugadores · Toca una fila para ver el desglose
            </div>
          </div>
          {isLive && <LiveBadge />}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <CategoryFilter active={metric} onChange={setMetric} />
        </div>

        {/* Podium cards */}
        {showPodium && <DesktopPodium podium={podium} />}

        {/* Table */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center px-4 py-2.5 border-b border-zinc-800/80 text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
            <div className="w-[52px] flex items-center gap-1.5">Pos. <span className="text-zinc-700">↕</span></div>
            <div className="flex-1">Jugador</div>
            {SCORE_CATS.map((c) => (
              <div key={c.key} className="w-[80px] text-right flex items-center justify-end gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                {c.short}
              </div>
            ))}
            <div className="w-[72px] text-right font-semibold text-zinc-300">Total ↓</div>
            <div className="w-[28px]" />
          </div>

          {/* Data rows */}
          {sorted.map((p, i) => {
            const isOpen = expandedId === p.userId;
            return (
              <div
                key={p.userId}
                className={i > 0 ? "border-t border-zinc-800/60" : ""}
                style={p.isCurrentUser ? { background: "rgba(27,158,91,0.06)", boxShadow: "inset 2px 0 0 var(--color-primary)" } : {}}
              >
                <button
                  onClick={() => toggleExpand(p.userId)}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-zinc-800/20 transition-colors"
                >
                  {/* Position + movement */}
                  <div className="w-[52px] flex items-center gap-2">
                    {i < 3 && (
                      <span className={cn("w-1 h-5 rounded-full", i === 0 ? "bg-amber-500" : i === 1 ? "bg-zinc-400" : "bg-amber-700")} />
                    )}
                    <span className="text-[14px] font-semibold tabular-nums" style={i < 3 ? { color: GOLD } : { color: "rgb(161 161 170)" }}>{i + 1}</span>
                    <MoveBadge move={0} />
                  </div>

                  {/* Player */}
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <Avatar initials={p.initials} isMe={p.isCurrentUser} size={32} />
                    <div className="min-w-0">
                      <div className="text-[13.5px] text-zinc-100 font-medium truncate leading-tight">
                        {p.displayName}
                        {p.isCurrentUser && <span className="text-[10.5px] ml-1.5 font-normal" style={{ color: "var(--color-primary)" }}>· tú</span>}
                      </div>
                      <div className="text-[10.5px] text-zinc-500 tabular-nums">{p.exactHits} exactos · {p.signHits} signos</div>
                    </div>
                  </div>

                  {/* Category scores */}
                  {SCORE_CATS.map((c) => (
                    <div key={c.key} className="w-[80px] text-right tabular-nums">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: metric === c.key ? c.color : "rgb(228 228 231)", fontFamily: "var(--font-mono), ui-monospace, monospace" }}
                      >
                        {p.scores[c.key]}
                      </span>
                      <span className="text-[10px] text-zinc-600">/{c.max}</span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="w-[72px] text-right">
                    <PointsMono value={p.scores.TOTAL} size={17} />
                  </div>

                  {/* Chevron */}
                  <div className="w-[28px] flex justify-end text-zinc-600">
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && <DesktopBreakdown player={p} poolId={poolId} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DesktopPodium({ podium }: { podium: PlayerEntry[] }) {
  const config: { player: PlayerEntry; label: string; rank: number; borderColor: string }[] = [
    { player: podium[0], label: "LÍDER",  rank: 1, borderColor: "border-amber-500/50" },
    { player: podium[1], label: "2º",     rank: 2, borderColor: "border-zinc-700" },
    { player: podium[2], label: "3º",     rank: 3, borderColor: "border-zinc-700" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {config.map(({ player, label, rank, borderColor }) => (
        <div key={player.userId} className={cn("rounded-xl border bg-zinc-900/40 p-4", borderColor)}>
          <div className="flex items-center gap-3 mb-3">
            <Avatar initials={player.initials} isMe={player.isCurrentUser} size={48} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {rank === 1 && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                <span className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: rank === 1 ? GOLD : "rgb(161 161 170)" }}>
                  {label}
                </span>
              </div>
              <div className="text-[15px] font-semibold text-zinc-100 truncate">{player.displayName}</div>
              <div className="text-[10.5px] text-zinc-500 tabular-nums">{player.exactHits} exactos · {player.signHits} signos</div>
            </div>
            <div className="text-right shrink-0">
              <PointsMono value={player.scores.TOTAL} size={28} />
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">PTS</div>
            </div>
          </div>
          <StackedBar player={player} height={6} />
        </div>
      ))}
    </div>
  );
}
