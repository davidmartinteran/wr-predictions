"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const emailSchema = z.email("Email no válido");

export async function sendMagicLink(formData: FormData) {
  const raw = formData.get("email");
  const next = formData.get("next");
  const parsed = emailSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Introduce un email válido" };
  }

  const callbackUrl = new URL(`${getBaseUrl()}/auth/callback`);
  if (typeof next === "string" && next.startsWith("/")) {
    callbackUrl.searchParams.set("next", next);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return { error: "No se pudo enviar el enlace. Inténtalo de nuevo." };
  }

  return { success: true, email: parsed.data };
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
