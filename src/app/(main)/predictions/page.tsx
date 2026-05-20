import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PredictionsClient } from "./predictions-client";

export default async function PredictionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user's pool
  const { data: participation, error: partError } = await supabase
    .from("participations")
    .select("pool_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!participation || partError) {
    return (
      <div className="flex items-center justify-center h-[60vh] px-4">
        <p className="text-muted-foreground text-center">
          No estás en ninguna porra todavía.
        </p>
      </div>
    );
  }

  const poolId = participation.pool_id;

  const { data: pool } = await supabase
    .from("pools")
    .select("id, status")
    .eq("id", poolId)
    .single();

  const disabled = pool?.status !== "OPEN";

  // Get matches with team data
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id, group_letter, match_number, kickoff, stage,
      home:teams!matches_home_team_fkey(id, name, code, flag_emoji),
      away:teams!matches_away_team_fkey(id, name, code, flag_emoji)
    `)
    .eq("pool_id", poolId)
    .eq("stage", "GROUP")
    .order("match_number");

  // Get user predictions
  const { data: predictions } = await supabase
    .from("predictions_match")
    .select("match_id, home_score, away_score")
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
      disabled={disabled}
    />
  );
}
