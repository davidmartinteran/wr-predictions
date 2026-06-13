"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys_p256dh: z.string().min(1),
  keys_auth: z.string().min(1),
  user_agent: z.string().optional(),
});

export async function saveSubscription(
  data: z.infer<typeof subscriptionSchema>,
) {
  const parsed = subscriptionSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos no validos" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: parsed.data.endpoint,
      keys_p256dh: parsed.data.keys_p256dh,
      keys_auth: parsed.data.keys_auth,
      user_agent: parsed.data.user_agent ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) return { error: "No se pudo guardar" };
  return { success: true };
}

export async function removeSubscription(endpoint: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  return { success: true };
}
