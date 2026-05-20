-- Migration: RLS policies (ADR-002)

-- Enable RLS on all tables
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions_match ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions_knockout ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- pools
CREATE POLICY "pools_read" ON pools FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM participations p
    WHERE p.pool_id = pools.id
    AND p.user_id = auth.uid()
  )
);
CREATE POLICY "pools_insert" ON pools FOR INSERT WITH CHECK (
  created_by = auth.uid()
);
CREATE POLICY "pools_update" ON pools FOR UPDATE USING (
  created_by = auth.uid()
);

-- teams
CREATE POLICY "teams_read" ON teams FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM participations p
    WHERE p.pool_id = teams.pool_id
    AND p.user_id = auth.uid()
  )
);

-- matches
CREATE POLICY "matches_read" ON matches FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM participations p
    WHERE p.pool_id = matches.pool_id
    AND p.user_id = auth.uid()
  )
);

-- goal_events
CREATE POLICY "goal_events_read" ON goal_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM participations pa
    JOIN pools po ON po.id = pa.pool_id
    WHERE pa.pool_id = goal_events.pool_id
    AND pa.user_id = auth.uid()
    AND po.status IN ('REVEALED', 'LIVE', 'CLOSED')
  )
);

-- participations
CREATE POLICY "participations_read" ON participations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM participations p2
    WHERE p2.pool_id = participations.pool_id
    AND p2.user_id = auth.uid()
  )
);
CREATE POLICY "participations_update" ON participations FOR UPDATE USING (
  user_id = auth.uid()
);

-- predictions_match
CREATE POLICY "predictions_match_read" ON predictions_match FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_match.pool_id
    AND p.status IN ('REVEALED', 'LIVE', 'CLOSED')
  )
);
CREATE POLICY "predictions_match_insert" ON predictions_match FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_match.pool_id
    AND p.status = 'OPEN'
  )
);
CREATE POLICY "predictions_match_update" ON predictions_match FOR UPDATE USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_match.pool_id
    AND p.status = 'OPEN'
  )
);

-- predictions_group
CREATE POLICY "predictions_group_read" ON predictions_group FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_group.pool_id
    AND p.status IN ('REVEALED', 'LIVE', 'CLOSED')
  )
);
CREATE POLICY "predictions_group_insert" ON predictions_group FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_group.pool_id
    AND p.status = 'OPEN'
  )
);
CREATE POLICY "predictions_group_update" ON predictions_group FOR UPDATE USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_group.pool_id
    AND p.status = 'OPEN'
  )
);

-- predictions_knockout
CREATE POLICY "predictions_knockout_read" ON predictions_knockout FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_knockout.pool_id
    AND p.status IN ('REVEALED', 'LIVE', 'CLOSED')
  )
);
CREATE POLICY "predictions_knockout_insert" ON predictions_knockout FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_knockout.pool_id
    AND p.status = 'OPEN'
  )
);
CREATE POLICY "predictions_knockout_update" ON predictions_knockout FOR UPDATE USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_knockout.pool_id
    AND p.status = 'OPEN'
  )
);

-- predictions_extra
CREATE POLICY "predictions_extra_read" ON predictions_extra FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_extra.pool_id
    AND p.status IN ('REVEALED', 'LIVE', 'CLOSED')
  )
);
CREATE POLICY "predictions_extra_insert" ON predictions_extra FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_extra.pool_id
    AND p.status = 'OPEN'
  )
);
CREATE POLICY "predictions_extra_update" ON predictions_extra FOR UPDATE USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_extra.pool_id
    AND p.status = 'OPEN'
  )
);

-- scores
CREATE POLICY "scores_read" ON scores FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM participations pa
    JOIN pools po ON po.id = pa.pool_id
    WHERE pa.pool_id = scores.pool_id
    AND pa.user_id = auth.uid()
    AND po.status IN ('REVEALED', 'LIVE', 'CLOSED')
  )
);
