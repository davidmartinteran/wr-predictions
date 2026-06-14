"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  pool_id: z.string().uuid(),
  enabled: z.boolean(),
});

// Activa o desactiva las notificaciones de una porra. Solo el admin de la porra
// puede hacerlo. Cuando está activa, los miembros reciben avisos PRE/POST de
// todos los partidos del torneo (ver Edge Function send-notifications).
export async function setPoolNotifications(data: z.infer<typeof schema>) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: "Datos no validos" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: participation } = await supabase
    .from("participations")
    .select("is_admin")
    .eq("pool_id", parsed.data.pool_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!participation?.is_admin) return { error: "Solo el admin puede cambiar esto" };

  const { data: updated, error } = await supabase
    .from("pools")
    .update({ notifications_enabled: parsed.data.enabled })
    .eq("id", parsed.data.pool_id)
    .select("id")
    .maybeSingle();

  if (error || !updated) return { error: "No se pudo guardar" };

  revalidatePath(`/pools/${parsed.data.pool_id}/calendar`);
  return { success: true, enabled: parsed.data.enabled };
}
