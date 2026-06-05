-- Add BEST_YOUNG_PLAYER and BEST_GOALKEEPER to predictions_extra kind check
ALTER TABLE predictions_extra
  DROP CONSTRAINT predictions_extra_kind_check;

ALTER TABLE predictions_extra
  ADD CONSTRAINT predictions_extra_kind_check
  CHECK (kind IN (
    'TOP_SCORER',
    'BEST_PLAYER',
    'BEST_YOUNG_PLAYER',
    'BEST_GOALKEEPER',
    'TOP_ASSISTER',
    'MOST_GOALS_TEAM',
    'MOST_CONCEDED_TEAM',
    'RUNNER_UP',
    'THIRD_PLACE',
    'SPAIN_ELIM_ROUND',
    'SPAIN_ELIM_RIVAL'
  ));
