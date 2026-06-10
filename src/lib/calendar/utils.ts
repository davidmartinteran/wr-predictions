import { STAGE_LABELS } from "@/lib/bracket/mapping";
import type { CalendarMatch, TournamentDay } from "./types";

const TZ = "Europe/Madrid";

function toLocalDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

function getMatchday(matchNumber: number): number {
  if (matchNumber <= 24) return 1;
  if (matchNumber <= 48) return 2;
  return 3;
}

export function getPhaseLabel(stage: string, matchNumber: number): string {
  if (stage === "GROUP") {
    return `Fase de grupos · Jornada ${getMatchday(matchNumber)}`;
  }
  if (stage === "3RD") return "Tercer puesto";
  const label = STAGE_LABELS[stage as keyof typeof STAGE_LABELS];
  return label ?? stage;
}

export function isLiveMatch(match: CalendarMatch): boolean {
  if (match.finished) return false;
  const kickoff = new Date(match.kickoff).getTime();
  const now = Date.now();
  return now >= kickoff && now <= kickoff + 3 * 60 * 60 * 1000;
}

export function isSpainMatch(match: CalendarMatch): boolean {
  return match.home_team?.code === "ESP" || match.away_team?.code === "ESP";
}

export function isTodayKey(dateKey: string): boolean {
  return dateKey === toLocalDateKey(new Date());
}

export function formatDayHeader(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });
}

export function formatDayAbbrev(date: Date): {
  dayName: string;
  dayNum: number;
  monthShort: string;
} {
  const parts = new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  }).formatToParts(date);
  return {
    dayName: (parts.find((p) => p.type === "weekday")?.value ?? "").toUpperCase(),
    dayNum: Number(parts.find((p) => p.type === "day")?.value ?? 0),
    monthShort: parts.find((p) => p.type === "month")?.value ?? "",
  };
}

export function groupMatchesByDay(matches: CalendarMatch[]): TournamentDay[] {
  const dayMap = new Map<string, CalendarMatch[]>();

  for (const match of matches) {
    const key = toLocalDateKey(new Date(match.kickoff));
    const arr = dayMap.get(key);
    if (arr) {
      arr.push(match);
    } else {
      dayMap.set(key, [match]);
    }
  }

  const days: TournamentDay[] = [];
  for (const [dateKey, dayMatches] of dayMap) {
    dayMatches.sort((a, b) => a.match_number - b.match_number);
    const firstMatch = dayMatches[0];
    const phase = getPhaseLabel(firstMatch.stage, firstMatch.match_number);
    const hasLive = dayMatches.some(isLiveMatch);
    const matchday =
      firstMatch.stage === "GROUP" ? getMatchday(firstMatch.match_number) : undefined;

    days.push({
      dateKey,
      date: new Date(firstMatch.kickoff),
      matches: dayMatches,
      hasLive,
      phase,
      matchday,
    });
  }

  days.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return days;
}

export function findTodayOrNearest(days: TournamentDay[]): string {
  const todayKey = toLocalDateKey(new Date());
  const exact = days.find((d) => d.dateKey === todayKey);
  if (exact) return exact.dateKey;

  const future = days.find((d) => d.dateKey >= todayKey);
  if (future) return future.dateKey;

  return days[days.length - 1]?.dateKey ?? todayKey;
}
