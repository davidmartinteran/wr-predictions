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

type AdminExtrasSectionProps = {
  poolId: string;
  results: Record<string, string>;
  allTeams: Team[];
  onResultChange: (kind: string, value: string | null) => void;
  filledCount: number;
};

const EXTRA_CARDS = [
  { kind: "TOP_SCORER", label: "Bota de Oro", description: "Máximo goleador del Mundial", type: "player" as const, icon: Trophy },
  { kind: "BEST_PLAYER", label: "Mejor jugador", description: "Balón de Oro del torneo", type: "player" as const, icon: Award },
  { kind: "BEST_YOUNG_PLAYER", label: "Mejor jugador joven", description: "Mejor jugador sub-21", type: "player" as const, icon: Star },
  { kind: "BEST_GOALKEEPER", label: "Mejor portero", description: "Guante de Oro del torneo", type: "player" as const, icon: ShieldCheck },
  { kind: "TOP_ASSISTER", label: "Máximo asistente", description: "Más pases de gol del Mundial", type: "player" as const, icon: Zap },
  { kind: "MOST_GOALS_TEAM", label: "Equipo más goleador", description: "Selección con más goles a favor", type: "team" as const, icon: Target },
  { kind: "MOST_CONCEDED_TEAM", label: "Equipo más goleado", description: "Selección con más goles en contra", type: "team" as const, icon: Shield },
] as const;

export const ADMIN_EXTRAS_TOTAL = 7;

export function AdminExtrasSection({ poolId, results, allTeams, onResultChange, filledCount }: AdminExtrasSectionProps) {
  return (
    <div className="px-4 lg:px-6 xl:px-10 pt-3 lg:py-7 pb-52 lg:pb-10 lg:max-w-[920px]">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[17px] lg:text-[32px] font-bold text-zinc-50 leading-none">
          Resultados oficiales
        </h1>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium tabular-nums"
          style={{
            background: filledCount === ADMIN_EXTRAS_TOTAL ? "rgba(244, 63, 94, 0.12)" : "rgb(24 24 27 / 0.6)",
            borderColor: filledCount === ADMIN_EXTRAS_TOTAL ? "#f43f5e" : "rgba(39, 39, 42, 0.8)",
            color: filledCount === ADMIN_EXTRAS_TOTAL ? "#f43f5e" : "rgb(161 161 170)",
          }}
        >
          {filledCount === ADMIN_EXTRAS_TOTAL && <Check className="w-3 h-3" />}
          <span>
            {filledCount === ADMIN_EXTRAS_TOTAL ? "Completo" : <><span className="text-zinc-50">{filledCount}</span>/{ADMIN_EXTRAS_TOTAL}</>}
          </span>
        </div>
      </div>

      <p className="text-[12px] lg:text-[13px] text-zinc-500 mb-5 lg:mb-6 leading-relaxed">
        Introduce los ganadores reales de cada categoría. Se usarán para calcular la puntuación de todos los jugadores.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {EXTRA_CARDS.map((card) => {
          if (card.type === "player") {
            return (
              <AdminPlayerCard
                key={card.kind}
                kind={card.kind}
                label={card.label}
                description={card.description}
                icon={card.icon}
                value={results[card.kind] ?? null}
                onChange={(v) => onResultChange(card.kind, v)}
              />
            );
          }
          return (
            <AdminTeamCard
              key={card.kind}
              kind={card.kind}
              label={card.label}
              description={card.description}
              icon={card.icon}
              value={results[card.kind] ?? null}
              teams={allTeams}
              onChange={(v) => onResultChange(card.kind, v)}
            />
          );
        })}
      </div>
    </div>
  );
}

function AdminCardShell({
  label,
  description,
  icon: Icon,
  filled,
  children,
}: {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  filled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{
        background: "rgb(24 24 27 / 0.4)",
        borderColor: filled ? "rgba(244, 63, 94, 0.35)" : "rgba(39, 39, 42, 0.8)",
      }}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-zinc-100">{label}</div>
            <div className="text-[11px] text-zinc-500">{description}</div>
          </div>
        </div>
        {filled && (
          <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function AdminPlayerCard({
  kind,
  label,
  description,
  icon,
  value,
  onChange,
}: {
  kind: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string | null;
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
    return PLAYERS.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const selectedPlayer = value ? PLAYERS.find((p) => p.name === value) : null;

  return (
    <AdminCardShell label={label} description={description} icon={icon} filled={!!value}>
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
            <button onClick={() => { onChange(null); setQuery(""); }} className="ml-2 p-0.5 text-zinc-500 hover:text-zinc-300">
              <X className="w-3.5 h-3.5" />
            </button>
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
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors"
            />
          </div>
        )}

        {open && results.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl max-h-[280px] overflow-y-auto scrollbar-thin">
            {results.map((player) => (
              <button
                key={`${kind}-${player.name}-${player.code}`}
                onClick={() => { onChange(player.name); setQuery(""); setOpen(false); }}
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
    </AdminCardShell>
  );
}

function AdminTeamCard({
  kind,
  label,
  description,
  icon,
  value,
  teams,
  onChange,
}: {
  kind: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string | null;
  teams: { id: string; name: string; code: string; flag_emoji: string | null }[];
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
    <AdminCardShell label={label} description={description} icon={icon} filled={!!value}>
      <div ref={containerRef} className="relative">
        {value && selectedTeam ? (
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <TeamFlag code={selectedTeam.code} size={20} />
              <span className="text-[13px] text-zinc-100 font-medium">{selectedTeam.name}</span>
            </div>
            <button onClick={() => onChange(null)} className="ml-2 p-0.5 text-zinc-500 hover:text-zinc-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2.5 text-left"
          >
            <span className="text-[13px] text-zinc-500">Elegir selección</span>
          </button>
        )}

        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl max-h-[320px] overflow-hidden flex flex-col">
            <div className="p-2 border-b border-zinc-800/80">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar selección..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-md border border-zinc-800 bg-zinc-950 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50"
                  autoFocus
                />
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
    </AdminCardShell>
  );
}
