-- Migration 015: polling de resultados cada minuto (antes cada 5 min)
-- Durante un partido en vivo, 5 min entre actualizaciones era demasiado.
-- La Edge Function sale en milisegundos si no hay partidos en ventana,
-- así que el coste fuera de horario de partidos sigue siendo ~0.

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'poll-results-every-5min') THEN
    PERFORM cron.unschedule('poll-results-every-5min');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'poll-results-every-min') THEN
    PERFORM cron.unschedule('poll-results-every-min');
  END IF;
END
$do$;

SELECT cron.schedule(
  'poll-results-every-min',
  '* * * * *',
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
