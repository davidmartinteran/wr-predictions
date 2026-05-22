"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const predictionSchema = z.object({
  match_id: z.string().uuid(),
  pool_id: z.string().uuid(),
  home_score: z.number().int().min(0).max(15),
  away_score: z.number().int().min(0).max(15),
});

const firstScorerSchema = z.object({
  match_id: z.string().uuid(),
  pool_id: z.string().uuid(),
  player_name: z.string().min(1).max(100),
});

export async function saveFirstScorer(data: z.infer<typeof firstScorerSchema>) {
  const parsed = firstScorerSchema.safeParse(data);
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
    .from("predictions_first_scorer")
    .upsert(
      {
        user_id: user.id,
        pool_id: parsed.data.pool_id,
        match_id: parsed.data.match_id,
        player_name: parsed.data.player_name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,pool_id,match_id" }
    );

  if (error) {
    return { error: "No se pudo guardar el primer goleador" };
  }

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
