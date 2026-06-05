-- Allow users to delete their own predictions when the pool is open
CREATE POLICY "predictions_match_delete" ON predictions_match FOR DELETE USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_match.pool_id
    AND p.status = 'OPEN'
  )
);

CREATE POLICY "predictions_knockout_delete" ON predictions_knockout FOR DELETE USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_knockout.pool_id
    AND p.status = 'OPEN'
  )
);

CREATE POLICY "predictions_extra_delete" ON predictions_extra FOR DELETE USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_extra.pool_id
    AND p.status = 'OPEN'
  )
);
