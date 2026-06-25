"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createPoolSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(60),
  tournament_id: z.string().uuid(),
  deadline: z.string().datetime(),
  // Porras tardías: partidos antes de starts_at salen pre-rellenados reales y
  // no puntúan. Vacío = porra normal.
  starts_at: z.string().datetime().optional(),
  display_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(40),
});

const joinPoolSchema = z.object({
  invite_code: z.string().trim().min(4).max(32),
  display_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(40),
});

export async function createPool(input: z.infer<typeof createPoolSchema>) {
  console.log("createPool called with:", input);
  const parsed = createPoolSchema.safeParse(input);
  if (!parsed.success) {
    console.log("createPool validation failed:", parsed.error.issues);
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("createPool user:", user?.id ?? "NO USER");
  if (!user) return { error: "No autenticado" };

  const { data: pool, error } = await supabase
    .from("pools")
    .insert({
      name: parsed.data.name,
      tournament_id: parsed.data.tournament_id,
      deadline: parsed.data.deadline,
      starts_at: parsed.data.starts_at ?? null,
      created_by: user.id,
      status: "OPEN",
    })
    .select("id, invite_code")
    .single();

  if (error || !pool) {
    console.error("createPool error:", error);
    return { error: "No se pudo crear la porra" };
  }

  await supabase
    .from("participations")
    .update({ display_name: parsed.data.display_name })
    .eq("pool_id", pool.id)
    .eq("user_id", user.id);

  revalidatePath("/pools");
  return { success: true, id: pool.id, invite_code: pool.invite_code };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function joinPool(input: z.infer<typeof joinPoolSchema>) {
  const parsed = joinPoolSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: lookup, error: lookupErr } = await supabase
    .rpc("pool_lookup_by_invite_code", { p_code: parsed.data.invite_code })
    .maybeSingle();

  if (lookupErr || !lookup) {
    return { error: "Código de invitación no válido" };
  }

  const { count } = await supabase
    .from("participations")
    .select("user_id", { count: "exact", head: true })
    .eq("pool_id", lookup.id);

  if ((count ?? 0) >= 30) {
    return { error: "Esta porra está llena (máximo 30 jugadores)" };
  }

  const { error: insertErr } = await supabase
    .from("participations")
    .insert({
      user_id: user.id,
      pool_id: lookup.id,
      display_name: parsed.data.display_name,
      is_admin: false,
    });

  if (insertErr && insertErr.code !== "23505") {
    return { error: "No se pudo unir a la porra" };
  }

  revalidatePath("/pools");
  redirect(`/pools/${lookup.id}/predictions`);
}
