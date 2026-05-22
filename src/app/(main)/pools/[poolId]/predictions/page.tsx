import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PredictionsClient } from "./predictions-client";

export default async function PredictionsPage({
  params,
}: {
  params: Promise<{ poolId: string }>;
}) {
  const { poolId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: pool } = await supabase
    .from("pools")
    .select("id, status, tournament_id")
    .eq("id", poolId)
    .maybeSingle();

  if (!pool) notFound();

  const disabled = pool.status !== "OPEN";

  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id, group_letter, match_number, kickoff, stage,
      home:teams!matches_home_team_fkey(id, name, code, flag_emoji),
      away:teams!matches_away_team_fkey(id, name, code, flag_emoji)
    `)
    .eq("tournament_id", pool.tournament_id)
    .eq("stage", "GROUP")
    .order("match_number");

  const { data: predictions } = await supabase
    .from("predictions_match")
    .select("match_id, home_score, away_score")
    .eq("user_id", user.id)
    .eq("pool_id", poolId);

  const { data: firstScorerPreds } = await supabase
    .from("predictions_first_scorer")
    .select("match_id, player_name")
    .eq("user_id", user.id)
    .eq("pool_id", poolId);

  const formattedMatches = (matches ?? []).map((m) => ({
    id: m.id,
    group_letter: m.group_letter,
    match_number: m.match_number,
    kickoff: m.kickoff,
    home_team_data: m.home as unknown as { id: string; name: string; code: string; flag_emoji: string | null },
    away_team_data: m.away as unknown as { id: string; name: string; code: string; flag_emoji: string | null },
  }));

  return (
    <PredictionsClient
      poolId={poolId}
      matches={formattedMatches}
      predictions={(predictions ?? []).map((p) => ({
        match_id: p.match_id,
        home_score: p.home_score,
        away_score: p.away_score,
      }))}
      firstScorerPredictions={(firstScorerPreds ?? []).map((p) => ({
        match_id: p.match_id,
        player_name: p.player_name,
      }))}
      disabled={disabled}
    />
  );
}
