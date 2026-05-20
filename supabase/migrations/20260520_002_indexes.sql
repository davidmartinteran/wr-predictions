-- Migration: indexes for performance

CREATE INDEX idx_goal_events_match ON goal_events(match_id);
CREATE INDEX idx_goal_events_player ON goal_events(pool_id, player_name);
CREATE INDEX idx_predictions_match_user ON predictions_match(user_id, pool_id);
CREATE INDEX idx_predictions_group_user ON predictions_group(user_id, pool_id);
CREATE INDEX idx_predictions_knockout_user ON predictions_knockout(user_id, pool_id);
CREATE INDEX idx_scores_pool_category ON scores(pool_id, category, points DESC);
CREATE INDEX idx_matches_pool_stage ON matches(pool_id, stage);
