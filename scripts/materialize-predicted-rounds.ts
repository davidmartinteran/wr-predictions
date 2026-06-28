// Materializa predicted_team_rounds: la ronda en la que cada usuario predijo
// que cae cada selección, derivada de su porra congelada (deadline 11/jun).
//
// Reconstruye el bracket predicho de cada usuario igual que la UI:
// marcadores de grupos → standings → tiebreaks → terceros → picks de bracket.
// Es re-ejecutable (borra y reinserta por usuario+pool).
//
// Uso: npx tsx scripts/materialize-predicted-rounds.ts
//
// Caso límite: si un usuario tenía terceros EMPATADOS en su predicción, su
// selección manual no se persistió (solo vivía en estado de React). Se infiere
// priorizando los empatados que aparecen en sus picks de bracket y se avisa.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  deriveAllGroupStandings,
  applyGroupTiebreaks,
  rankThirdPlacedTeams,
  resolveThirds,
  buildBracketState,
  buildBracketStateFromR32,
  type ThirdPlaceTeam,
  type RealR32Match,
} from "../src/lib/bracket/engine";
import { derivePredictedRounds } from "../src/lib/bracket/predicted-rounds";
import type { TeamInfo } from "../src/lib/bracket/standings";

function loadEnv(): { url: string; serviceKey: string } {
  const env = readFileSync(".env.local", "utf8");
  const get = (key: string) => {
    const m = env.match(new RegExp(`^${key}=(.+)$`, "m"));
    if (!m) throw new Error(`Falta ${key} en .env.local`);
    return m[1].trim();
  };
  return {
    url: get("NEXT_PUBLIC_SUPABASE_URL"),
    serviceKey: get("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

async function main() {
  const { url, serviceKey } = loadEnv();
  const supabase = createClient(url, serviceKey);

  const [
    { data: teams },
    { data: groupMatches },
    { data: participations },
    { data: pools },
    { data: r32Matches },
  ] = await Promise.all([
    supabase.from("teams").select("id, name, code, flag_emoji"),
    supabase
      .from("matches")
      .select("id, group_letter, home_team, away_team")
      .eq("stage", "GROUP"),
    supabase.from("participations").select("user_id, pool_id"),
    supabase.from("pools").select("id, starts_at"),
    supabase
      .from("matches")
      .select("match_number, home_team, away_team")
      .eq("stage", "R32"),
  ]);
  if (!teams?.length || !groupMatches?.length || !participations?.length) {
    throw new Error("Datos base incompletos (teams/matches/participations)");
  }

  const teamById = new Map<string, TeamInfo>(teams.map((t) => [t.id, t]));
  const allTeamIds = teams.map((t) => t.id);
  const matchLikes = groupMatches.map((m) => ({
    id: m.id,
    group_letter: m.group_letter,
    home_team_data: teamById.get(m.home_team!)!,
    away_team_data: teamById.get(m.away_team!)!,
  }));

  // Porras tardías: bracket sembrado de los cruces REALES de R32, no de la
  // clasificación predicha (que no existe). Mismo motor que la UI.
  const lateStartByPool = new Map<string, boolean>(
    (pools ?? []).map((p) => [p.id, p.starts_at != null]),
  );
  const realR32: RealR32Match[] = (r32Matches ?? []).map((m) => ({
    matchNumber: m.match_number,
    homeTeam: m.home_team ? (teamById.get(m.home_team) ?? null) : null,
    awayTeam: m.away_team ? (teamById.get(m.away_team) ?? null) : null,
  }));

  for (const { user_id, pool_id } of participations) {
    const [{ data: preds }, { data: tiebreaks }, { data: koPicks }] =
      await Promise.all([
        supabase
          .from("predictions_match")
          .select("match_id, home_score, away_score")
          .eq("user_id", user_id)
          .eq("pool_id", pool_id),
        supabase
          .from("predictions_group_tiebreak")
          .select("group_letter, ordered_team_ids")
          .eq("user_id", user_id)
          .eq("pool_id", pool_id),
        supabase
          .from("predictions_knockout")
          .select("stage, slot, team_id")
          .eq("user_id", user_id)
          .eq("pool_id", pool_id),
      ]);

    const scoreMap: Record<string, { home: number | null; away: number | null }> = {};
    for (const p of preds ?? []) {
      scoreMap[p.match_id] = { home: p.home_score, away: p.away_score };
    }

    const tiebreakMap: Record<string, string[]> = {};
    for (const t of tiebreaks ?? []) {
      tiebreakMap[t.group_letter] = t.ordered_team_ids;
    }

    const pickedTeamIds = new Set((koPicks ?? []).map((k) => k.team_id));
    const picksMap: Record<string, string> = {};
    for (const k of koPicks ?? []) {
      if (k.stage === "CHAMPION") continue; // legacy: el campeón es el ganador de FINAL
      picksMap[`${k.stage}:${k.slot}`] = k.team_id;
    }

    let bracket;
    if (lateStartByPool.get(pool_id) === true) {
      // Porra tardía: bracket desde los cruces reales de R32 + sus picks.
      bracket = buildBracketStateFromR32(realR32, picksMap);
    } else {
      const standings = applyGroupTiebreaks(
        deriveAllGroupStandings(matchLikes, scoreMap),
        tiebreakMap
      );
      const ranking = rankThirdPlacedTeams(standings);

      let pickedFromTied: ThirdPlaceTeam[] = [];
      if (ranking.tied.length > 0 && ranking.neededFromTied > 0) {
        const inPicks = ranking.tied.filter((t) => pickedTeamIds.has(t.id));
        const rest = ranking.tied.filter((t) => !pickedTeamIds.has(t.id));
        pickedFromTied = [...inPicks, ...rest].slice(0, ranking.neededFromTied);
        console.warn(
          `⚠ user ${user_id}: terceros empatados sin selección persistida; ` +
            `inferidos: ${pickedFromTied.map((t) => t.code).join(", ")}`
        );
      }

      bracket = buildBracketState(
        standings,
        resolveThirds(ranking.autoQualified, pickedFromTied),
        picksMap
      );
    }
    const rounds = derivePredictedRounds(bracket, allTeamIds);

    // En porras de solo eliminatorias (sembradas del R32 real) las 16 selecciones
    // que cayeron en grupos se autoasignan a GROUP sin que nadie las prediga: no
    // se materializan (no deben puntuar — solo cuentan las eliminadas en R32+).
    const isLate = lateStartByPool.get(pool_id) === true;
    const rows = Object.entries(rounds)
      .filter(([, round]) => !(isLate && round === "GROUP"))
      .map(([team_id, round]) => ({
        user_id,
        pool_id,
        team_id,
        round,
      }));

    const { error: delErr } = await supabase
      .from("predicted_team_rounds")
      .delete()
      .eq("user_id", user_id)
      .eq("pool_id", pool_id);
    if (delErr) throw delErr;

    const { error: insErr } = await supabase
      .from("predicted_team_rounds")
      .insert(rows);
    if (insErr) throw insErr;

    const counts: Record<string, number> = {};
    for (const r of Object.values(rounds)) counts[r] = (counts[r] ?? 0) + 1;
    const champion = Object.entries(rounds).find(([, r]) => r === "CHAMPION")?.[0];
    const champCode = champion ? teamById.get(champion)?.code : "—";
    console.log(
      `✔ user ${user_id.slice(0, 8)} pool ${pool_id.slice(0, 8)}: ` +
        `${rows.length} equipos, campeón=${champCode}, picks=${bracket.filledCount}/31 | ` +
        JSON.stringify(counts)
    );
  }

  console.log("Hecho.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
