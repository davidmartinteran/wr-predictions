-- Migration 017: soporte para scoring automático de eliminatorias (CLASSIFICATIONS)
--
-- 1. matches.winner_team: ganador real de cada eliminatoria, escrito por la
--    Edge Function poll-results desde el flag `winner` de ESPN (válido también
--    cuando el partido se decide en penaltis, donde el marcador queda empatado).
--
-- 2. predicted_team_rounds: ronda en la que cada usuario predijo que cae cada
--    selección, derivada UNA VEZ de su porra congelada (marcadores de grupos +
--    tiebreaks + picks de bracket) con scripts/materialize-predicted-rounds.ts.
--    Es un artefacto interno de scoring: RLS sin policies (solo service role).

ALTER TABLE matches ADD COLUMN IF NOT EXISTS winner_team uuid REFERENCES teams(id);

CREATE TABLE IF NOT EXISTS predicted_team_rounds (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id    uuid NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  team_id    uuid NOT NULL REFERENCES teams(id),
  round      text NOT NULL
             CHECK (round IN ('GROUP','R32','R16','QF','SF','RUNNER_UP','CHAMPION')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id, team_id)
);

ALTER TABLE predicted_team_rounds ENABLE ROW LEVEL SECURITY;
