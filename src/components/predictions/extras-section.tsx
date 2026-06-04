"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Check, Search, Trophy, Award, Zap, Target, Shield, X, Star, ShieldCheck } from "lucide-react";
import { TeamFlag } from "@/components/team-flag";
import { PLAYERS, type Player } from "@/data/players";

type Team = {
  id: string;
  name: string;
  code: string;
  flag_emoji: string | null;
};

type ExtrasSectionProps = {
  poolId: string;
  extras: Record<string, string>;
  allTeams: Team[];
  disabled: boolean;
  onExtraChange: (kind: string, value: string | null) => void;
  filledCount: number;
};

const EXTRA_CARDS = [
  { kind: "TOP_SCORER", label: "Bota de Oro", points: 15, description: "Máximo goleador del Mundial", type: "player" as const, icon: Trophy },
  { kind: "BEST_PLAYER", label: "Mejor jugador", points: 10, description: "Balón de Oro del torneo", type: "player" as const, icon: Award },
  { kind: "BEST_YOUNG_PLAYER", label: "Mejor jugador joven", points: 10, description: "Mejor jugador sub-21", type: "player" as const, icon: Star },
  { kind: "BEST_GOALKEEPER", label: "Mejor portero", points: 10, description: "Guante de Oro del torneo", type: "player" as const, icon: ShieldCheck },
  { kind: "TOP_ASSISTER", label: "Máximo asistente", points: 15, description: "Más pases de gol del Mundial", type: "player" as const, icon: Zap },
  { kind: "MOST_GOALS_TEAM", label: "Equipo más goleador", points: 10, description: "Selección con más goles a favor", type: "team" as const, icon: Target },
  { kind: "MOST_CONCEDED_TEAM", label: "Equipo más goleado", points: 10, description: "Selección con más goles en contra", type: "team" as const, icon: Shield },
] as const;

export const EXTRAS_TOTAL = 7;

