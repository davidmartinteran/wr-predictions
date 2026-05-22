-- Migration 006: split tournaments from pools
-- Separa datos del torneo (teams, matches, goal_events) — compartidos —
-- de datos del pool (config + predicciones + scores) — por porra.

-- 1. tournaments
CREATE TABLE tournaments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  code       text NOT NULL UNIQUE,
  starts_at  timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Seed: torneo Mundial 2026 (basado en la deadline del pool existente)
INSERT INTO tournaments (code, name, starts_at)
SELECT 'WC2026', 'Mundial 2026', MIN(deadline)
FROM pools
WHERE name = 'Mundial 2026';

-- 3. Añadir columnas tournament_id (NULLABLE de inicio para poder backfill)
ALTER TABLE teams       ADD COLUMN tournament_id uuid REFERENCES tournaments(id);
ALTER TABLE matches     ADD COLUMN tournament_id uuid REFERENCES tournaments(id);
ALTER TABLE goal_events ADD COLUMN tournament_id uuid REFERENCES tournaments(id);
ALTER TABLE pools       ADD COLUMN tournament_id uuid REFERENCES tournaments(id);

-- 4. Backfill: todo lo existente pertenece al único torneo WC2026
UPDATE teams       SET tournament_id = (SELECT id FROM tournaments WHERE code = 'WC2026');
UPDATE matches     SET tournament_id = (SELECT id FROM tournaments WHERE code = 'WC2026');
UPDATE goal_events SET tournament_id = (SELECT id FROM tournaments WHERE code = 'WC2026');
UPDATE pools       SET tournament_id = (SELECT id FROM tournaments WHERE code = 'WC2026');

-- 5. Hacer NOT NULL ahora que el backfill cubre todas las filas
ALTER TABLE teams       ALTER COLUMN tournament_id SET NOT NULL;
ALTER TABLE matches     ALTER COLUMN tournament_id SET NOT NULL;
ALTER TABLE goal_events ALTER COLUMN tournament_id SET NOT NULL;
ALTER TABLE pools       ALTER COLUMN tournament_id SET NOT NULL;

-- 6. invite_code para pools (UNIQUE, autogenerado)
ALTER TABLE pools
  ADD COLUMN invite_code text NOT NULL UNIQUE
  DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 8);

-- 7. teams.code: pasar de UNIQUE global a UNIQUE por torneo
ALTER TABLE teams DROP CONSTRAINT teams_code_key;
ALTER TABLE teams ADD CONSTRAINT teams_tournament_code_key UNIQUE (tournament_id, code);

-- 8. Dropear policies viejas que dependen de pool_id (se recrean en 007)
DROP POLICY IF EXISTS "teams_read"       ON teams;
DROP POLICY IF EXISTS "matches_read"     ON matches;
DROP POLICY IF EXISTS "goal_events_read" ON goal_events;

-- 9. Dropear las columnas pool_id de tablas que ahora pertenecen al torneo
DROP INDEX IF EXISTS idx_matches_pool_stage;
DROP INDEX IF EXISTS idx_goal_events_player;

ALTER TABLE teams       DROP COLUMN pool_id;
ALTER TABLE matches     DROP COLUMN pool_id;
ALTER TABLE goal_events DROP COLUMN pool_id;

-- 9. Indexes nuevos
CREATE INDEX idx_teams_tournament         ON teams(tournament_id);
CREATE INDEX idx_matches_tournament_stage ON matches(tournament_id, stage);
CREATE INDEX idx_goal_events_tournament   ON goal_events(tournament_id);
CREATE INDEX idx_goal_events_player       ON goal_events(tournament_id, player_name);
CREATE INDEX idx_pools_tournament         ON pools(tournament_id);
CREATE INDEX idx_pools_invite_code        ON pools(invite_code);
