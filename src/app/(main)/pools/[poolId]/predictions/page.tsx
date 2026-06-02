import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PredictionsClient } from "./predictions-client";

export type ViewMode = "own-open" | "own-closed" | "viewing-other";

export default async function PredictionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ poolId: string }>;
  searchParams: Promise<{ player?: string }>;
}) {
  const { poolId } = await params;
  const { player: targetUserId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: pool } = await supabase
    .from("pools")
    .select("id, deadline, tournament_id")
    .eq("id", poolId)
    .maybeSingle();

  if (!pool) notFound();

  const { data: participation } = await supabase
    .from("participations")
    .select("is_admin")
    .eq("user_id", user.id)
    .eq("pool_id", poolId)
    .maybeSingle();

  const isAdmin = participation?.is_admin ?? false;

  const isPastDeadline = new Date(pool.deadline) < new Date();
  const viewingOther = !!targetUserId && targetUserId !== user.id && isPastDeadline;
  const viewMode: ViewMode = viewingOther
    ? "viewing-other"
    : isPastDeadline
      ? "own-closed"
      : "own-open";

  const predictionsUserId = viewingOther ? targetUserId : user.id;

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
    .eq("user_id", predictionsUserId)
    .eq("pool_id", poolId);

  const { data: extraPredictions } = await supabase
    .from("predictions_extra")
    .select("kind, value")
    .eq("user_id", predictionsUserId)
    .eq("pool_id", poolId);

  const { data: knockoutPredictions } = await supabase
    .from("predictions_knockout")
    .select("stage, slot, team_id")
    .eq("user_id", predictionsUserId)
    .eq("pool_id", poolId);

  const { data: tiebreakRows } = await supabase
    .from("predictions_group_tiebreak")
    .select("group_letter, ordered_team_ids")
    .eq("user_id", predictionsUserId)
    .eq("pool_id", poolId);

  const { data: allTeams } = await supabase
    .from("teams")
    .select("id, name, code, flag_emoji")
    .eq("tournament_id", pool.tournament_id)
    .order("name");

  let adminResults: { kind: string; value: string }[] = [];
  if (isAdmin) {
    const { data: results } = await supabase
      .from("pool_results_extra")
      .select("kind, value")
      .eq("pool_id", poolId);
    adminResults = (results ?? []).map((r) => ({ kind: r.kind, value: r.value }));
  }

  // When viewing another player, also fetch current user's predictions for comparison
  let ownPredictions: { match_id: string; home_score: number; away_score: number }[] | null = null;
  let targetDisplayName: string | null = null;
  let poolParticipants: { userId: string; displayName: string }[] | null = null;

  if (viewingOther) {
    const { data: ownPreds } = await supabase
      .from("predictions_match")
      .select("match_id, home_score, away_score")
      .eq("user_id", user.id)
      .eq("pool_id", poolId);
    ownPredictions = (ownPreds ?? []).map((p) => ({
      match_id: p.match_id,
      home_score: p.home_score,
      away_score: p.away_score,
    }));

    const { data: participants } = await supabase
      .from("participations")
      .select("user_id, display_name")
      .eq("pool_id", poolId);

    poolParticipants = (participants ?? []).map((p) => ({
      userId: p.user_id,
      displayName: p.display_name,
    }));

    const target = poolParticipants.find((p) => p.userId === targetUserId);
    targetDisplayName = target?.displayName ?? "Jugador";
  }

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
      extraPredictions={(extraPredictions ?? []).map((p) => ({
        kind: p.kind,
        value: p.value,
      }))}
      allTeams={(allTeams ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        flag_emoji: t.flag_emoji,
      }))}
      knockoutPredictions={(knockoutPredictions ?? []).map((p) => ({
        stage: p.stage,
        slot: p.slot,
        team_id: p.team_id,
      }))}
      disabled={viewMode !== "own-open"}
      viewMode={viewMode}
      ownPredictions={ownPredictions}
      targetDisplayName={targetDisplayName}
      poolParticipants={poolParticipants}
      targetUserId={viewingOther ? targetUserId : undefined}
      savedTiebreaks={(tiebreakRows ?? []).map((r) => ({
        group_letter: r.group_letter,
        ordered_team_ids: r.ordered_team_ids,
      }))}
      isAdmin={isAdmin}
      adminResults={adminResults}
    />
  );
}