export function ExtrasSection({ poolId, extras, allTeams, disabled, onExtraChange, filledCount }: ExtrasSectionProps) {
  const isComplete = filledCount === EXTRAS_TOTAL;

  return (
    <div className="px-4 lg:px-6 xl:px-10 pt-3 lg:py-7 pb-52 lg:pb-10 lg:max-w-230">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[17px] lg:text-[32px] font-bold text-zinc-50 leading-none">
          Predicciones extra
        </h1>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium tabular-nums"
          style={{
            background: isComplete ? "rgba(27, 158, 91, 0.12)" : "rgb(24 24 27 / 0.6)",
            borderColor: isComplete ? "#1B9E5B" : "rgba(39, 39, 42, 0.8)",
            color: isComplete ? "#1B9E5B" : "rgb(161 161 170)",
          }}
        >
          {isComplete && <Check className="w-3 h-3" />}
          <span>
            {isComplete ? "Listo" : <><span className="text-zinc-50">{filledCount}</span>/{EXTRAS_TOTAL} guardadas</>}
          </span>
        </div>
      </div>

      <p className="text-[12px] lg:text-[13px] text-zinc-500 mb-5 lg:mb-6 leading-relaxed">
        {EXTRAS_TOTAL} picks bonus que se suman a tu porra. Se guardan automáticamente al elegir.
      </p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {EXTRA_CARDS.map((card) => {
          if (card.type === "player") {
            return (
              <PlayerCard
                key={card.kind}
                kind={card.kind}
                label={card.label}
                points={card.points}
                description={card.description}
                icon={card.icon}
                value={extras[card.kind] ?? null}
                disabled={disabled}
                onChange={(v) => onExtraChange(card.kind, v)}
              />
            );
          }
          return (
            <TeamCard
              key={card.kind}
              kind={card.kind}
              label={card.label}
              points={card.points}
              description={card.description}
              icon={card.icon}
              value={extras[card.kind] ?? null}
              teams={allTeams}
              disabled={disabled}
              onChange={(v) => onExtraChange(card.kind, v)}
            />
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-5 text-[11px] text-zinc-500 text-center leading-relaxed">
        Puedes cambiar tus extras hasta el{" "}
        <span className="text-zinc-300 font-medium">11 jun, 18:00</span>.
        {" "}Después se bloquea para todos.
      </p>
    </div>
  );
}

// ─── Card wrapper ────────────────────────────────────────────

function CardShell({
  label,
  points,
  description,
  icon: Icon,
  filled,
  className,
  children,
}: {
  label: string;
  points: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  filled: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${className ?? ""}`}
      style={{
        background: "rgb(24 24 27 / 0.4)",
        borderColor: filled ? "rgba(245, 158, 11, 0.35)" : "rgba(39, 39, 42, 0.8)",
      }}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center">
            <Icon className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-zinc-100">{label}</div>
            <div className="text-[11px] text-zinc-500">{description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
            +{points} pts
          </span>
          {filled && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-zinc-950" />
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Player autocomplete ─────────────────────────────────────

function PlayerCard({
  kind,
  label,
  points,
  description,
  icon,
  value,
  disabled,
  onChange,
}: {
  kind: string;
  label: string;
  points: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string | null;
  disabled: boolean;
  onChange: (value: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return PLAYERS
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const selectedPlayer = value ? PLAYERS.find((p) => p.name === value) : null;

  function handleSelect(player: Player) {
    onChange(player.name);
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
  }

  return (
    <CardShell label={label} points={points} description={description} icon={icon} filled={!!value}>
      <div ref={containerRef} className="relative">
        {value ? (
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {selectedPlayer && <TeamFlag code={selectedPlayer.code} size={20} />}
              <span className="text-[13px] text-zinc-100 font-medium truncate">{value}</span>
              {selectedPlayer && (
                <span className="text-[10px] text-zinc-500 shrink-0">
                  {selectedPlayer.position} · {selectedPlayer.code}
                </span>
              )}
            </div>
            {!disabled && (
              <button onClick={handleClear} className="ml-2 p-0.5 text-zinc-500 hover:text-zinc-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => { if (query.length >= 2) setOpen(true); }}
              disabled={disabled}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        )}

        {open && results.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl max-h-70 overflow-y-auto scrollbar-thin">
            {results.map((player) => (
              <button
                key={`${kind}-${player.name}-${player.code}`}
                onClick={() => handleSelect(player)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-zinc-800/80 transition-colors"
              >
                <TeamFlag code={player.code} size={20} />
                <span className="text-[13px] text-zinc-100 flex-1 truncate">{player.name}</span>
                <span className="text-[10px] text-zinc-500 shrink-0">
                  {player.position} · {player.code}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </CardShell>
  );
}

// ─── Team selector ───────────────────────────────────────────

function TeamCard({
  kind,
  label,
  points,
  description,
  icon,
  value,
  teams,
  disabled,
  onChange,
}: {
  kind: string;
  label: string;
  points: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string | null;
  teams: Team[];
  disabled: boolean;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return teams;
    const q = search.toLowerCase();
    return teams.filter((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
  }, [teams, search]);

  const selectedTeam = value ? teams.find((t) => t.code === value) : null;

  return (
    <CardShell label={label} points={points} description={description} icon={icon} filled={!!value}>
      <div ref={containerRef} className="relative">
        {value && selectedTeam ? (
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <TeamFlag code={selectedTeam.code} size={20} />
              <span className="text-[13px] text-zinc-100 font-medium">{selectedTeam.name}</span>
              <span className="text-[10px] text-zinc-500">{selectedTeam.code}</span>
            </div>
            {!disabled && (
              <button onClick={() => { onChange(null); }} className="ml-2 p-0.5 text-zinc-500 hover:text-zinc-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => !disabled && setOpen(!open)}
            disabled={disabled}
            className="w-full flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2.5 text-left"
          >
            <span className="text-[13px] text-zinc-500">Elegir entre las 48 selecciones</span>
          </button>
        )}

        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl max-h-80 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-zinc-800/80">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar selección..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-md border border-zinc-800 bg-zinc-950 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                  autoFocus
                />
              </div>
              <div className="mt-1.5 text-[10px] text-zinc-500 px-1 tabular-nums">
                {filtered.length}/{teams.length}
              </div>
            </div>
            <div className="overflow-y-auto scrollbar-thin flex-1">
              {filtered.map((team) => (
                <button
                  key={`${kind}-${team.code}`}
                  onClick={() => { onChange(team.code); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-800/80 transition-colors"
                >
                  <TeamFlag code={team.code} size={20} />
                  <span className="text-[13px] text-zinc-100 flex-1">{team.name}</span>
                  <span className="text-[10px] text-zinc-500">{team.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardShell>
  );
}

