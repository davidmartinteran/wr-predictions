-- Migration: create all tables for Porra Mundial 2026
-- Applied via Supabase MCP on 2026-05-20

-- 1. pools
CREATE TABLE pools (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  status      text NOT NULL DEFAULT 'CONFIG'
              CHECK (status IN ('CONFIG','OPEN','LOCKED','REVEALED','LIVE','CLOSED')),
  deadline    timestamptz NOT NULL,
  scoring_rules jsonb NOT NULL DEFAULT '{
    "version": 1,
    "rules": {
      "group_match_sign": 1,
      "group_match_exact": 3,
      "group_qualifier_any": 2,
      "group_qualifier_first": 3,
      "knockout_r16": 4,
      "knockout_qf": 8,
      "knockout_sf": 16,
      "champion": 40,
      "top_scorer": 15,
      "best_player": 10
    }
  }'::jsonb,
  scoring_frozen_at timestamptz,
  created_by  uuid REFERENCES auth.users NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- 2. teams
CREATE TABLE teams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  code         text NOT NULL UNIQUE,
  flag_emoji   text,
  group_letter text NOT NULL
              CHECK (group_letter ~ '^[A-L]$'),
  pool_id      uuid REFERENCES pools NOT NULL
);

-- 3. matches
CREATE TABLE matches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id         uuid REFERENCES pools NOT NULL,
  stage           text NOT NULL
                  CHECK (stage IN ('GROUP','R32','R16','QF','SF','3RD','FINAL')),
  group_letter    text,
  match_number    int NOT NULL,
  home_team       uuid REFERENCES teams,
  away_team       uuid REFERENCES teams,
  kickoff         timestamptz NOT NULL,
  home_score      int,
  away_score      int,
  finished        boolean NOT NULL DEFAULT false,
  source          text DEFAULT 'PENDING'
                  CHECK (source IN ('PENDING','API','MANUAL')),
  api_fixture_id  int,
  created_at      timestamptz DEFAULT now()
);

-- 4. goal_events
CREATE TABLE goal_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    uuid REFERENCES matches NOT NULL,
  pool_id     uuid REFERENCES pools NOT NULL,
  player_name text NOT NULL,
  team_id     uuid REFERENCES teams NOT NULL,
  minute      int,
  is_own_goal boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- 5. participations
CREATE TABLE participations (
  user_id      uuid REFERENCES auth.users,
  pool_id      uuid REFERENCES pools,
  display_name text NOT NULL,
  is_admin     boolean NOT NULL DEFAULT false,
  joined_at    timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id)
);

-- 6. predictions_match
CREATE TABLE predictions_match (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  pool_id     uuid REFERENCES pools NOT NULL,
  match_id    uuid REFERENCES matches NOT NULL,
  home_score  int NOT NULL CHECK (home_score BETWEEN 0 AND 15),
  away_score  int NOT NULL CHECK (away_score BETWEEN 0 AND 15),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, match_id)
);

-- 7. predictions_group
CREATE TABLE predictions_group (
  user_id       uuid REFERENCES auth.users,
  pool_id       uuid REFERENCES pools,
  group_letter  text NOT NULL CHECK (group_letter ~ '^[A-L]$'),
  first_team    uuid REFERENCES teams NOT NULL,
  second_team   uuid REFERENCES teams NOT NULL,
  CHECK (first_team != second_team),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id, group_letter)
);

-- 8. predictions_knockout
CREATE TABLE predictions_knockout (
  user_id     uuid REFERENCES auth.users,
  pool_id     uuid REFERENCES pools,
  stage       text NOT NULL
              CHECK (stage IN ('R32','R16','QF','SF','FINAL','CHAMPION')),
  slot        int NOT NULL,
  team_id     uuid REFERENCES teams NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id, stage, slot)
);

-- 9. predictions_extra
CREATE TABLE predictions_extra (
  user_id     uuid REFERENCES auth.users,
  pool_id     uuid REFERENCES pools,
  kind        text NOT NULL CHECK (kind IN ('TOP_SCORER','BEST_PLAYER')),
  value       text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id, kind)
);

-- 10. scores
CREATE TABLE scores (
  user_id     uuid REFERENCES auth.users,
  pool_id     uuid REFERENCES pools,
  category    text NOT NULL
              CHECK (category IN (
                'GROUP_MATCHES','GROUP_QUALIFIERS','KNOCKOUT','EXTRAS','TOTAL'
              )),
  points      int NOT NULL DEFAULT 0,
  exact_hits  int NOT NULL DEFAULT 0,
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id, category)
);
