// Edge Function poll-results — actualizaciones automáticas de partidos.
//
// Invocada por pg_cron cada minuto (ver migración 015). Flujo:
//   1. Busca partidos en ventana de juego (kickoff -15min … +5h, no FINISHED).
//   2. Si no hay ninguno (y no toca pase de eliminatorias), sale sin tocar la
//      red (coste ~0 fuera de partidos).
//   3. Consulta el scoreboard de ESPN y actualiza status/marcador/finished.
//      En eliminatorias guarda además winner_team (flag `winner` de ESPN,
//      válido también en penaltis). source='MANUAL' (override admin) no se toca.
//   4. Cada 30 min (o con ?force): pase de eliminatorias — rellena
//      home_team/away_team de los cruces cuando ESPN ya los conoce.
//   5. Recalcula scores: categoría RESULTS (partidos de grupos) y categoría
//      CLASSIFICATIONS (ronda real de cada selección vs predicted_team_rounds).
//
// Params opcionales (query string): ?force=true → fuerza fetch + recálculo
// aunque no haya partidos en ventana (útil para pruebas y para re-sincronizar).

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  scoreGroupMatch,
  scoreElimination,
  DEFAULT_RULES,
  type ScoringRules,
  type EliminationRound,
} from "../_shared/scoring-engine.ts";
import { deriveActualRounds } from "../_shared/actual-rounds.ts";

const ESPN_SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

// Abreviaturas ESPN → teams.code (solo divergencias conocidas)
const CODE_ALIAS: Record<string, string> = { HAI: "HTI" };

type EspnCompetitor = {
  homeAway: string;
  score?: string;
  winner?: boolean;
  team?: { abbreviation?: string };
};

type EspnEvent = {
  id: string;
  date: string;
  status?: { type?: { state?: string; completed?: boolean } };
  competitions?: Array<{ competitors?: EspnCompetitor[] }>;
};

