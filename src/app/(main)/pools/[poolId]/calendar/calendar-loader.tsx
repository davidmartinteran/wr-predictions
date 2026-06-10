import { createClient } from "@/lib/supabase/server";
import { CalendarClient } from "./calendar-client";
import type { ScoringRules } from "@/lib/scoring/engine";

type Props = {
  poolId: string;
  tournamentId: string;
  currentUserId: string;
};

export async function CalendarLoader({
  poolId,
  tournamentId,
  currentUserId,
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
        home_score, away_score, finished,
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
      .select("scoring_rules")
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

  const scoringRules = (poolData?.scoring_rules ?? null) as ScoringRules | null;

  return (
    <CalendarClient
      matches={formattedMatches}
      predictions={formattedPredictions}
      scoringRules={scoringRules}
    />
  );
}
