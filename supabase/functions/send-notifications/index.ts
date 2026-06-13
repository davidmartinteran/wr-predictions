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
  "Ojo al {home} - {away}, barra libre de goles. Esto está clarísimo",
  "Atención al {home} - {away}. Partidazo, buen momento para pillar el sillón",
  "En 15 min {home} vs {away}. Cervecita fría y mando preparados",
  "Se viene el {home} - {away}. Hoy hay fútbol del bueno, barra y manta",
  "15 minutitos para el {home} - {away}. Como para perdérselo",
  "Esto va a ser un partidazo, el {home} - {away} en nada. Baja la persiana",
  "El {home} - {away} en nada. Con dos cañas y este partido no se necesita más",
  "Venga que empieza el {home} - {away}. Hoy se cena viendo fútbol y el que quiera algo que se lo haga",
  "Ojo que arranca el {home} - {away}. Aquí sabemos más que el entrenador",
  "Vamos con el {home} - {away}. Si no lo ves mañana no vengas a opinar",
  "En 15 min {home} vs {away}. Hoy no se baja al perro hasta que acabe esto",
  "{home} - {away} en 15 min. Baja a por hielos que esto hay que verlo bien",
  "Alerta Mundial: {home} vs {away}. Se suspenden planes familiares hasta nuevo aviso",
  "El {home} - {away} está al caer. Quien ponga Netflix hoy no tiene perdón",
  "En 15 min {home} vs {away}. Ponme una de jamón y baja el volumen de todo lo demás",
  "Se viene {home} - {away}. Esto no es fútbol, esto es poesía con botas",
  "{home} vs {away} en nada. Los del curro pueden esperar, esto no",
  "Arranca el {home} - {away}. Apaga las luces, sube el volumen, esto es sagrado",
  "15 min para el {home} - {away}. Que nadie llame, que nadie escriba, que nadie respire fuerte",
  "{home} - {away} a punto de empezar. Hoy el VAR soy yo desde el sofá",
];

const POST_MATCH_PHRASES: Record<string, string[]> = {
  victory: [
    "Hoy le toca croquejas a {loser}",
    "Hoy no le sonríe a {loser} ni la parienta",
    "Fútbol champagne de {winner}",
    "A {loser} hoy le toca gritamisú de postre",
    "{loser} que recoja los conos y apague las luces",
  ],
  blowout: [
    "Paliza. A la ducha y para casa",
    "Alguien que avise a {loser} que esto no era un entreno",
    "A {loser} le ha faltado pedir la cuenta y marcharse",
    "Que alguien llame a {loser} un taxi, que aquí ya no pintan nada",
  ],
  draw_zero: [
    "Estos han cogido apuntes de Bordalás",
    "Partido para olvidar, nos han robado 90 minutos",
    "Menos goles que conversación en un ascensor",
    "Lo más emocionante ha sido el descanso",
  ],
  draw_goals: [
    "Ni pa ti ni pa mí, que gane otro que tienen cositas que hacer",
    "Tablas. Como el matrimonio, aquí nadie gana pero todos opinan",
    "Empate. Tortilla para los dos y sin cebolla",
    "Empate. Aquí el único que gana es el bar",
  ],
};

function classifyResult(
  homeScore: number,
  awayScore: number,
): { category: string; winner: "home" | "away" | null } {
  if (homeScore === awayScore) {
    return {
      category: homeScore === 0 ? "draw_zero" : "draw_goals",
      winner: null,
    };
  }
  const diff = Math.abs(homeScore - awayScore);
  const winner = homeScore > awayScore ? "home" as const : "away" as const;
  return {
    category: diff >= 3 ? "blowout" : "victory",
    winner,
  };
}

function pickPreMatchPhrase(home: string, away: string): string {
  const idx = Math.floor(Math.random() * PRE_MATCH_PHRASES.length);
  return PRE_MATCH_PHRASES[idx]
    .replace("{home}", home)
    .replace("{away}", away);
}

function pickPostMatchPhrase(
  category: string,
  winnerName: string,
  loserName: string,
): string {
  const phrases = POST_MATCH_PHRASES[category] ?? POST_MATCH_PHRASES.victory;
  const idx = Math.floor(Math.random() * phrases.length);
  return phrases[idx]
    .replace(/\{winner\}/g, winnerName)
    .replace(/\{loser\}/g, loserName);
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
      const phrase = pickPreMatchPhrase(homeName, awayName);

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
      const hs = match.home_score!;
      const as_ = match.away_score!;
      const { category, winner } = classifyResult(hs, as_);
      const winnerName = winner === "home" ? homeName : awayName;
      const loserName = winner === "home" ? awayName : homeName;
      const phrase = pickPostMatchPhrase(category, winnerName, loserName);
      const scoreLine = `${homeName} ${hs}-${as_} ${awayName}`;

      let sent = 0;
      for (const sub of subs) {
        const result = await sendPush(sub, {
          title: scoreLine,
          body: `${scoreLine}. ${phrase}`,
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
