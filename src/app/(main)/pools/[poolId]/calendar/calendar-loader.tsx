import { createClient } from "@/lib/supabase/server";
import { CalendarClient } from "./calendar-client";
import { normalizePoolRules } from "@/lib/scoring/rules";

type Props = {
  poolId: string;
  tournamentId: string;
  currentUserId: string;
  isPastDeadline: boolean;
  isAdmin: boolean;
  focusMatchId?: string;
};

export async function CalendarLoader({
  poolId,
  tournamentId,
  currentUserId,
  isPastDeadline,
  isAdmin,
  focusMatchId,
}: Props) {
  const supabase = await createClient();

  const [
    { data: matches },
    { data: predictions },
    { data: poolData },
  ] = await Promise.all([
    supabase
      .from("matches")
      .select(
        `
        id, match_number, kickoff, stage, group_letter,
        home_score, away_score, finished, status,
        home:teams!matches_home_team_fkey(id, name, code, flag_emoji),
        away:teams!matches_away_team_fkey(id, name, code, flag_emoji)
      `,
      )
      .eq("tournament_id", tournamentId)
      .order("kickoff")
      .order("match_number"),
    supabase
      .from("predictions_match")
      .select("match_id, home_score, away_score")
      .eq("user_id", currentUserId)
      .eq("pool_id", poolId),
    supabase
      .from("pools")
      .select("scoring_rules, notifications_enabled")
      .eq("id", poolId)
      .single(),
  ]);

  const formattedMatches = (matches ?? []).map((m) => ({
    id: m.id,
    match_number: m.match_number,
    kickoff: m.kickoff,
    stage: m.stage,
    group_letter: m.group_letter,
    home_score: m.home_score,
    away_score: m.away_score,
    finished: m.finished,
    status: m.status,
    home_team: m.home as unknown as {
      id: string;
      name: string;
      code: string;
      flag_emoji: string | null;
    } | null,
    away_team: m.away as unknown as {
      id: string;
      name: string;
      code: string;
      flag_emoji: string | null;
    } | null,
  }));

  const formattedPredictions = (predictions ?? []).map((p) => ({
    match_id: p.match_id,
    home_score: p.home_score,
    away_score: p.away_score,
  }));

  const scoringRules = normalizePoolRules(poolData?.scoring_rules);
  const notificationsEnabled = poolData?.notifications_enabled ?? false;

  // Pronósticos de los demás jugadores: solo post-deadline. El RLS de
  // predictions_match es la barrera real (pool REVEALED/LIVE/CLOSED).
  let otherPredictions: {
    match_id: string;
    user_id: string;
    home_score: number;
    away_score: number;
  }[] = [];
  let participants: { user_id: string; display_name: string }[] = [];

  if (isPastDeadline) {
    const [{ data: otherPreds }, { data: parts }] = await Promise.all([
      supabase
        .from("predictions_match")
        .select("match_id, user_id, home_score, away_score")
        .eq("pool_id", poolId)
        .neq("user_id", currentUserId),
      supabase
        .from("participations")
        .select("user_id, display_name")
        .eq("pool_id", poolId)
        .neq("user_id", currentUserId),
    ]);

    otherPredictions = (otherPreds ?? []).map((p) => ({
      match_id: p.match_id,
      user_id: p.user_id,
      home_score: p.home_score,
      away_score: p.away_score,
    }));
    participants = (parts ?? []).map((p) => ({
      user_id: p.user_id,
      display_name: p.display_name,
    }));
  }

  return (
    <CalendarClient
      poolId={poolId}
      matches={formattedMatches}
      predictions={formattedPredictions}
      otherPredictions={otherPredictions}
      participants={participants}
      scoringRules={scoringRules}
      isAdmin={isAdmin}
      notificationsEnabled={notificationsEnabled}
      focusMatchId={focusMatchId}
    />
  );
}
