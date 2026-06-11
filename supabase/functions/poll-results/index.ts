// Edge Function poll-results — actualizaciones automáticas de partidos.
//
// Invocada por pg_cron cada 5 min (ver migración 013). Flujo:
//   1. Busca partidos en ventana de juego (kickoff -15min … +5h, no FINISHED).
//   2. Si no hay ninguno, sale sin tocar la red (coste cero fuera de partidos).
//   3. Consulta el scoreboard de ESPN y actualiza status/marcador/finished.
//      Los partidos con source='MANUAL' (override del admin) no se tocan.
//   4. Si algún partido pasó a FINISHED, recalcula la categoría RESULTS de
//      scores para todos los pools con el scoring engine.
//
// Params opcionales (query string): ?force=true → fuerza fetch + recálculo
// aunque no haya partidos en ventana (útil para pruebas y para re-sincronizar).

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  scoreGroupMatch,
  DEFAULT_RULES,
  type ScoringRules,
} from "../_shared/scoring-engine.ts";

const ESPN_SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

// Abreviaturas ESPN → teams.code (solo divergencias conocidas)
const CODE_ALIAS: Record<string, string> = { HAI: "HTI" };

type EspnEvent = {
  id: string;
  date: string;
  status?: { type?: { state?: string; completed?: boolean } };
  competitions?: Array<{
    competitors?: Array<{
      homeAway: string;
      score?: string;
      team?: { abbreviation?: string };
    }>;
  }>;
};

type PendingMatch = {
  id: string;
  api_fixture_id: number | null;
  status: string;
  source: string | null;
  kickoff: string;
  home_team: string | null;
  away_team: string | null;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function yyyymmdd(iso: string): string {
  return iso.slice(0, 10).replaceAll("-", "");
}

function toInt(v: string | undefined): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeCode(abbr: string | undefined): string {
  if (!abbr) return "";
  return CODE_ALIAS[abbr] ?? abbr;
}

// pools.scoring_rules guarda formatos legacy {version, rules:{group_match_*}};
// el engine usa claves planas (match_sign…). Normalizamos con fallback a DEFAULT.
function normalizeRules(raw: unknown): ScoringRules {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.match_sign === "number") {
      return { ...DEFAULT_RULES, ...(obj as Partial<ScoringRules>) };
    }
    const legacy = obj.rules as Record<string, unknown> | undefined;
    if (legacy && typeof legacy.group_match_sign === "number") {
      return {
        ...DEFAULT_RULES,
        match_sign: legacy.group_match_sign as number,
        match_exact: (legacy.group_match_exact as number) ?? DEFAULT_RULES.match_exact,
      };
    }
  }
  return DEFAULT_RULES;
}

function espnStatus(ev: EspnEvent): "SCHEDULED" | "LIVE" | "FINISHED" {
  const type = ev.status?.type;
  if (type?.state === "post" && type.completed === true) return "FINISHED";
  if (type?.state === "in") return "LIVE";
  return "SCHEDULED";
}

