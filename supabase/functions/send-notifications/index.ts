// Edge Function send-notifications — notificaciones push para partidos favoritos.
//
// Invocada por pg_cron cada minuto (ver migracion 018). Flujo:
//   1. PRE_MATCH: busca partidos con kickoff en los proximos 16 min que tengan
//      favoritos y no esten ya en notification_log.
//   2. POST_MATCH: busca partidos FINISHED con favoritos sin notificacion enviada.
//   3. Para cada caso, envia Web Push a todos los dispositivos suscritos.
//   4. Limpia suscripciones muertas (410/404).

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

type MatchRow = {
  id: string;
  kickoff: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: { name: string; code: string } | null;
  away_team: { name: string; code: string } | null;
};

type Subscription = {
  id: string;
  user_id: string;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
};

const PRE_MATCH_PHRASES = [
  "No te pierdas el {home} - {away}. Partidazo!",
  "En 15 min arranca el {home} - {away}. Tienes tu pronostico listo?",
  "{home} contra {away} esta a punto de empezar. Vamos!",
  "Se viene el {home} - {away}. Calienta motores!",
  "Atencion: {home} vs {away} en 15 minutitos!",
  "El {home} - {away} esta al caer. No te lo pierdas!",
  "Falta nada para el {home} - {away}. A disfrutar!",
  "Que empiece el espectaculo! {home} vs {away} en nada.",
];

