-- Migration 016: seed de los 32 partidos de eliminatorias como placeholders.
-- Equipos NULL hasta que se conozcan los cruces (se rellenan al cerrar grupos).
-- kickoff y api_fixture_id tomados del scoreboard de ESPN (2026-06-12).
-- match_number 73-104: orden cronologico, coincide con numeracion oficial FIFA.
-- Idempotente: no inserta si el match_number ya existe en el torneo.

INSERT INTO matches (tournament_id, stage, match_number, kickoff, api_fixture_id, status, source)
SELECT '966b19aa-a8f8-473c-aae6-0e3c15dc9cef'::uuid, v.stage, v.match_number, v.kickoff::timestamptz, v.api_fixture_id, 'SCHEDULED', 'PENDING'
FROM (VALUES
  ('R32', 73, '2026-06-28T19:00Z', 760486),
  ('R32', 74, '2026-06-29T17:00Z', 760487),
  ('R32', 75, '2026-06-29T20:30Z', 760489),
  ('R32', 76, '2026-06-30T01:00Z', 760488),
  ('R32', 77, '2026-06-30T17:00Z', 760490),
  ('R32', 78, '2026-06-30T21:00Z', 760492),
  ('R32', 79, '2026-07-01T01:00Z', 760491),
  ('R32', 80, '2026-07-01T16:00Z', 760495),
  ('R32', 81, '2026-07-01T20:00Z', 760493),
  ('R32', 82, '2026-07-02T00:00Z', 760494),
  ('R32', 83, '2026-07-02T19:00Z', 760497),
  ('R32', 84, '2026-07-02T23:00Z', 760496),
  ('R32', 85, '2026-07-03T03:00Z', 760498),
  ('R32', 86, '2026-07-03T18:00Z', 760499),
  ('R32', 87, '2026-07-03T22:00Z', 760500),
  ('R32', 88, '2026-07-04T01:30Z', 760501),
  ('R16', 89, '2026-07-04T17:00Z', 760502),
  ('R16', 90, '2026-07-04T21:00Z', 760503),
  ('R16', 91, '2026-07-05T20:00Z', 760504),
  ('R16', 92, '2026-07-06T00:00Z', 760505),
  ('R16', 93, '2026-07-06T19:00Z', 760506),
  ('R16', 94, '2026-07-07T00:00Z', 760507),
  ('R16', 95, '2026-07-07T16:00Z', 760509),
  ('R16', 96, '2026-07-07T20:00Z', 760508),
  ('QF', 97, '2026-07-09T20:00Z', 760510),
  ('QF', 98, '2026-07-10T19:00Z', 760511),
  ('QF', 99, '2026-07-11T21:00Z', 760512),
  ('QF', 100, '2026-07-12T01:00Z', 760513),
  ('SF', 101, '2026-07-14T19:00Z', 760514),
  ('SF', 102, '2026-07-15T19:00Z', 760515),
  ('3RD', 103, '2026-07-18T21:00Z', 760516),
  ('FINAL', 104, '2026-07-19T19:00Z', 760517)
) AS v(stage, match_number, kickoff, api_fixture_id)
WHERE NOT EXISTS (
  SELECT 1 FROM matches m
  WHERE m.tournament_id = '966b19aa-a8f8-473c-aae6-0e3c15dc9cef'::uuid AND m.match_number = v.match_number
);
