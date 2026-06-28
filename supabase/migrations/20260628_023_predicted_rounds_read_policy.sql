-- Migration 023: lectura de predicted_team_rounds tras el revelado de la porra.
--
-- predicted_team_rounds se creó como artefacto interno de scoring (RLS sin
-- policies, solo service role). Ahora el desglose por equipos de la pantalla
-- /brackets necesita leerla desde el cliente de usuario para porras completas.
--
-- Se replica el mismo gate de revelado que predictions_* (status del pool):
-- los datos solo son legibles cuando la porra ya está cerrada/en directo/
-- revelada, en línea con ADR-002 (anonimato vía RLS, no en frontend).

CREATE POLICY "predicted_team_rounds_read" ON predicted_team_rounds FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predicted_team_rounds.pool_id
    AND p.status IN ('REVEALED', 'LIVE', 'CLOSED')
  )
);
