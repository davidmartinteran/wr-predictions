-- Migration 020: contador de aciertos de signo (1X2) por jugador.
-- Complementa exact_hits (marcador exacto). poll-results lo rellena en la
-- categoría RESULTS; el leaderboard lo muestra junto a los exactos.

ALTER TABLE scores
  ADD COLUMN IF NOT EXISTS sign_hits int NOT NULL DEFAULT 0;
