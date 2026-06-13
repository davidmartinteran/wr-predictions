"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const favoriteSchema = z.object({
  match_id: z.string().uuid(),
});

export async function toggleFavorite(data: z.infer<typeof favoriteSchema>) {
  const parsed = favoriteSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos no validos" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: existing } = await supabase
    .from("match_favorites")
    .select("match_id")
    .eq("user_id", user.id)
    .eq("match_id", parsed.data.match_id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("match_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("match_id", parsed.data.match_id);
    return { success: true, favorited: false };
  }

  const { error } = await supabase.from("match_favorites").insert({
    user_id: user.id,
    match_id: parsed.data.match_id,
  });
  if (error) return { error: "No se pudo guardar" };
  return { success: true, favorited: true };
}
