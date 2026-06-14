-- Migration 019: notificaciones por porra (sustituye favoritos)
-- Las notificaciones dejan de basarse en partidos favoritos. Ahora el admin
-- de una porra las activa para toda la porra (flag notifications_enabled) y los
-- miembros reciben avisos PRE/POST de TODOS los partidos del torneo.

-- 1. Flag de notificaciones a nivel de porra (lo controla el admin)
ALTER TABLE pools
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT false;

-- 2. Eliminar el sistema de favoritos (ya no se usa)
DROP TABLE IF EXISTS match_favorites;
