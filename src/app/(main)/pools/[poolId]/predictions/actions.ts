"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const predictionSchema = z.object({
  match_id: z.string().uuid(),
  pool_id: z.string().uuid(),
  home_score: z.number().int().min(0).max(15),
  away_score: z.number().int().min(0).max(15),
});

const EXTRA_KINDS = [
  "TOP_SCORER", "BEST_PLAYER", "BEST_YOUNG_PLAYER", "BEST_GOALKEEPER",
  "TOP_ASSISTER", "MOST_GOALS_TEAM", "MOST_CONCEDED_TEAM",
] as const;

const extraSchema = z.object({
  pool_id: z.string().uuid(),
  kind: z.enum(EXTRA_KINDS),
  value: z.string().min(1).max(200),
});

const deleteExtraSchema = z.object({
  pool_id: z.string().uuid(),
  kind: z.enum(EXTRA_KINDS),
});

export async function saveExtra(data: z.infer<typeof extraSchema>) {
  const parsed = extraSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos no válidos" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("predictions_extra")
    .upsert(
      {
        user_id: user.id,
        pool_id: parsed.data.pool_id,
        kind: parsed.data.kind,
        value: parsed.data.value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,pool_id,kind" }
    );

  if (error) return { error: "No se pudo guardar" };
  return { success: true };
}

export async function deleteExtra(data: z.infer<typeof deleteExtraSchema>) {
  const parsed = deleteExtraSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos no válidos" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  await supabase
    .from("predictions_extra")
    .delete()
    .eq("user_id", user.id)
    .eq("pool_id", parsed.data.pool_id)
    .eq("kind", parsed.data.kind);

  return { success: true };
}

export async function savePrediction(data: z.infer<typeof predictionSchema>) {
  const parsed = predictionSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Datos no válidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase
    .from("predictions_match")
    .upsert(
      {
        user_id: user.id,
        pool_id: parsed.data.pool_id,
        match_id: parsed.data.match_id,
        home_score: parsed.data.home_score,
        away_score: parsed.data.away_score,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,match_id" }
    );

  if (error) {
    return { error: "No se pudo guardar. ¿Está la porra abierta?" };
  }

  return { success: true };
}

// ── Knockout predictions ─────────────────────────────────────────

const knockoutSchema = z.object({
  pool_id: z.string().uuid(),
  stage: z.enum(["R32", "R16", "QF", "SF", "FINAL", "CHAMPION"]),
  slot: z.number().int().min(0).max(15),
  team_id: z.string().uuid(),
});

export async function saveKnockoutPrediction(data: z.infer<typeof knockoutSchema>) {
  const parsed = knockoutSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos no válidos" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("predictions_knockout")
    .upsert(
      {
        user_id: user.id,
        pool_id: parsed.data.pool_id,
        stage: parsed.data.stage,
        slot: parsed.data.slot,
        team_id: parsed.data.team_id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,pool_id,stage,slot" }
    );

  if (error) return { error: "No se pudo guardar" };
  return { success: true };
}

const deleteKnockoutSchema = z.object({
  pool_id: z.string().uuid(),
  picks: z.array(z.object({
    stage: z.enum(["R32", "R16", "QF", "SF", "FINAL", "CHAMPION"]),
    slot: z.number().int().min(0).max(15),
  })),
});

export async function deleteKnockoutPredictions(data: z.infer<typeof deleteKnockoutSchema>) {
  const parsed = deleteKnockoutSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos no válidos" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  for (const pick of parsed.data.picks) {
    await supabase
      .from("predictions_knockout")
      .delete()
      .eq("user_id", user.id)
      .eq("pool_id", parsed.data.pool_id)
      .eq("stage", pick.stage)
      .eq("slot", pick.slot);
  }

  return { success: true };
}

// ── Group tiebreak resolutions ──────────────────────────────────

const tiebreakSchema = z.object({
  pool_id: z.string().uuid(),
  group_letter: z.string().length(1),
  ordered_team_ids: z.array(z.string().uuid()).min(2),
});

export async function saveGroupTiebreak(data: z.infer<typeof tiebreakSchema>) {
  const parsed = tiebreakSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos no válidos" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("predictions_group_tiebreak")
    .upsert(
      {
        user_id: user.id,
        pool_id: parsed.data.pool_id,
        group_letter: parsed.data.group_letter,
        ordered_team_ids: parsed.data.ordered_team_ids,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,pool_id,group_letter" }
    );

  if (error) return { error: "No se pudo guardar" };
  return { success: true };
}

// ── Admin: actual results for extras ────────────────────────────

const adminExtraSchema = z.object({
  pool_id: z.string().uuid(),
  kind: z.enum(EXTRA_KINDS),
  value: z.string().min(1).max(200),
});

export async function saveAdminExtra(data: z.infer<typeof adminExtraSchema>) {
  const parsed = adminExtraSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos no válidos" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("pool_results_extra")
    .upsert(
      {
        pool_id: parsed.data.pool_id,
        kind: parsed.data.kind,
        value: parsed.data.value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: "pool_id,kind" }
    );

  if (error) return { error: "No se pudo guardar. ¿Eres admin de esta porra?" };
  return { success: true };
}

export async function deleteAdminExtra(data: { pool_id: string; kind: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  await supabase
    .from("pool_results_extra")
    .delete()
    .eq("pool_id", data.pool_id)
    .eq("kind", data.kind);

  return { success: true };
}

export async function deleteGroupTiebreak(data: { pool_id: string; group_letter: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  await supabase
    .from("predictions_group_tiebreak")
    .delete()
    .eq("user_id", user.id)
    .eq("pool_id", data.pool_id)
    .eq("group_letter", data.group_letter);

  return { success: true };
}

// ── Bulk clear actions ────────────────────────────────────────

export async function clearGroupPredictions(data: { pool_id: string; match_ids: string[] }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  await supabase
    .from("predictions_match")
    .delete()
    .eq("user_id", user.id)
    .eq("pool_id", data.pool_id)
    .in("match_id", data.match_ids);

  return { success: true };
}

export async function clearAllExtras(data: { pool_id: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  await supabase
    .from("predictions_extra")
    .delete()
    .eq("user_id", user.id)
    .eq("pool_id", data.pool_id);

  return { success: true };
}

export async function clearAllBracket(data: { pool_id: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  await supabase
    .from("predictions_knockout")
    .delete()
    .eq("user_id", user.id)
    .eq("pool_id", data.pool_id);

  return { success: true };
}
