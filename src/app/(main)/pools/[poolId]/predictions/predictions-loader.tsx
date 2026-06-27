import { createClient } from "@/lib/supabase/server";
import { PredictionsClient } from "./predictions-client";
import type { ViewMode } from "./page";

type Props = {
  poolId: string;
  tournamentId: string;
  viewMode: ViewMode;
  currentUserId: string;
  targetUserId?: string;
  isAdmin: boolean;
  deadline: string;
  startsAt?: string | null;
  hideExtras?: boolean;
};

export async function PredictionsLoader({
  poolId,
  tournamentId,
  viewMode,
  currentUserId,
  targetUserId,
  isAdmin,
  deadline,
  startsAt,
  hideExtras,
}: Props) {
  const supabase = await createClient();
  const predictionsUserId =
    viewMode === "viewing-other" && targetUserId ? targetUserId : currentUserId;

  // Porra tardía: empieza en startsAt y el bracket se siembra de los cruces
  // reales de R32 (no de la clasificación predicha). `started` define si ya se
  // puede rellenar; antes, todo sale bloqueado.
  const isLatePool = startsAt != null;
  const now = new Date();
  const started = startsAt == null || new Date(startsAt) <= now;

  const [
    { data: matches },
    { data: predictions },
    { data: extraPredictions },
    { data: knockoutPredictions },
    { data: tiebreakRows },
    { data: allTeams },
  ] = await Promise.all([
    supabase
      .from("matches")
      .select(
        `
      id, group_letter, match_number, kickoff, stage,
      home_score, away_score, status, finished,
      home:teams!matches_home_team_fkey(id, name, code, flag_emoji),
      away:teams!matches_away_team_fkey(id, name, code, flag_emoji)
    `,
      )
      .eq("tournament_id", tournamentId)
      .eq("stage", "GROUP")
      .order("match_number"),
    supabase
      .from("predictions_match")
      .select("match_id, home_score, away_score")
      .eq("user_id", predictionsUserId)
      .eq("pool_id", poolId),
    supabase
      .from("predictions_extra")
      .select("kind, value")
      .eq("user_id", predictionsUserId)
      .eq("pool_id", poolId),
    supabase
      .from("predictions_knockout")
      .select("stage, slot, team_id")
      .eq("user_id", predictionsUserId)
      .eq("pool_id", poolId),
    supabase
      .from("predictions_group_tiebreak")
      .select("group_letter, ordered_team_ids")
      .eq("user_id", predictionsUserId)
      .eq("pool_id", poolId),
    supabase
      .from("teams")
      .select("id, name, code, flag_emoji")
      .eq("tournament_id", tournamentId)
      .order("name"),
  ]);

  let adminResults: { kind: string; value: string }[] = [];
  if (isAdmin) {
    const { data: results } = await supabase
      .from("pool_results_extra")
      .select("kind, value")
      .eq("pool_id", poolId);
    adminResults = (results ?? []).map((r) => ({
      kind: r.kind,
      value: r.value,
    }));
  }

  let ownPredictions: {
    match_id: string;
    home_score: number;
    away_score: number;
  }[] | null = null;
  let targetDisplayName: string | null = null;
  let poolParticipants: { userId: string; displayName: string }[] | null = null;

  if (viewMode === "viewing-other" && targetUserId) {
    const { data: ownPreds } = await supabase
      .from("predictions_match")
      .select("match_id, home_score, away_score")
      .eq("user_id", currentUserId)
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
    actual_home_score: (m as { home_score: number | null }).home_score,
    actual_away_score: (m as { away_score: number | null }).away_score,
    actual_status: (m as { status: string | null }).status,
    actual_finished: (m as { finished: boolean | null }).finished,
    home_team_data: m.home as unknown as {
      id: string;
      name: string;
      code: string;
      flag_emoji: string | null;
    },
    away_team_data: m.away as unknown as {
      id: string;
      name: string;
      code: string;
      flag_emoji: string | null;
    },
  }));

  // Cruces reales de R32 (los rellena poll-results al terminar los grupos):
  // siembran el bracket de una porra tardía. Solo se consultan en ese caso.
  type TeamData = { id: string; name: string; code: string; flag_emoji: string | null };
  let realR32: { matchNumber: number; homeTeam: TeamData | null; awayTeam: TeamData | null }[] = [];
  if (isLatePool) {
    const { data: r32 } = await supabase
      .from("matches")
      .select(
        `
        match_number,
        home:teams!matches_home_team_fkey(id, name, code, flag_emoji),
        away:teams!matches_away_team_fkey(id, name, code, flag_emoji)
      `,
      )
      .eq("tournament_id", tournamentId)
      .eq("stage", "R32")
      .order("match_number");
    realR32 = (r32 ?? []).map((m) => ({
      matchNumber: m.match_number,
      homeTeam: (m.home as unknown as TeamData | null) ?? null,
      awayTeam: (m.away as unknown as TeamData | null) ?? null,
    }));
  }

  return (
    <PredictionsClient
      poolId={poolId}
      matches={formattedMatches}
      isLatePool={isLatePool}
      started={started}
      startsAt={startsAt ?? null}
      hideExtras={hideExtras ?? false}
      realR32={realR32}
      tournamentStarted={formattedMatches.some(
        (m) => new Date(m.kickoff) <= now,
      )}
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
      targetUserId={viewMode === "viewing-other" ? targetUserId : undefined}
      savedTiebreaks={(tiebreakRows ?? []).map((r) => ({
        group_letter: r.group_letter,
        ordered_team_ids: r.ordered_team_ids,
      }))}
      isAdmin={isAdmin}
      adminResults={adminResults}
      deadline={deadline}
    />
  );
}
