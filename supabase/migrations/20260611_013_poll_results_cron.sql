-- Migration 013: cron de polling de resultados (pg_cron + pg_net + Vault)
-- Invoca la Edge Function poll-results cada 5 min. La función sale en
-- milisegundos si no hay partidos en ventana, así que el coste fuera de
-- horario de partidos es ~0.
--
-- Requiere dos secretos en Vault (se crean fuera de esta migración, nunca
-- en un fichero committeado):
--   select vault.create_secret('https://<ref>.supabase.co', 'project_url');
--   select vault.create_secret('<service_role_key>', 'service_role_key');

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Idempotente: reprogramar si ya existe
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'poll-results-every-5min') THEN
    PERFORM cron.unschedule('poll-results-every-5min');
  END IF;
END
$do$;

SELECT cron.schedule(
  'poll-results-every-5min',
  '*/5 * * * *',
  $cron$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
           || '/functions/v1/poll-results',
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