function pickPhrase(home: string, away: string): string {
  const idx = Math.floor(Math.random() * PRE_MATCH_PHRASES.length);
  return PRE_MATCH_PHRASES[idx]
    .replace("{home}", home)
    .replace("{away}", away);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function sendPush(
  sub: Subscription,
  payload: { title: string; body: string; tag: string; url: string },
  vapidDetails: { subject: string; publicKey: string; privateKey: string },
): Promise<{ ok: boolean; gone: boolean }> {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: payload.tag,
        url: payload.url,
      }),
      { vapidDetails },
    );
    return { ok: true, gone: false };
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) {
      return { ok: false, gone: true };
    }
    console.error(`Push failed for ${sub.endpoint}:`, err);
    return { ok: false, gone: false };
  }
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // VAPID keys from Vault
    const { data: secrets } = await supabase.rpc("get_vault_secrets", undefined);
    const secretMap = new Map<string, string>();
    if (secrets) {
      for (const s of secrets as { name: string; decrypted_secret: string }[]) {
        secretMap.set(s.name, s.decrypted_secret);
      }
    }

    // Fallback: read from vault.decrypted_secrets directly
    if (!secretMap.has("vapid_public_key")) {
      const { data: vaultRows } = await supabase
        .from("vault.decrypted_secrets")
        .select("name, decrypted_secret")
        .in("name", ["vapid_public_key", "vapid_private_key", "vapid_subject"]);
      // If the above doesn't work (vault not exposed as table), use raw SQL
      if (!vaultRows?.length) {
        const { data: sqlRows } = await supabase.rpc("sql", {
          query: `SELECT name, decrypted_secret FROM vault.decrypted_secrets WHERE name IN ('vapid_public_key', 'vapid_private_key', 'vapid_subject')`,
        });
        if (sqlRows) {
          for (const r of sqlRows as { name: string; decrypted_secret: string }[]) {
            secretMap.set(r.name, r.decrypted_secret);
          }
        }
      } else {
        for (const r of vaultRows) {
          secretMap.set(r.name, r.decrypted_secret);
        }
      }
    }

    const vapidPublic = secretMap.get("vapid_public_key") ?? Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = secretMap.get("vapid_private_key") ?? Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = secretMap.get("vapid_subject") ?? Deno.env.get("VAPID_SUBJECT") ?? "mailto:davidmartinteran@gmail.com";

    if (!vapidPublic || !vapidPrivate) {
      return json({ skipped: true, reason: "no VAPID keys configured" });
    }

    const vapidDetails = {
      subject: vapidSubject,
      publicKey: vapidPublic,
      privateKey: vapidPrivate,
    };

    const now = Date.now();
    let totalSent = 0;
    const staleEndpoints: string[] = [];

    // --- PRE_MATCH: partidos con kickoff en los proximos 16 minutos ---
    const { data: preMatches } = await supabase
      .from("matches")
      .select(`
        id, kickoff, status, home_score, away_score,
        home_team:teams!matches_home_team_fkey(name, code),
        away_team:teams!matches_away_team_fkey(name, code)
      `)
      .neq("status", "FINISHED")
      .gte("kickoff", new Date(now).toISOString())
      .lte("kickoff", new Date(now + 16 * 60_000).toISOString())
      .returns<MatchRow[]>();

    for (const match of preMatches ?? []) {
      // Check notification_log for idempotency
      const { data: logged } = await supabase
        .from("notification_log")
        .select("id")
        .eq("match_id", match.id)
        .eq("kind", "PRE_MATCH")
        .maybeSingle();
      if (logged) continue;

      // Get users who favorited this match
      const { data: favs } = await supabase
        .from("match_favorites")
        .select("user_id")
        .eq("match_id", match.id);
      if (!favs?.length) continue;

      const userIds = favs.map((f) => f.user_id);
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("id, user_id, endpoint, keys_p256dh, keys_auth")
        .in("user_id", userIds)
        .returns<Subscription[]>();
      if (!subs?.length) continue;

      const homeName = match.home_team?.name ?? "Equipo";
      const awayName = match.away_team?.name ?? "Equipo";
      const phrase = pickPhrase(homeName, awayName);

      let sent = 0;
      for (const sub of subs) {
        const result = await sendPush(sub, {
          title: `${homeName} vs ${awayName}`,
          body: phrase,
          tag: `pre-match-${match.id}`,
          url: "/",
        }, vapidDetails);
        if (result.ok) sent++;
        if (result.gone) staleEndpoints.push(sub.endpoint);
      }

      await supabase.from("notification_log").insert({
        match_id: match.id,
        kind: "PRE_MATCH",
        recipients: sent,
      });
      totalSent += sent;
    }

    // --- POST_MATCH: partidos FINISHED sin notificacion ---
    const { data: postMatches } = await supabase
      .from("matches")
      .select(`
        id, kickoff, status, home_score, away_score,
        home_team:teams!matches_home_team_fkey(name, code),
        away_team:teams!matches_away_team_fkey(name, code)
      `)
      .eq("status", "FINISHED")
      .not("home_score", "is", null)
      .not("away_score", "is", null)
      .returns<MatchRow[]>();

    for (const match of postMatches ?? []) {
      const { data: logged } = await supabase
        .from("notification_log")
        .select("id")
        .eq("match_id", match.id)
        .eq("kind", "POST_MATCH")
        .maybeSingle();
      if (logged) continue;

      const { data: favs } = await supabase
        .from("match_favorites")
        .select("user_id")
        .eq("match_id", match.id);
      if (!favs?.length) {
        // No favorites for this match, still log it so we don't recheck
        await supabase.from("notification_log").insert({
          match_id: match.id,
          kind: "POST_MATCH",
          recipients: 0,
        });
        continue;
      }

      const userIds = favs.map((f) => f.user_id);
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("id, user_id, endpoint, keys_p256dh, keys_auth")
        .in("user_id", userIds)
        .returns<Subscription[]>();
      if (!subs?.length) {
        await supabase.from("notification_log").insert({
          match_id: match.id,
          kind: "POST_MATCH",
          recipients: 0,
        });
        continue;
      }

      const homeName = match.home_team?.name ?? "?";
      const awayName = match.away_team?.name ?? "?";

      let sent = 0;
      for (const sub of subs) {
        const result = await sendPush(sub, {
          title: `Final: ${homeName} ${match.home_score} - ${match.away_score} ${awayName}`,
          body: `${homeName} ${match.home_score} - ${match.away_score} ${awayName}`,
          tag: `post-match-${match.id}`,
          url: "/",
        }, vapidDetails);
        if (result.ok) sent++;
        if (result.gone) staleEndpoints.push(sub.endpoint);
      }

      await supabase.from("notification_log").insert({
        match_id: match.id,
        kind: "POST_MATCH",
        recipients: sent,
      });
      totalSent += sent;
    }

    // Cleanup stale subscriptions
    if (staleEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", staleEndpoints);
    }

    return json({
      ok: true,
      sent: totalSent,
      staleRemoved: staleEndpoints.length,
    });
  } catch (err) {
    console.error("send-notifications error:", err);
    return json({ ok: false, error: String(err) }, 500);
  }
});
