-- Migration: trigger to freeze scoring_rules when pool transitions to LOCKED

CREATE OR REPLACE FUNCTION freeze_scoring_on_lock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'LOCKED' AND OLD.status = 'OPEN' THEN
    NEW.scoring_frozen_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pool_lock
  BEFORE UPDATE OF status ON pools
  FOR EACH ROW
  EXECUTE FUNCTION freeze_scoring_on_lock();
