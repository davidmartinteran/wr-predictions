-- Seed data for Porra Mundial 2026
-- 48 teams + 72 group stage matches
-- Run after creating a pool and setting its ID below

-- ============================================================
-- STEP 1: Create the pool (requires an auth.users ID as admin)
-- Replace 'ADMIN_USER_ID' with the actual admin user UUID
-- ============================================================
-- INSERT INTO pools (name, status, deadline, created_by)
-- VALUES ('Mundial 2026', 'CONFIG', '2026-06-11T16:00:00Z', 'ADMIN_USER_ID');

-- ============================================================
-- STEP 2: Teams (48)
-- Uses a CTE to reference the pool by name
-- ============================================================
DO $$
DECLARE
  v_pool_id uuid;
BEGIN
  SELECT id INTO v_pool_id FROM pools WHERE name = 'Mundial 2026' LIMIT 1;
  IF v_pool_id IS NULL THEN
    RAISE EXCEPTION 'Pool "Mundial 2026" not found. Create it first.';
  END IF;

  -- Group A
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('México', 'MEX', '🇲🇽', 'A', v_pool_id),
    ('Sudáfrica', 'RSA', '🇿🇦', 'A', v_pool_id),
    ('Corea del Sur', 'KOR', '🇰🇷', 'A', v_pool_id),
    ('Chequia', 'CZE', '🇨🇿', 'A', v_pool_id);

  -- Group B
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('Canadá', 'CAN', '🇨🇦', 'B', v_pool_id),
    ('Suiza', 'SUI', '🇨🇭', 'B', v_pool_id),
    ('Catar', 'QAT', '🇶🇦', 'B', v_pool_id),
    ('Bosnia y Herzegovina', 'BIH', '🇧🇦', 'B', v_pool_id);

  -- Group C
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('Brasil', 'BRA', '🇧🇷', 'C', v_pool_id),
    ('Marruecos', 'MAR', '🇲🇦', 'C', v_pool_id),
    ('Haití', 'HTI', '🇭🇹', 'C', v_pool_id),
    ('Escocia', 'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'C', v_pool_id);

  -- Group D
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('Estados Unidos', 'USA', '🇺🇸', 'D', v_pool_id),
    ('Paraguay', 'PAR', '🇵🇾', 'D', v_pool_id),
    ('Australia', 'AUS', '🇦🇺', 'D', v_pool_id),
    ('Turquía', 'TUR', '🇹🇷', 'D', v_pool_id);

  -- Group E
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('Alemania', 'GER', '🇩🇪', 'E', v_pool_id),
    ('Curazao', 'CUW', '🇨🇼', 'E', v_pool_id),
    ('Costa de Marfil', 'CIV', '🇨🇮', 'E', v_pool_id),
    ('Ecuador', 'ECU', '🇪🇨', 'E', v_pool_id);

  -- Group F
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('Países Bajos', 'NED', '🇳🇱', 'F', v_pool_id),
    ('Japón', 'JPN', '🇯🇵', 'F', v_pool_id),
    ('Suecia', 'SWE', '🇸🇪', 'F', v_pool_id),
    ('Túnez', 'TUN', '🇹🇳', 'F', v_pool_id);

  -- Group G
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('Bélgica', 'BEL', '🇧🇪', 'G', v_pool_id),
    ('Egipto', 'EGY', '🇪🇬', 'G', v_pool_id),
    ('Irán', 'IRN', '🇮🇷', 'G', v_pool_id),
    ('Nueva Zelanda', 'NZL', '🇳🇿', 'G', v_pool_id);

  -- Group H
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('España', 'ESP', '🇪🇸', 'H', v_pool_id),
    ('Cabo Verde', 'CPV', '🇨🇻', 'H', v_pool_id),
    ('Arabia Saudita', 'KSA', '🇸🇦', 'H', v_pool_id),
    ('Uruguay', 'URU', '🇺🇾', 'H', v_pool_id);

  -- Group I
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('Francia', 'FRA', '🇫🇷', 'I', v_pool_id),
    ('Senegal', 'SEN', '🇸🇳', 'I', v_pool_id),
    ('Noruega', 'NOR', '🇳🇴', 'I', v_pool_id),
    ('Irak', 'IRQ', '🇮🇶', 'I', v_pool_id);

  -- Group J
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('Argentina', 'ARG', '🇦🇷', 'J', v_pool_id),
    ('Argelia', 'ALG', '🇩🇿', 'J', v_pool_id),
    ('Austria', 'AUT', '🇦🇹', 'J', v_pool_id),
    ('Jordania', 'JOR', '🇯🇴', 'J', v_pool_id);

  -- Group K
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('Portugal', 'POR', '🇵🇹', 'K', v_pool_id),
    ('RD Congo', 'COD', '🇨🇩', 'K', v_pool_id),
    ('Uzbekistán', 'UZB', '🇺🇿', 'K', v_pool_id),
    ('Colombia', 'COL', '🇨🇴', 'K', v_pool_id);

  -- Group L
  INSERT INTO teams (name, code, flag_emoji, group_letter, pool_id) VALUES
    ('Inglaterra', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'L', v_pool_id),
    ('Croacia', 'CRO', '🇭🇷', 'L', v_pool_id),
    ('Ghana', 'GHA', '🇬🇭', 'L', v_pool_id),
    ('Panamá', 'PAN', '🇵🇦', 'L', v_pool_id);

  -- ============================================================
  -- STEP 3: Group stage matches (72)
  -- Times in UTC
  -- ============================================================

  -- Match day 1
  INSERT INTO matches (pool_id, stage, group_letter, match_number, home_team, away_team, kickoff)
  VALUES
    -- June 11
    (v_pool_id, 'GROUP', 'A', 1,
      (SELECT id FROM teams WHERE code='MEX' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='RSA' AND pool_id=v_pool_id),
      '2026-06-11T19:00:00Z'),
    -- June 12
    (v_pool_id, 'GROUP', 'A', 2,
      (SELECT id FROM teams WHERE code='KOR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='CZE' AND pool_id=v_pool_id),
      '2026-06-12T08:00:00Z'),
    (v_pool_id, 'GROUP', 'B', 3,
      (SELECT id FROM teams WHERE code='CAN' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='BIH' AND pool_id=v_pool_id),
      '2026-06-12T01:00:00Z'),
    -- June 13
    (v_pool_id, 'GROUP', 'D', 4,
      (SELECT id FROM teams WHERE code='USA' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='PAR' AND pool_id=v_pool_id),
      '2026-06-13T07:00:00Z'),
    (v_pool_id, 'GROUP', 'B', 5,
      (SELECT id FROM teams WHERE code='QAT' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='SUI' AND pool_id=v_pool_id),
      '2026-06-13T01:00:00Z'),
    (v_pool_id, 'GROUP', 'C', 6,
      (SELECT id FROM teams WHERE code='BRA' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='MAR' AND pool_id=v_pool_id),
      '2026-06-13T04:00:00Z'),
    -- June 14
    (v_pool_id, 'GROUP', 'C', 7,
      (SELECT id FROM teams WHERE code='HTI' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='SCO' AND pool_id=v_pool_id),
      '2026-06-14T07:00:00Z'),
    (v_pool_id, 'GROUP', 'D', 8,
      (SELECT id FROM teams WHERE code='AUS' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='TUR' AND pool_id=v_pool_id),
      '2026-06-14T10:00:00Z'),
    (v_pool_id, 'GROUP', 'E', 9,
      (SELECT id FROM teams WHERE code='GER' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='CUW' AND pool_id=v_pool_id),
      '2026-06-14T23:00:00Z'),
    -- June 15
    (v_pool_id, 'GROUP', 'F', 10,
      (SELECT id FROM teams WHERE code='NED' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='JPN' AND pool_id=v_pool_id),
      '2026-06-15T02:00:00Z'),
    (v_pool_id, 'GROUP', 'E', 11,
      (SELECT id FROM teams WHERE code='CIV' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='ECU' AND pool_id=v_pool_id),
      '2026-06-15T05:00:00Z'),
    (v_pool_id, 'GROUP', 'F', 12,
      (SELECT id FROM teams WHERE code='SWE' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='TUN' AND pool_id=v_pool_id),
      '2026-06-15T08:00:00Z'),
    (v_pool_id, 'GROUP', 'H', 13,
      (SELECT id FROM teams WHERE code='ESP' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='CPV' AND pool_id=v_pool_id),
      '2026-06-15T22:00:00Z'),
    -- June 16
    (v_pool_id, 'GROUP', 'G', 14,
      (SELECT id FROM teams WHERE code='BEL' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='EGY' AND pool_id=v_pool_id),
      '2026-06-16T01:00:00Z'),
    (v_pool_id, 'GROUP', 'H', 15,
      (SELECT id FROM teams WHERE code='KSA' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='URU' AND pool_id=v_pool_id),
      '2026-06-16T04:00:00Z'),
    (v_pool_id, 'GROUP', 'G', 16,
      (SELECT id FROM teams WHERE code='IRN' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='NZL' AND pool_id=v_pool_id),
      '2026-06-16T07:00:00Z'),
    (v_pool_id, 'GROUP', 'I', 17,
      (SELECT id FROM teams WHERE code='FRA' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='SEN' AND pool_id=v_pool_id),
      '2026-06-16T01:00:00Z'),
    -- June 17
    (v_pool_id, 'GROUP', 'I', 18,
      (SELECT id FROM teams WHERE code='IRQ' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='NOR' AND pool_id=v_pool_id),
      '2026-06-17T04:00:00Z'),
    (v_pool_id, 'GROUP', 'J', 19,
      (SELECT id FROM teams WHERE code='ARG' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='ALG' AND pool_id=v_pool_id),
      '2026-06-17T07:00:00Z'),
    (v_pool_id, 'GROUP', 'J', 20,
      (SELECT id FROM teams WHERE code='AUT' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='JOR' AND pool_id=v_pool_id),
      '2026-06-17T10:00:00Z'),
    (v_pool_id, 'GROUP', 'K', 21,
      (SELECT id FROM teams WHERE code='POR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='COD' AND pool_id=v_pool_id),
      '2026-06-17T23:00:00Z'),
    -- June 18
    (v_pool_id, 'GROUP', 'L', 22,
      (SELECT id FROM teams WHERE code='ENG' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='CRO' AND pool_id=v_pool_id),
      '2026-06-18T02:00:00Z'),
    (v_pool_id, 'GROUP', 'L', 23,
      (SELECT id FROM teams WHERE code='GHA' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='PAN' AND pool_id=v_pool_id),
      '2026-06-18T05:00:00Z'),
    (v_pool_id, 'GROUP', 'K', 24,
      (SELECT id FROM teams WHERE code='UZB' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='COL' AND pool_id=v_pool_id),
      '2026-06-18T08:00:00Z'),

  -- Match day 2
    (v_pool_id, 'GROUP', 'A', 25,
      (SELECT id FROM teams WHERE code='CZE' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='RSA' AND pool_id=v_pool_id),
      '2026-06-18T22:00:00Z'),
    -- June 19
    (v_pool_id, 'GROUP', 'B', 26,
      (SELECT id FROM teams WHERE code='SUI' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='BIH' AND pool_id=v_pool_id),
      '2026-06-19T01:00:00Z'),
    (v_pool_id, 'GROUP', 'B', 27,
      (SELECT id FROM teams WHERE code='CAN' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='QAT' AND pool_id=v_pool_id),
      '2026-06-19T04:00:00Z'),
    (v_pool_id, 'GROUP', 'A', 28,
      (SELECT id FROM teams WHERE code='MEX' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='KOR' AND pool_id=v_pool_id),
      '2026-06-19T07:00:00Z'),
    -- June 20
    (v_pool_id, 'GROUP', 'D', 29,
      (SELECT id FROM teams WHERE code='USA' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='AUS' AND pool_id=v_pool_id),
      '2026-06-20T01:00:00Z'),
    (v_pool_id, 'GROUP', 'C', 30,
      (SELECT id FROM teams WHERE code='SCO' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='MAR' AND pool_id=v_pool_id),
      '2026-06-20T04:00:00Z'),
    (v_pool_id, 'GROUP', 'C', 31,
      (SELECT id FROM teams WHERE code='BRA' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='HTI' AND pool_id=v_pool_id),
      '2026-06-20T06:30:00Z'),
    (v_pool_id, 'GROUP', 'D', 32,
      (SELECT id FROM teams WHERE code='TUR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='PAR' AND pool_id=v_pool_id),
      '2026-06-20T09:00:00Z'),
    (v_pool_id, 'GROUP', 'F', 33,
      (SELECT id FROM teams WHERE code='NED' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='SWE' AND pool_id=v_pool_id),
      '2026-06-20T23:00:00Z'),
    -- June 21
    (v_pool_id, 'GROUP', 'E', 34,
      (SELECT id FROM teams WHERE code='GER' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='CIV' AND pool_id=v_pool_id),
      '2026-06-21T02:00:00Z'),
    (v_pool_id, 'GROUP', 'E', 35,
      (SELECT id FROM teams WHERE code='ECU' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='CUW' AND pool_id=v_pool_id),
      '2026-06-21T06:00:00Z'),
    (v_pool_id, 'GROUP', 'F', 36,
      (SELECT id FROM teams WHERE code='TUN' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='JPN' AND pool_id=v_pool_id),
      '2026-06-21T10:00:00Z'),
    (v_pool_id, 'GROUP', 'H', 37,
      (SELECT id FROM teams WHERE code='ESP' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='KSA' AND pool_id=v_pool_id),
      '2026-06-21T22:00:00Z'),
    -- June 22
    (v_pool_id, 'GROUP', 'G', 38,
      (SELECT id FROM teams WHERE code='BEL' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='IRN' AND pool_id=v_pool_id),
      '2026-06-22T01:00:00Z'),
    (v_pool_id, 'GROUP', 'H', 39,
      (SELECT id FROM teams WHERE code='URU' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='CPV' AND pool_id=v_pool_id),
      '2026-06-22T04:00:00Z'),
    (v_pool_id, 'GROUP', 'G', 40,
      (SELECT id FROM teams WHERE code='NZL' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='EGY' AND pool_id=v_pool_id),
      '2026-06-22T07:00:00Z'),
    (v_pool_id, 'GROUP', 'J', 41,
      (SELECT id FROM teams WHERE code='ARG' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='AUT' AND pool_id=v_pool_id),
      '2026-06-22T23:00:00Z'),
    -- June 23
    (v_pool_id, 'GROUP', 'I', 42,
      (SELECT id FROM teams WHERE code='FRA' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='IRQ' AND pool_id=v_pool_id),
      '2026-06-23T03:00:00Z'),
    (v_pool_id, 'GROUP', 'I', 43,
      (SELECT id FROM teams WHERE code='NOR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='SEN' AND pool_id=v_pool_id),
      '2026-06-23T06:00:00Z'),
    (v_pool_id, 'GROUP', 'J', 44,
      (SELECT id FROM teams WHERE code='JOR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='ALG' AND pool_id=v_pool_id),
      '2026-06-23T09:00:00Z'),
    (v_pool_id, 'GROUP', 'K', 45,
      (SELECT id FROM teams WHERE code='POR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='UZB' AND pool_id=v_pool_id),
      '2026-06-23T23:00:00Z'),
    -- June 24
    (v_pool_id, 'GROUP', 'L', 46,
      (SELECT id FROM teams WHERE code='ENG' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='GHA' AND pool_id=v_pool_id),
      '2026-06-24T02:00:00Z'),
    (v_pool_id, 'GROUP', 'L', 47,
      (SELECT id FROM teams WHERE code='PAN' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='CRO' AND pool_id=v_pool_id),
      '2026-06-24T05:00:00Z'),
    (v_pool_id, 'GROUP', 'K', 48,
      (SELECT id FROM teams WHERE code='COL' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='COD' AND pool_id=v_pool_id),
      '2026-06-24T08:00:00Z'),

  -- Match day 3 (simultaneous kickoffs per group)
    (v_pool_id, 'GROUP', 'B', 49,
      (SELECT id FROM teams WHERE code='SUI' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='CAN' AND pool_id=v_pool_id),
      '2026-06-24T01:00:00Z'),
    (v_pool_id, 'GROUP', 'B', 50,
      (SELECT id FROM teams WHERE code='BIH' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='QAT' AND pool_id=v_pool_id),
      '2026-06-24T01:00:00Z'),
    (v_pool_id, 'GROUP', 'C', 51,
      (SELECT id FROM teams WHERE code='MAR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='HTI' AND pool_id=v_pool_id),
      '2026-06-24T04:00:00Z'),
    (v_pool_id, 'GROUP', 'C', 52,
      (SELECT id FROM teams WHERE code='SCO' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='BRA' AND pool_id=v_pool_id),
      '2026-06-24T04:00:00Z'),
    -- June 25
    (v_pool_id, 'GROUP', 'A', 53,
      (SELECT id FROM teams WHERE code='RSA' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='KOR' AND pool_id=v_pool_id),
      '2026-06-25T07:00:00Z'),
    (v_pool_id, 'GROUP', 'A', 54,
      (SELECT id FROM teams WHERE code='CZE' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='MEX' AND pool_id=v_pool_id),
      '2026-06-25T07:00:00Z'),
    (v_pool_id, 'GROUP', 'E', 55,
      (SELECT id FROM teams WHERE code='CUW' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='CIV' AND pool_id=v_pool_id),
      '2026-06-25T02:00:00Z'),
    (v_pool_id, 'GROUP', 'E', 56,
      (SELECT id FROM teams WHERE code='ECU' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='GER' AND pool_id=v_pool_id),
      '2026-06-25T02:00:00Z'),
    -- June 26
    (v_pool_id, 'GROUP', 'F', 57,
      (SELECT id FROM teams WHERE code='TUN' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='NED' AND pool_id=v_pool_id),
      '2026-06-26T05:00:00Z'),
    (v_pool_id, 'GROUP', 'F', 58,
      (SELECT id FROM teams WHERE code='JPN' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='SWE' AND pool_id=v_pool_id),
      '2026-06-26T05:00:00Z'),
    (v_pool_id, 'GROUP', 'D', 59,
      (SELECT id FROM teams WHERE code='TUR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='USA' AND pool_id=v_pool_id),
      '2026-06-26T08:00:00Z'),
    (v_pool_id, 'GROUP', 'D', 60,
      (SELECT id FROM teams WHERE code='PAR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='AUS' AND pool_id=v_pool_id),
      '2026-06-26T08:00:00Z'),
    (v_pool_id, 'GROUP', 'I', 61,
      (SELECT id FROM teams WHERE code='NOR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='FRA' AND pool_id=v_pool_id),
      '2026-06-26T01:00:00Z'),
    (v_pool_id, 'GROUP', 'I', 62,
      (SELECT id FROM teams WHERE code='SEN' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='IRQ' AND pool_id=v_pool_id),
      '2026-06-26T01:00:00Z'),
    -- June 27
    (v_pool_id, 'GROUP', 'H', 63,
      (SELECT id FROM teams WHERE code='CPV' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='KSA' AND pool_id=v_pool_id),
      '2026-06-27T06:00:00Z'),
    (v_pool_id, 'GROUP', 'H', 64,
      (SELECT id FROM teams WHERE code='URU' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='ESP' AND pool_id=v_pool_id),
      '2026-06-27T06:00:00Z'),
    (v_pool_id, 'GROUP', 'G', 65,
      (SELECT id FROM teams WHERE code='NZL' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='BEL' AND pool_id=v_pool_id),
      '2026-06-27T09:00:00Z'),
    (v_pool_id, 'GROUP', 'G', 66,
      (SELECT id FROM teams WHERE code='EGY' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='IRN' AND pool_id=v_pool_id),
      '2026-06-27T09:00:00Z'),
    (v_pool_id, 'GROUP', 'L', 67,
      (SELECT id FROM teams WHERE code='PAN' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='ENG' AND pool_id=v_pool_id),
      '2026-06-27T03:00:00Z'),
    (v_pool_id, 'GROUP', 'L', 68,
      (SELECT id FROM teams WHERE code='CRO' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='GHA' AND pool_id=v_pool_id),
      '2026-06-27T03:00:00Z'),
    -- June 28
    (v_pool_id, 'GROUP', 'K', 69,
      (SELECT id FROM teams WHERE code='COL' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='POR' AND pool_id=v_pool_id),
      '2026-06-28T05:30:00Z'),
    (v_pool_id, 'GROUP', 'K', 70,
      (SELECT id FROM teams WHERE code='COD' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='UZB' AND pool_id=v_pool_id),
      '2026-06-28T05:30:00Z'),
    (v_pool_id, 'GROUP', 'J', 71,
      (SELECT id FROM teams WHERE code='ALG' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='AUT' AND pool_id=v_pool_id),
      '2026-06-28T08:00:00Z'),
    (v_pool_id, 'GROUP', 'J', 72,
      (SELECT id FROM teams WHERE code='JOR' AND pool_id=v_pool_id),
      (SELECT id FROM teams WHERE code='ARG' AND pool_id=v_pool_id),
      '2026-06-28T08:00:00Z');

END $$;
