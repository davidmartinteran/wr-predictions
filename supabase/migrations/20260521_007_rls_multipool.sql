-- Migration 007: RLS multipool + trigger auto-participation admin

-- 1. tournaments: lectura pública para authenticated (datos del torneo no son secretos)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tournaments_read" ON tournaments FOR SELECT
  TO authenticated USING (true);

-- 2. teams / matches / goal_events: lectura pública para authenticated.
--    El resultado de un partido es información pública del torneo;
--    el anonimato (ADR-002) se sigue garantizando en predictions_* y scores.
CREATE POLICY "teams_read" ON teams FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "matches_read" ON matches FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "goal_events_read" ON goal_events FOR SELECT
  TO authenticated USING (true);

-- 3. pools: cualquier authenticated puede crear; created_by debe ser él mismo
DROP POLICY IF EXISTS "pools_insert" ON pools;
CREATE POLICY "pools_insert" ON pools FOR INSERT
  TO authenticated WITH CHECK (created_by = auth.uid());

-- 4. participations: el propio usuario puede insertar su participación
--    (usado por el flujo de join). Se mantiene update propio.
CREATE POLICY "participations_insert" ON participations FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- 5. Función SECURITY DEFINER para buscar una porra por su invite_code
--    sin necesidad de saltarse RLS desde el cliente.
CREATE OR REPLACE FUNCTION public.pool_lookup_by_invite_code(p_code text)
RETURNS TABLE (id uuid, name text, deadline timestamptz, status text, tournament_id uuid, participant_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.name, p.deadline, p.status, p.tournament_id,
    (SELECT count(*) FROM participations pa WHERE pa.pool_id = p.id)
  FROM pools p
  WHERE p.invite_code = p_code;
$$;

REVOKE ALL ON FUNCTION public.pool_lookup_by_invite_code(text) FROM public;
GRANT EXECUTE ON FUNCTION public.pool_lookup_by_invite_code(text) TO authenticated;

-- 6. Trigger: al crear un pool, el creador queda automáticamente
--    como participante con is_admin=true. Display_name = local-part del email.
CREATE OR REPLACE FUNCTION public.on_pool_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_display text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.created_by;
  v_display := COALESCE(split_part(v_email, '@', 1), 'Anónimo');

  INSERT INTO participations (user_id, pool_id, display_name, is_admin)
  VALUES (NEW.created_by, NEW.id, v_display, true)
  ON CONFLICT (user_id, pool_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_pool_created ON pools;
CREATE TRIGGER trg_on_pool_created
  AFTER INSERT ON pools
  FOR EACH ROW
  EXECUTE FUNCTION public.on_pool_created();
