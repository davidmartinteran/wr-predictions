-- Actual results for extra categories (admin enters these)
CREATE TABLE pool_results_extra (
  pool_id uuid NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  kind text NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  PRIMARY KEY (pool_id, kind)
);

-- RLS: anyone in the pool can read, only admin can write
ALTER TABLE pool_results_extra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pool_results_extra_read" ON pool_results_extra
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM participations p
      WHERE p.pool_id = pool_results_extra.pool_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "pool_results_extra_write" ON pool_results_extra
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM participations p
      WHERE p.pool_id = pool_results_extra.pool_id
      AND p.user_id = auth.uid()
      AND p.is_admin = true
    )
  );
