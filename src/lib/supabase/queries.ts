import { cache } from "react";
import { createClient } from "./server";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getPool = cache(async (poolId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pools")
    .select("id, name, status, deadline, starts_at, invite_code, tournament_id")
    .eq("id", poolId)
    .maybeSingle();
  return data;
});

export const getParticipation = cache(
  async (poolId: string, userId: string) => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("participations")
      .select("pool_id, display_name, is_admin")
      .eq("user_id", userId)
      .eq("pool_id", poolId)
      .maybeSingle();
    return data;
  },
);

export const getParticipantCount = cache(async (poolId: string) => {
  const supabase = await createClient();
  const { count } = await supabase
    .from("participations")
    .select("user_id", { count: "exact", head: true })
    .eq("pool_id", poolId);
  return count ?? 0;
});
