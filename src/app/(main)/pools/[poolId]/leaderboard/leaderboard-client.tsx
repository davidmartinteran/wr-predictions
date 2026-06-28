"use client";

import { useState, useMemo, useCallback, useEffect, createContext, useContext, Fragment } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, ArrowUp, ArrowDown, Minus, Star, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerEntry, GroupHits } from "./page";

type Category = "TOTAL" | "RESULTS" | "CLASSIFICATIONS" | "EXTRAS";

type BreakdownCategory = Exclude<Category, "TOTAL">;
type ScoreCat = { key: BreakdownCategory; label: string; short: string; abbr: string; color: string; max: number; detail: string[] };

const SCORE_CATS: ScoreCat[] = [
  { key: "RESULTS", label: "Resultados", short: "Result.", abbr: "RE", color: "#1B9E5B", max: 225, detail: [
    "Signo correcto (1X2) → 1 pt",
    "Marcador exacto → 3 pts",
    "Partidos de España → ×2",
    "72 partidos de grupo",
  ]},
  { key: "CLASSIFICATIONS", label: "Clasificación", short: "Clasif.", abbr: "CL", color: "#A855F7", max: 242, detail: [
    "Predice hasta dónde llega cada equipo",
    "Grupos 2 · R32 3 · R16 5 · Cuartos 8",
    "Semis 12 · Subcampeón 18 · Campeón 25",
    "±1 ronda → 50% · ±2 → 25% · ±3+ → 0",
    "España → ×2",
  ]},
  { key: "EXTRAS", label: "Extras", short: "Extras", abbr: "EX", color: "#F59E0B", max: 101, detail: [
    "Bota de Oro 15 · Máx. asistente 15",
    "Mejor jugador 10 · Mejor joven 10",
    "Mejor portero 10",
    "Equipo +goles 10 · Equipo +goleado 10",
    "Podio: 1º exacto 12 · 2º 6 · 3º 3",
  ]},
];

// Categorías visibles según la config de la porra (p.ej. una porra de solo
// bracket oculta Resultados y Extras). Se proveen por contexto para no enhebrar
// el array por todos los subcomponentes.
const CatsContext = createContext<ScoreCat[]>(SCORE_CATS);
const useCats = () => useContext(CatsContext);

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
  canViewOthers: boolean;
  deadline: string;
  showResults?: boolean;
  showExtras?: boolean;
  showBrackets?: boolean;
  bracketBreakdown?: boolean;
};