type PendingMatch = {
  id: string;
  api_fixture_id: number | null;
  status: string;
  source: string | null;
  kickoff: string;
  stage: string;
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

function eventCompetitors(ev: EspnEvent): {
  home: EspnCompetitor | undefined;
  away: EspnCompetitor | undefined;
} {
  const comps = ev.competitions?.[0]?.competitors ?? [];
  return {
    home: comps.find((c) => c.homeAway === "home"),
    away: comps.find((c) => c.homeAway === "away"),
  };
}

// Ganador de una eliminatoria según ESPN. El flag `winner` es la fuente de
// verdad (cubre prórroga y penaltis, donde el marcador queda empatado).
// Fallback por marcador solo si ESPN no marcó winner y no hay empate.
function winnerTeamId(
  home: EspnCompetitor | undefined,
  away: EspnCompetitor | undefined,
  homeId: string | null,
  awayId: string | null,
): string | null {
  if (home?.winner === true) return homeId;
  if (away?.winner === true) return awayId;
  const h = toInt(home?.score);
  const a = toInt(away?.score);
  if (h !== null && a !== null && h !== a) return h > a ? homeId : awayId;
  return null;
}

async function fetchScoreboard(datesParam: string): Promise<Map<string, EspnEvent>> {
  const res = await fetch(`${ESPN_SCOREBOARD}?dates=${datesParam}&limit=100`);
  if (!res.ok) throw new Error(`ESPN ${res.status}`);
  const scoreboard = (await res.json()) as { events?: EspnEvent[] };
  return new Map((scoreboard.events ?? []).map((ev) => [ev.id, ev]));
}

// ESPN agrupa eventos por fecha de US Eastern (UTC-4): un kickoff de madrugada
// UTC aparece bajo el día anterior. Pedimos siempre desde un día antes.
function datesRangeFor(kickoffs: string[]): string {
  const times = kickoffs.map((k) => new Date(k).getTime());
  const from = new Date(Math.min(...times) - 24 * 3600_000);
  const to = new Date(Math.max(...times));
  return `${yyyymmdd(from.toISOString())}-${yyyymmdd(to.toISOString())}`;
}

type KnockoutRow = {
  id: string;
  stage: string;
  kickoff: string;
  api_fixture_id: number | null;
  status: string;
  source: string | null;
  finished: boolean;
  home_team: string | null;
  away_team: string | null;
  winner_team: string | null;
};

// Pase de eliminatorias: rellena home/away cuando ESPN ya conoce el cruce y
// asegura winner_team en partidos acabados. Devuelve si hubo cambios.
async function fillKnockout(
  supabase: SupabaseClient,
  teamIdByCode: Map<string, string>,
): Promise<boolean> {
  const { data: kos, error } = await supabase
    .from("matches")
    .select(
      "id, stage, kickoff, api_fixture_id, status, source, finished, home_team, away_team, winner_team",
    )
    .neq("stage", "GROUP")
    .returns<KnockoutRow[]>();
  if (error) throw error;

  const targets = (kos ?? []).filter(
    (m) =>
      m.source !== "MANUAL" &&
      m.api_fixture_id !== null &&
      (m.home_team === null ||
        m.away_team === null ||
        (m.finished && m.winner_team === null)),
  );
  if (!targets.length) return false;

  const eventById = await fetchScoreboard(
    datesRangeFor(targets.map((m) => m.kickoff)),
  );

  let changed = false;
  for (const match of targets) {
    const ev = eventById.get(String(match.api_fixture_id));
    if (!ev) continue;

    const { home, away } = eventCompetitors(ev);
    const homeId = teamIdByCode.get(normalizeCode(home?.team?.abbreviation)) ?? null;
    const awayId = teamIdByCode.get(normalizeCode(away?.team?.abbreviation)) ?? null;

    const update: Record<string, unknown> = {};
    if (homeId && homeId !== match.home_team) update.home_team = homeId;
    if (awayId && awayId !== match.away_team) update.away_team = awayId;

    if (espnStatus(ev) === "FINISHED") {
      const winner = winnerTeamId(home, away, homeId ?? match.home_team, awayId ?? match.away_team);
      if (winner && winner !== match.winner_team) update.winner_team = winner;
      if (!match.finished) {
        update.status = "FINISHED";
        update.finished = true;
        update.home_score = toInt(home?.score);
        update.away_score = toInt(away?.score);
        update.source = "API";
      }
    }

    if (Object.keys(update).length === 0) continue;
    const { error: uErr } = await supabase.from("matches").update(update).eq("id", match.id);
    if (uErr) throw uErr;
    changed = true;
  }
  return changed;
}

// Recalcula la categoría CLASSIFICATIONS: ronda real de cada selección
// (deriveActualRounds sobre matches) vs ronda predicha (predicted_team_rounds),
// puntuada con scoreElimination (distancia + España ×2).
async function recalcClassifications(supabase: SupabaseClient): Promise<number> {
  const { data: kos, error: kErr } = await supabase
    .from("matches")
    .select("stage, home_team, away_team, winner_team")
    .neq("stage", "GROUP");
  if (kErr) throw kErr;

  const { data: teams, error: tErr } = await supabase.from("teams").select("id, code");
  if (tErr) throw tErr;

  const actual = deriveActualRounds(kos ?? [], (teams ?? []).map((t) => t.id));
  if (Object.keys(actual).length === 0) return 0;

  const spainIds = new Set((teams ?? []).filter((t) => t.code === "ESP").map((t) => t.id));

  const { data: pools, error: pErr } = await supabase.from("pools").select("id, scoring_rules");
  if (pErr) throw pErr;
  const rulesByPool = new Map(
    (pools ?? []).map((p) => [p.id, normalizeRules(p.scoring_rules)]),
  );

  const { data: preds, error: prErr } = await supabase
    .from("predicted_team_rounds")
    .select("user_id, pool_id, team_id, round");
  if (prErr) throw prErr;

  const totals = new Map<string, number>(); // key: pool_id|user_id
  for (const pred of preds ?? []) {
    const actualRound = actual[pred.team_id];
    const rules = rulesByPool.get(pred.pool_id);
    if (!actualRound || !rules) continue;

    const pts = scoreElimination(
      pred.round as EliminationRound,
      actualRound,
      rules,
      spainIds.has(pred.team_id),
    );
    const key = `${pred.pool_id}|${pred.user_id}`;
    totals.set(key, (totals.get(key) ?? 0) + pts);
  }

  const rows = [...totals.entries()].map(([key, points]) => {
    const [pool_id, user_id] = key.split("|");
    return {
      pool_id,
      user_id,
      category: "CLASSIFICATIONS",
      points,
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

  type Acc = { points: number; exact_hits: number; sign_hits: number };
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
    const acc = totals.get(key) ?? { points: 0, exact_hits: 0, sign_hits: 0 };
    acc.points += score.points;
    if (score.exact_hit) acc.exact_hits += 1;
    // Signo acertado pero sin marcador exacto (1X2 correcto, 1 pt base).
    else if (score.points > 0) acc.sign_hits += 1;
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
      sign_hits: acc.sign_hits,
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
      .select("id, api_fixture_id, status, source, kickoff, stage, home_team, away_team")
      .neq("status", "FINISHED")
      .gte("kickoff", new Date(now - 5 * 3600_000).toISOString())
      .lte("kickoff", new Date(now + 15 * 60_000).toISOString())
      .returns<PendingMatch[]>();
    if (mErr) throw mErr;

    // El pase de eliminatorias no hace falta cada minuto: cada 30 min basta
    const doFill = force || new Date().getUTCMinutes() % 30 === 0;

    if (!pending?.length && !doFill) {
      return json({ skipped: true, reason: "no matches in window" });
    }

    // code → id (rellenar cruces y ganadores), id → code (fallback por equipo)
    const { data: teams, error: tErr } = await supabase.from("teams").select("id, code");
    if (tErr) throw tErr;
    const teamIdByCode = new Map((teams ?? []).map((t) => [t.code, t.id]));
    const teamCodeById = new Map((teams ?? []).map((t) => [t.id, t.code]));

    let updated = 0;
    let transitionedToFinished = false;
    let knockoutChanged = false;

    if (pending?.length) {
      const eventById = await fetchScoreboard(
        datesRangeFor(pending.map((m) => m.kickoff)),
      );
      const events = [...eventById.values()];

      for (const match of pending) {
        if (match.source === "MANUAL") continue; // override del admin: no tocar

        let ev = match.api_fixture_id
          ? eventById.get(String(match.api_fixture_id))
          : undefined;

        // Fallback: kickoff ±10 min + al menos un equipo coincidente
        if (!ev) {
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

        const { home, away } = eventCompetitors(ev);

        const update: Record<string, unknown> = {
          status,
          finished: status === "FINISHED",
          home_score: toInt(home?.score),
          away_score: toInt(away?.score),
          source: "API",
          api_fixture_id: Number(ev.id),
        };

        // Eliminatorias: equipos (por si el cruce se resolvió tarde) y ganador
        if (match.stage !== "GROUP") {
          const homeId = teamIdByCode.get(normalizeCode(home?.team?.abbreviation)) ?? null;
          const awayId = teamIdByCode.get(normalizeCode(away?.team?.abbreviation)) ?? null;
          if (homeId && homeId !== match.home_team) update.home_team = homeId;
          if (awayId && awayId !== match.away_team) update.away_team = awayId;
          if (status === "FINISHED") {
            update.winner_team = winnerTeamId(
              home,
              away,
              homeId ?? match.home_team,
              awayId ?? match.away_team,
            );
          }
        }

        const { error: uErr } = await supabase
          .from("matches")
          .update(update)
          .eq("id", match.id);
        if (uErr) throw uErr;

        updated += 1;
        if (status === "FINISHED") {
          transitionedToFinished = true;
          if (match.stage !== "GROUP") knockoutChanged = true;
        }
      }
    }

    if (doFill) {
      const filled = await fillKnockout(supabase, teamIdByCode);
      knockoutChanged = knockoutChanged || filled;
    }

    let scoreRows = 0;
    if (transitionedToFinished || force) {
      scoreRows = await recalcResults(supabase);
    }

    let classificationRows = 0;
    if (knockoutChanged || force) {
      classificationRows = await recalcClassifications(supabase);
    }

    return json({
      ok: true,
      window: pending?.length ?? 0,
      updated,
      knockoutFillPass: doFill,
      recalculated: transitionedToFinished || force,
      scoreRows,
      classificationRows,
    });
  } catch (err) {
    console.error("poll-results error:", err);
    return json({ ok: false, error: String(err) }, 500);
  }
});
