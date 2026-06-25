-- Migration 021: fecha de inicio de la porra ("porras tardías").
--
-- Los partidos con kickoff ANTERIOR a starts_at se muestran pre-rellenados con
-- el resultado real, en read-only, y NO puntúan (el jugador no los pronostica).
-- NULL = porra normal (todo puntúa, comportamiento previo).
--
-- Caso de uso: una porra que arranca tarde, p.ej. solo eliminatorias para la
-- familia, abierta justo tras la fase de grupos: los 72 partidos de grupo salen
-- con su resultado real y solo se pronostica bracket + extras.

ALTER TABLE pools
  ADD COLUMN IF NOT EXISTS starts_at timestamptz;

COMMENT ON COLUMN pools.starts_at IS
  'Inicio de la porra. Partidos con kickoff < starts_at salen pre-rellenados con el resultado real y no puntúan. NULL = porra normal.';