async function recalcResults(supabase: SupabaseClient): Promise<number> {
  const { data: finished, error: fErr } = await supabase
    .from("matches")
    .select("id, home_score, away_score, home_team, away_team")
    .eq("finished", true)
    .not("home_score", "is", null)
    .not("away_score", "is", null);
  if (fErr) throw fErr;
  if (!finished?.length) return 0;

  const { data: spainTeams, error: sErr } = await supabase
    .from("teams")
    .select("id")
    .eq("code", "ESP");
  if (sErr) throw sErr;
  const spainIds = new Set((spainTeams ?? []).map((t) => t.id));

  const { data: pools, error: pErr } = await supabase
    .from("pools")
    .select("id, scoring_rules");
  if (pErr) throw pErr;

  const { data: preds, error: prErr } = await supabase
    .from("predictions_match")
    .select("user_id, pool_id, match_id, home_score, away_score")
    .in("match_id", finished.map((m) => m.id));
  if (prErr) throw prErr;

  const matchById = new Map(finished.map((m) => [m.id, m]));
  const rulesByPool = new Map(
    (pools ?? []).map((p) => [p.id, normalizeRules(p.scoring_rules)]),
  );

  type Acc = { points: number; exact_hits: number };
  const totals = new Map<string, Acc>(); // key: pool_id|user_id

  for (const pred of preds ?? []) {
    const match = matchById.get(pred.match_id);
    const rules = rulesByPool.get(pred.pool_id);
    if (!match || !rules) continue;

    const isSpain =
      spainIds.has(match.home_team) || spainIds.has(match.away_team);
    const score = scoreGroupMatch(
      { home_score: pred.home_score, away_score: pred.away_score },
      { home_score: match.home_score!, away_score: match.away_score! },
      rules,
      isSpain,
    );

    const key = `${pred.pool_id}|${pred.user_id}`;
    const acc = totals.get(key) ?? { points: 0, exact_hits: 0 };
    acc.points += score.points;
    if (score.exact_hit) acc.exact_hits += 1;
    totals.set(key, acc);
  }

  const rows = [...totals.entries()].map(([key, acc]) => {
    const [pool_id, user_id] = key.split("|");
    return {
      pool_id,
      user_id,
      category: "RESULTS",
      points: acc.points,
      exact_hits: acc.exact_hits,
      updated_at: new Date().toISOString(),
    };
  });

  if (rows.length) {
    const { error: upErr } = await supabase
      .from("scores")
      .upsert(rows, { onConflict: "user_id,pool_id,category" });
    if (upErr) throw upErr;
  }
  return rows.length;
}

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const force = new URL(req.url).searchParams.get("force") === "true";

    const now = Date.now();
    const { data: pending, error: mErr } = await supabase
      .from("matches")
      .select("id, api_fixture_id, status, source, kickoff, home_team, away_team")
      .neq("status", "FINISHED")
      .gte("kickoff", new Date(now - 5 * 3600_000).toISOString())
      .lte("kickoff", new Date(now + 15 * 60_000).toISOString())
      .returns<PendingMatch[]>();
    if (mErr) throw mErr;

    if (!pending?.length && !force) {
      return json({ skipped: true, reason: "no matches in window" });
    }

    let updated = 0;
    let transitionedToFinished = false;

    if (pending?.length) {
      const dates = [...new Set(pending.map((m) => yyyymmdd(m.kickoff)))].sort();
      const datesParam =
        dates.length === 1 ? dates[0] : `${dates[0]}-${dates[dates.length - 1]}`;
      const res = await fetch(`${ESPN_SCOREBOARD}?dates=${datesParam}&limit=100`);
      if (!res.ok) throw new Error(`ESPN ${res.status}`);
      const scoreboard = (await res.json()) as { events?: EspnEvent[] };
      const events = scoreboard.events ?? [];
      const eventById = new Map(events.map((ev) => [ev.id, ev]));

      // Para el fallback por kickoff+equipo necesitamos los codes de los teams
      let teamCodeById: Map<string, string> | null = null;
      if (pending.some((m) => m.api_fixture_id === null)) {
        const { data: teams } = await supabase.from("teams").select("id, code");
        teamCodeById = new Map((teams ?? []).map((t) => [t.id, t.code]));
      }

      for (const match of pending) {
        if (match.source === "MANUAL") continue; // override del admin: no tocar

        let ev = match.api_fixture_id
          ? eventById.get(String(match.api_fixture_id))
          : undefined;

        // Fallback: kickoff ±10 min + al menos un equipo coincidente
        if (!ev && teamCodeById) {
          const ko = new Date(match.kickoff).getTime();
          const home = teamCodeById.get(match.home_team ?? "") ?? "";
          const away = teamCodeById.get(match.away_team ?? "") ?? "";
          const candidates = events.filter((e) => {
            if (Math.abs(new Date(e.date).getTime() - ko) > 10 * 60_000) return false;
            const codes = (e.competitions?.[0]?.competitors ?? []).map((c) =>
              normalizeCode(c.team?.abbreviation),
            );
            return codes.includes(home) || codes.includes(away);
          });
          if (candidates.length === 1) ev = candidates[0];
        }
        if (!ev) {
          console.warn(`Sin evento ESPN para match ${match.id} (${match.kickoff})`);
          continue;
        }

        const status = espnStatus(ev);
        if (status === "SCHEDULED" && match.status === "SCHEDULED") continue;

        const competitors = ev.competitions?.[0]?.competitors ?? [];
        const home = competitors.find((c) => c.homeAway === "home");
        const away = competitors.find((c) => c.homeAway === "away");

        const { error: uErr } = await supabase
          .from("matches")
          .update({
            status,
            finished: status === "FINISHED",
            home_score: toInt(home?.score),
            away_score: toInt(away?.score),
            source: "API",
            api_fixture_id: Number(ev.id),
          })
          .eq("id", match.id);
        if (uErr) throw uErr;

        updated += 1;
        if (status === "FINISHED") transitionedToFinished = true;
      }
    }

    let scoreRows = 0;
    if (transitionedToFinished || force) {
      scoreRows = await recalcResults(supabase);
    }

    return json({
      ok: true,
      window: pending?.length ?? 0,
      updated,
      recalculated: transitionedToFinished || force,
      scoreRows,
    });
  } catch (err) {
    console.error("poll-results error:", err);
    return json({ ok: false, error: String(err) }, 500);
  }
});
