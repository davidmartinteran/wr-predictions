-- Migration 014: cron de lock/reveal de pools al pasar el deadline
-- Cada minuto: OPEN → LOCKED (dispara freeze_scoring_on_lock, migración 004)
-- e inmediatamente LOCKED → REVEALED. Ambas transiciones ocurren al deadline,
-- según lo previsto: tras el deadline no se puede editar y las porras +
-- clasificación pasan a ser visibles (RLS de scores y predicciones).
-- SQL puro en pg_cron: sin Edge Function, sin HTTP, sin secretos.

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'lock-reveal-pools') THEN
    PERFORM cron.unschedule('lock-reveal-pools');
  END IF;
END
$do$;

SELECT cron.schedule(
  'lock-reveal-pools',
  '* * * * *',
  $cron$
  UPDATE pools SET status = 'LOCKED'   WHERE status = 'OPEN'   AND deadline <= now();
  UPDATE pools SET status = 'REVEALED' WHERE status = 'LOCKED' AND deadline <= now();
  $cron$
);
