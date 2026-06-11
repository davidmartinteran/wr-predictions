-- Migration 015: fix crítico multi-porra en predictions_match
-- La UNIQUE(user_id, match_id) era anterior al split de tournaments/pools
-- (migración 006): impedía que un usuario tuviera pronósticos del mismo
-- partido en dos porras. El upsert con onConflict (user_id, match_id)
-- MOVÍA la fila de pool y sobrescribía los valores al guardar en otra porra.
ALTER TABLE predictions_match
  DROP CONSTRAINT predictions_match_user_id_match_id_key;

ALTER TABLE predictions_match
  ADD CONSTRAINT predictions_match_user_pool_match_key
  UNIQUE (user_id, pool_id, match_id);
