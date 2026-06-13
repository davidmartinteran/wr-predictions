-- Migration 018: sistema de notificaciones push
-- Tablas para favoritos de partidos, suscripciones push y log de notificaciones.

-- 1. match_favorites: partidos favoritos por usuario (global, no por pool)
CREATE TABLE match_favorites (
  user_id    uuid REFERENCES auth.users NOT NULL,
  match_id   uuid REFERENCES matches NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, match_id)
);

ALTER TABLE match_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "match_favorites_select" ON match_favorites
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "match_favorites_insert" ON match_favorites
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "match_favorites_delete" ON match_favorites
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_match_favorites_match ON match_favorites(match_id);


-- 2. push_subscriptions: una suscripcion Web Push por dispositivo
CREATE TABLE push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  endpoint    text NOT NULL UNIQUE,
  keys_p256dh text NOT NULL,
  keys_auth   text NOT NULL,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_select" ON push_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "push_subscriptions_insert" ON push_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_subscriptions_update" ON push_subscriptions
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "push_subscriptions_delete" ON push_subscriptions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);


-- 3. notification_log: idempotencia (sin RLS, solo service_role)
CREATE TABLE notification_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   uuid REFERENCES matches NOT NULL,
  kind       text NOT NULL CHECK (kind IN ('PRE_MATCH', 'POST_MATCH')),
  sent_at    timestamptz NOT NULL DEFAULT now(),
  recipients int NOT NULL DEFAULT 0,
  UNIQUE (match_id, kind)
);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;


-- 4. Cron job para send-notifications (cada minuto)
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-notifications-every-min') THEN
    PERFORM cron.unschedule('send-notifications-every-min');
  END IF;
END
$do$;

SELECT cron.schedule(
  'send-notifications-every-min',
  '* * * * *',
  $cron$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
           || '/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' ||
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cron$
);
