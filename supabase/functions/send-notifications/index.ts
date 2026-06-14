// Edge Function send-notifications — notificaciones push por porra.
//
// Invocada por pg_cron cada minuto (ver migracion 018). Flujo:
//   1. Determina los torneos con al menos una porra que tenga
//      notifications_enabled = true, y quienes son sus participantes.
//   2. PRE_MATCH: partidos de esos torneos con kickoff en los proximos 16 min
//      sin entrada en notification_log.
//   3. POST_MATCH: partidos FINISHED de esos torneos sin notificacion enviada.
//   4. Cada partido se notifica una sola vez al conjunto (deduplicado) de
//      usuarios suscritos que participan en alguna porra activa del torneo.
//   5. Limpia suscripciones muertas (410/404).

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

type MatchRow = {
  id: string;
  tournament_id: string;
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

    // VAPID keys desde secrets de Edge Functions (supabase secrets set …)
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:davidmartinteran@gmail.com";

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

    // --- Porras con notificaciones activas ---
    const { data: enabledPools } = await supabase
      .from("pools")
      .select("id, tournament_id")
      .eq("notifications_enabled", true);

    if (!enabledPools?.length) {
      return json({ ok: true, sent: 0, staleRemoved: 0, reason: "no pools enabled" });
    }

    // tournament_id -> pool_ids con notificaciones activas
    const poolsByTournament = new Map<string, string[]>();
    for (const p of enabledPools) {
      const arr = poolsByTournament.get(p.tournament_id) ?? [];
      arr.push(p.id);
      poolsByTournament.set(p.tournament_id, arr);
    }
    const enabledTournamentIds = [...poolsByTournament.keys()];

    // Suscripciones (deduplicadas por endpoint) de los participantes de las
    // porras activas de un torneo. Un partido se notifica una sola vez a este
    // conjunto aunque el usuario esté en varias porras del mismo torneo.
    async function subsForTournament(tournamentId: string): Promise<Subscription[]> {
      const poolIds = poolsByTournament.get(tournamentId);
      if (!poolIds?.length) return [];
      const { data: parts } = await supabase
        .from("participations")
        .select("user_id")
        .in("pool_id", poolIds);
      const userIds = [...new Set((parts ?? []).map((p) => p.user_id))];
      if (!userIds.length) return [];
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("id, user_id, endpoint, keys_p256dh, keys_auth")
        .in("user_id", userIds)
        .returns<Subscription[]>();
      const seen = new Set<string>();
      return (subs ?? []).filter((s) => {
        if (seen.has(s.endpoint)) return false;
        seen.add(s.endpoint);
        return true;
      });
    }

    // Idempotencia: match_ids ya notificados, cargados de una vez.
    const { data: loggedRows } = await supabase
      .from("notification_log")
      .select("match_id, kind");
    const loggedSet = new Set(
      (loggedRows ?? []).map((r) => `${r.kind}:${r.match_id}`),
    );

    // --- PRE_MATCH: partidos con kickoff en los proximos 16 minutos ---
    const { data: preMatches } = await supabase
      .from("matches")
      .select(`
        id, tournament_id, kickoff, status, home_score, away_score,
        home_team:teams!matches_home_team_fkey(name, code),
        away_team:teams!matches_away_team_fkey(name, code)
      `)
      .in("tournament_id", enabledTournamentIds)
      .neq("status", "FINISHED")
      .gte("kickoff", new Date(now).toISOString())
      .lte("kickoff", new Date(now + 16 * 60_000).toISOString())
      .returns<MatchRow[]>();

    for (const match of preMatches ?? []) {
      if (loggedSet.has(`PRE_MATCH:${match.id}`)) continue;

      const subs = await subsForTournament(match.tournament_id);
      // Sin suscriptores aun: no registramos, por si alguien se suscribe dentro
      // de la ventana de 16 min antes del kickoff.
      if (!subs.length) continue;

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
        id, tournament_id, kickoff, status, home_score, away_score,
        home_team:teams!matches_home_team_fkey(name, code),
        away_team:teams!matches_away_team_fkey(name, code)
      `)
      .in("tournament_id", enabledTournamentIds)
      .eq("status", "FINISHED")
      .not("home_score", "is", null)
      .not("away_score", "is", null)
      .returns<MatchRow[]>();

    for (const match of postMatches ?? []) {
      if (loggedSet.has(`POST_MATCH:${match.id}`)) continue;

      const subs = await subsForTournament(match.tournament_id);
      if (!subs.length) {
        // Sin suscriptores: registrar para no reprocesar un partido ya acabado.
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
