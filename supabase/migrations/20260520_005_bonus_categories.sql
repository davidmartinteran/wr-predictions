-- Migration: add bonus prediction categories
-- New kinds: FIRST_SCORER_ESP (per match), TOP_ASSISTER, MOST_GOALS_TEAM,
--            MOST_CONCEDED_TEAM, RUNNER_UP, THIRD_PLACE, SPAIN_ELIM_ROUND, SPAIN_ELIM_RIVAL

-- 1. Expand predictions_extra to accept new kinds
ALTER TABLE predictions_extra
  DROP CONSTRAINT predictions_extra_kind_check;

ALTER TABLE predictions_extra
  ADD CONSTRAINT predictions_extra_kind_check
  CHECK (kind IN (
    'TOP_SCORER',
    'BEST_PLAYER',
    'TOP_ASSISTER',
    'MOST_GOALS_TEAM',
    'MOST_CONCEDED_TEAM',
    'RUNNER_UP',
    'THIRD_PLACE',
    'SPAIN_ELIM_ROUND',
    'SPAIN_ELIM_RIVAL'
  ));

-- 2. New table for first-goalscorer predictions (one per Spain match)
CREATE TABLE predictions_first_scorer (
  user_id     uuid REFERENCES auth.users,
  pool_id     uuid REFERENCES pools,
  match_id    uuid REFERENCES matches NOT NULL,
  player_name text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id, match_id)
);

-- 3. Add SPAIN_BONUS and FIRST_SCORER_ESP to scores categories
ALTER TABLE scores
  DROP CONSTRAINT scores_category_check;

ALTER TABLE scores
  ADD CONSTRAINT scores_category_check
  CHECK (category IN (
    'GROUP_MATCHES',
    'GROUP_QUALIFIERS',
    'KNOCKOUT',
    'EXTRAS',
    'FIRST_SCORER_ESP',
    'TOTAL'
  ));

-- 4. Index for first-scorer lookups
CREATE INDEX idx_predictions_first_scorer_match
  ON predictions_first_scorer (match_id);

CREATE INDEX idx_predictions_first_scorer_user_pool
  ON predictions_first_scorer (user_id, pool_id);

-- 5. Update default scoring_rules to include new bonus categories
ALTER TABLE pools
  ALTER COLUMN scoring_rules SET DEFAULT '{
    "version": 2,
    "rules": {
      "group_match_sign": 1,
      "group_match_exact": 3,
      "group_qualifier_any": 2,
      "group_qualifier_first": 3,
      "knockout_r16": 4,
      "knockout_qf": 8,
      "knockout_sf": 16,
      "champion": 40,
      "runner_up": 20,
      "third_place": 15,
      "top_scorer": 15,
      "best_player": 10,
      "top_assister": 15,
      "most_goals_team": 10,
      "most_conceded_team": 10,
      "spain_elim_round": 15,
      "spain_elim_rival": 10,
      "first_scorer_esp": 10
    }
  }'::jsonb;