function formatDeadline(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function LeaderboardClient({ poolId, poolName, players, playerCount, isLive, canViewOthers, deadline, showResults = true, showExtras = true, showBrackets = false, bracketBreakdown = false }: Props) {
  const visibleCats = useMemo(
    () =>
      SCORE_CATS.filter(
        (c) =>
          (c.key !== "RESULTS" || showResults) &&
          (c.key !== "EXTRAS" || showExtras),
      ),
    [showResults, showExtras],
  );
  const [metric, setMetric] = useState<Category>("TOTAL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  // Con el torneo en marcha, los scores los recalcula la Edge Function
  // poll-results al terminar cada partido — refrescamos cada 2 min.
  useEffect(() => {
    if (!deadline || new Date(deadline).getTime() > Date.now()) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 120_000);
    return () => clearInterval(interval);
  }, [deadline, router]);

  const deadlineLabel = useMemo(() => formatDeadline(deadline), [deadline]);

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

  const sharedProps = { poolId, metric, setMetric, sorted, expandedId, toggleExpand, poolName, playerCount, isLive, canViewOthers, deadlineLabel, showBrackets, bracketBreakdown };

  return (
    <CatsContext.Provider value={visibleCats}>
      <div className="contents lg:hidden">
        <MobileLayout {...sharedProps} />
      </div>
      <div className="hidden lg:contents">
        <DesktopLayout {...sharedProps} />
      </div>
    </CatsContext.Provider>
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
  canViewOthers: boolean;
  deadlineLabel: string;
  showBrackets: boolean;
  bracketBreakdown: boolean;
};

// ─── Primitives ──────────────────────────────────────────────

function CategoryFilter({ active, onChange }: { active: Category; onChange: (m: Category) => void }) {
  const cats = useCats();
  const items: { key: Category; short: string; color: string }[] = [
    { key: "TOTAL", short: "Total", color: "#fafafa" },
    ...cats.map((c) => ({ key: c.key, short: c.short, color: c.color })),
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
  const cats = useCats();
  const total = player.scores.TOTAL || 1;
  return (
    <div className="flex w-full overflow-hidden rounded-full" style={{ height, background: "rgb(39 39 42 / 0.6)" }}>
      {cats.map((c) => {
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
  const cats = useCats();
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
      {cats.map((c) => (
        <span key={c.key} className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
          {c.abbr}
        </span>
      ))}
    </div>
  );
}

// ─── Expandable category bar ────────────────────────────────

function CategoryBar({ cat, value, expanded, onToggle, compact }: { cat: ScoreCat; value: number; expanded: boolean; onToggle: () => void; compact?: boolean }) {
  const pct = Math.min(100, (value / cat.max) * 100);
  const labelW = compact ? "w-[88px]" : "w-[130px]";
  const scoreW = compact ? "w-14" : "w-16";
  const labelSize = compact ? "text-[11px]" : "text-[12px]";
  const scoreSize = compact ? "text-[11px]" : "text-[13px]";
  const subSize = compact ? "text-[9.5px]" : "text-[10px]";
  const gap = compact ? "gap-2.5" : "gap-3";
  const barH = compact ? "h-1.5" : "h-1.5";

  return (
    <div>
      <button onClick={onToggle} className={cn("w-full flex items-center", gap, "group")}>
        <div className={cn(labelW, "flex items-center gap-1.5")}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
          <span className={cn(labelSize, "text-zinc-300 truncate")}>{compact ? cat.short : cat.label}</span>
          <HelpCircle className="w-2.5 h-2.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
        </div>
        <div className={cn("flex-1 rounded-full overflow-hidden", barH)} style={{ background: "rgb(39 39 42 / 0.6)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cat.color, opacity: 0.85 }} />
        </div>
        <div className={cn(scoreW, "text-right")}>
          <span className={cn(scoreSize, "font-semibold tabular-nums")} style={{ color: cat.color, fontFamily: "var(--font-mono), ui-monospace, monospace" }}>{value}</span>
          <span className={cn(subSize, "text-zinc-600 tabular-nums")}>/{cat.max}</span>
        </div>
      </button>
      {expanded && (
        <div className={cn("mt-1 mb-1 space-y-0.5", compact ? "pl-[24px]" : "pl-[28px]")}>
          {cat.detail.map((l) => (
            <div key={l} className="text-[10px] text-zinc-500 leading-relaxed">{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// Botón al desglose por equipos (bracket), bajo la barra de Clasificación.
function BracketBreakdownLink({ href, compact }: { href: string; compact?: boolean }) {
  return (
    <a
      href={href}
      className={cn(
        "block w-full rounded-lg font-medium border border-zinc-800 hover:bg-zinc-800/60 transition-colors flex items-center justify-center",
        compact ? "mt-1 h-8 text-[11.5px] text-zinc-300" : "mt-1.5 h-9 text-[12.5px] text-zinc-200",
      )}
    >
      Ver desglose por equipos →
    </a>
  );
}

// Rejilla compacta de aciertos por grupo (exactos · signos) para la porra total.
function GroupHitsStrip({ hits, compact }: { hits: GroupHits[]; compact?: boolean }) {
  if (!hits.length) return null;
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Aciertos por grupo</span>
        <span className="flex items-center gap-2 text-[9px] text-zinc-500">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: "#1B9E5B" }} />exactos</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />signos</span>
        </span>
      </div>
      <div className={cn("grid gap-1", compact ? "grid-cols-4" : "grid-cols-6")}>
        {hits.map((g) => (
          <div key={g.group} className="flex items-center justify-between rounded-md border border-zinc-800/60 bg-zinc-900/40 px-1.5 py-1">
            <span className="text-[10px] font-semibold text-zinc-500">{g.group}</span>
            <span className="flex items-center gap-0.5 text-[10.5px] tabular-nums">
              <span className="font-semibold" style={{ color: "#1B9E5B" }}>{g.exactos}</span>
              <span className="text-zinc-700">·</span>
              <span className="font-medium text-zinc-300">{g.signos}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Breakdown (expand) ──────────────────────────────────────

function MobileBreakdown({ player, poolId, canViewOthers, deadlineLabel, showBrackets, bracketBreakdown }: { player: PlayerEntry; poolId: string; canViewOthers: boolean; deadlineLabel: string; showBrackets: boolean; bracketBreakdown: boolean }) {
  const cats = useCats();
  const canView = player.isCurrentUser || canViewOthers;
  const [expandedCat, setExpandedCat] = useState<Category | null>(null);
  const href = showBrackets
    ? `/pools/${poolId}/brackets?player=${player.userId}`
    : player.isCurrentUser
      ? `/pools/${poolId}/predictions`
      : `/pools/${poolId}/predictions?player=${player.userId}`;
  const cta = showBrackets ? "Ver bracket de" : "Ver porra de";
  const bracketHref = bracketBreakdown && canView
    ? `/pools/${poolId}/brackets?player=${player.userId}`
    : undefined;
  return (
    <div className="px-3 pb-3 -mt-1">
      <div className="rounded-lg border border-zinc-800/60 p-3" style={{ background: "rgb(9 9 11 / 0.6)" }}>
        <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 mb-2.5">Desglose</div>
        <div className="space-y-2">
          {cats.map((c) => (
            <Fragment key={c.key}>
              <CategoryBar
                cat={c}
                value={player.scores[c.key]}
                expanded={expandedCat === c.key}
                onToggle={() => setExpandedCat(expandedCat === c.key ? null : c.key)}
                compact
              />
              {c.key === "RESULTS" && canView && (
                <GroupHitsStrip hits={player.groupHits} compact />
              )}
              {c.key === "CLASSIFICATIONS" && bracketHref && (
                <BracketBreakdownLink href={bracketHref} compact />
              )}
            </Fragment>
          ))}
        </div>
        {canView ? (
          <a
            href={href}
            className="mt-3 block w-full h-8 rounded-lg text-[11.5px] font-medium text-zinc-300 border border-zinc-800 hover:bg-zinc-800/60 transition-colors flex items-center justify-center"
          >
            {cta} {player.displayName.split(" ")[0]} →
          </a>
        ) : !player.isCurrentUser && (
          <div className="mt-3 w-full h-8 rounded-lg text-[11px] text-zinc-600 border border-zinc-800/40 flex items-center justify-center">
            Visible a partir del {deadlineLabel}
          </div>
        )}
      </div>
    </div>
  );
}

function DesktopBreakdown({ player, poolId, canViewOthers, deadlineLabel, showBrackets, bracketBreakdown }: { player: PlayerEntry; poolId: string; canViewOthers: boolean; deadlineLabel: string; showBrackets: boolean; bracketBreakdown: boolean }) {
  const cats = useCats();
  const canView = player.isCurrentUser || canViewOthers;
  const [expandedCat, setExpandedCat] = useState<Category | null>(null);
  const href = showBrackets
    ? `/pools/${poolId}/brackets?player=${player.userId}`
    : player.isCurrentUser
      ? `/pools/${poolId}/predictions`
      : `/pools/${poolId}/predictions?player=${player.userId}`;
  const bracketHref = bracketBreakdown && canView
    ? `/pools/${poolId}/brackets?player=${player.userId}`
    : undefined;
  return (
    <div className="px-4 py-4 border-t border-zinc-800/60" style={{ background: "rgb(9 9 11 / 0.4)" }}>
      <div className="flex gap-8">
        {/* Left — category bars */}
        <div className="flex-1">
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-3">
            Desglose · cómo se construyen los {player.scores.TOTAL} pts
          </div>
          <div className="space-y-2.5">
            {cats.map((c) => (
              <Fragment key={c.key}>
                <CategoryBar
                  cat={c}
                  value={player.scores[c.key]}
                  expanded={expandedCat === c.key}
                  onToggle={() => setExpandedCat(expandedCat === c.key ? null : c.key)}
                />
                {c.key === "RESULTS" && canView && (
                  <GroupHitsStrip hits={player.groupHits} />
                )}
                {c.key === "CLASSIFICATIONS" && bracketHref && (
                  <BracketBreakdownLink href={bracketHref} />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Right — stats */}
        <div className="w-[200px] shrink-0">
          {(player.exactHits > 0 || player.signHits > 0) && (
            <>
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-3">Stats</div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Exactos</div>
                  <PointsMono value={player.exactHits} size={22} />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Signos</div>
                  <PointsMono value={player.signHits} size={22} />
                </div>
              </div>
            </>
          )}
          {canView ? (
            <a
              href={href}
              className="block w-full h-9 rounded-lg text-[12.5px] font-medium text-zinc-200 border border-zinc-800 hover:bg-zinc-900 transition-colors flex items-center justify-center"
            >
              {showBrackets ? "Ver bracket de" : "Ver pronósticos de"} {player.displayName.split(" ")[0]} →
            </a>
          ) : !player.isCurrentUser && (
            <div className="w-full h-9 rounded-lg text-[12px] text-zinc-600 border border-zinc-800/40 flex items-center justify-center">
              Visible a partir del {deadlineLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Layout ───────────────────────────────────────────

function MobileLayout({ poolId, metric, setMetric, sorted, expandedId, toggleExpand, playerCount, isLive, canViewOthers, deadlineLabel, showBrackets, bracketBreakdown }: LayoutProps) {
  const podium = sorted.slice(0, 3);
  const showPodium = metric === "TOTAL" && podium.length >= 3;

  return (
    <div className="flex flex-col flex-1 min-h-0">
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
                    {(p.exactHits > 0 || p.signHits > 0) && (
                      <div className="text-[10.5px] text-zinc-500 tabular-nums">{p.exactHits} exactos · {p.signHits} signos</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <PointsMono value={value} size={16} />
                    <div className="text-[10px] tabular-nums text-zinc-600">0 hoy</div>
                  </div>
                  <ChevronRight className={cn("w-3.5 h-3.5 text-zinc-600 transition-transform shrink-0", isOpen && "rotate-90")} />
                </button>
                {isOpen && <MobileBreakdown player={p} poolId={poolId} canViewOthers={canViewOthers} deadlineLabel={deadlineLabel} showBrackets={showBrackets} bracketBreakdown={bracketBreakdown} />}
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

function DesktopLayout({ poolId, metric, setMetric, sorted, expandedId, toggleExpand, poolName, playerCount, isLive, canViewOthers, deadlineLabel, showBrackets, bracketBreakdown }: LayoutProps) {
  const cats = useCats();
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
            {cats.map((c) => (
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
                      {(p.exactHits > 0 || p.signHits > 0) && (
                      <div className="text-[10.5px] text-zinc-500 tabular-nums">{p.exactHits} exactos · {p.signHits} signos</div>
                    )}
                    </div>
                  </div>

                  {/* Category scores */}
                  {cats.map((c) => (
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

                {isOpen && <DesktopBreakdown player={p} poolId={poolId} canViewOthers={canViewOthers} deadlineLabel={deadlineLabel} showBrackets={showBrackets} bracketBreakdown={bracketBreakdown} />}
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
              {(player.exactHits > 0 || player.signHits > 0) && (
                <div className="text-[10.5px] text-zinc-500 tabular-nums">{player.exactHits} exactos · {player.signHits} signos</div>
              )}
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
