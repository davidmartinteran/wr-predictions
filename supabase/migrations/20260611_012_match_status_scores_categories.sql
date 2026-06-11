-- Migration 012: estado live de partidos + categorías de scores v2
-- matches.status lo escribe la Edge Function poll-results (ESPN polling);
-- el badge EN VIVO del calendario lo combina con la heurística de reloj.

-- 1. matches.status: SCHEDULED | LIVE | FINISHED
ALTER TABLE matches
  ADD COLUMN status text NOT NULL DEFAULT 'SCHEDULED'
  CHECK (status IN ('SCHEDULED','LIVE','FINISHED'));

UPDATE matches SET status = 'FINISHED' WHERE finished;

-- 2. scores: categorías de scoring v2 (leaderboard ya las espera)
DELETE FROM scores
  WHERE category NOT IN ('RESULTS','CLASSIFICATIONS','EXTRAS','TOTAL');

ALTER TABLE scores DROP CONSTRAINT scores_category_check;
ALTER TABLE scores ADD CONSTRAINT scores_category_check
  CHECK (category IN ('RESULTS','CLASSIFICATIONS','EXTRAS','TOTAL'));

-- 3. api_fixture_id pasa a guardar el event id de ESPN
COMMENT ON COLUMN matches.api_fixture_id IS
  'ESPN event id (site.api.espn.com/apis/site/v2/sports/soccer/fifa.world)';

CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_api_fixture
  ON matches(api_fixture_id) WHERE api_fixture_id IS NOT NULL;

-- 4. Index parcial para el polling (partidos no terminados)
CREATE INDEX IF NOT EXISTS idx_matches_pending
  ON matches(kickoff) WHERE status != 'FINISHED';
