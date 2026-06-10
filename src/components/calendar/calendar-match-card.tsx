"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/team-flag";
import { isLiveMatch, isSpainMatch } from "@/lib/calendar/utils";
import type { CalendarMatch, CalendarPrediction } from "@/lib/calendar/types";
import type { MatchScore } from "@/lib/scoring/engine";

type Props = {
  match: CalendarMatch;
  prediction: CalendarPrediction | null;
  scoring: MatchScore | null;
};

function formatTime(kickoff: string): string {
  return new Date(kickoff).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}

function StageBadge({ match }: { match: CalendarMatch }) {
  if (match.stage === "GROUP" && match.group_letter) {
    return (
      <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
        Grupo {match.group_letter}
      </span>
    );
  }
  const labels: Record<string, string> = {
    R32: "32vos",
    R16: "8vos",
    QF: "4tos",
    SF: "Semis",
    "3RD": "3er puesto",
    FINAL: "Final",
  };
  return (
    <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
      {labels[match.stage] ?? match.stage}
    </span>
  );
}

function ScoreBadge({ scoring }: { scoring: MatchScore }) {
  if (scoring.exact_hit) {
    return (
      <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded">
        Exacto +{scoring.points}
      </span>
    );
  }
  if (scoring.points > 0) {
    return (
      <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded">
        Signo +{scoring.points}
      </span>
    );
  }
  return (
    <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
      Fallo 0
    </span>
  );
}

function TeamRow({
  team,
  score,
  isSpain,
  isLive,
}: {
  team: CalendarMatch["home_team"];
  score: number | null;
  isSpain: boolean;
  isLive: boolean;
}) {
  if (!team) {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-[13px] text-zinc-600 italic">Por definir</span>
        <span className="font-mono font-bold text-[17px] tabular-nums text-zinc-600">
          —
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2.5 min-w-0">
        <TeamFlag code={team.code} size={22} />
        <span className="text-[10px] font-medium text-zinc-500 w-5 shrink-0">
          {team.code.slice(0, 2)}
        </span>
        <span className="text-[14px] font-medium text-zinc-100 truncate">
          {team.name}
        </span>
        {isSpain && (
          <span className="text-primary text-[12px] font-bold">&gt;</span>
        )}
      </div>
      <span
        className={cn(
          "font-mono font-bold text-[17px] tabular-nums shrink-0 ml-3",
          score === null
            ? "text-zinc-600"
            : isLive
              ? "text-zinc-50"
              : "text-zinc-100"
        )}
      >
        {score ?? "—"}
      </span>
    </div>
  );
}

export function CalendarMatchCard({ match, prediction, scoring }: Props) {
  const live = isLiveMatch(match);
  const spain = isSpainMatch(match);
  const finished = match.finished;
  const upcoming = !finished && !live;
  const time = formatTime(match.kickoff);

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-colors",
        live
          ? "border-rose-500/40 bg-zinc-900/60"
          : "border-zinc-800/80 bg-zinc-900/40"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 text-[10.5px]">
        <div className="flex items-center gap-2">
          {finished && (
            <span className="font-semibold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
              FINAL
            </span>
          )}
          {live && (
            <span className="flex items-center gap-1 font-bold bg-rose-500/15 text-rose-400 px-1.5 py-0.5 rounded text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              EN VIVO
            </span>
          )}
          {upcoming && (
            <span className="flex items-center gap-1 text-primary font-medium">
              <Clock className="h-3 w-3" />
              {time}
            </span>
          )}
          {(finished || live) && (
            <span className="text-zinc-500">{time}</span>
          )}
        </div>
        <StageBadge match={match} />
      </div>

      {/* Teams */}
      <TeamRow
        team={match.home_team}
        score={finished || live ? match.home_score : null}
        isSpain={spain && match.home_team?.code === "ESP"}
        isLive={live}
      />
      <TeamRow
        team={match.away_team}
        score={finished || live ? match.away_score : null}
        isSpain={spain && match.away_team?.code === "ESP"}
        isLive={live}
      />

      {/* Scoring + Prediction footer */}
      {prediction && (prediction.home_score !== null && prediction.away_score !== null) && (
        <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {finished && scoring && <ScoreBadge scoring={scoring} />}
            {!finished && (
              <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-500 font-medium">
                Tu pronóstico
              </span>
            )}
          </div>
          <span className="font-mono font-bold text-[13px] tabular-nums text-zinc-400">
            {prediction.home_score} – {prediction.away_score}
          </span>
        </div>
      )}
    </div>
  );
}
