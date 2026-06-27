-- Migration 022: ocultar la sección de extras en una porra.
-- Para porras donde los extras no tienen sentido (p.ej. la de solo fase final
-- de la familia): se oculta la pestaña/sección de Extras y no puntúan.
-- NULL/false = porra normal (extras visibles, comportamiento previo).

ALTER TABLE pools
  ADD COLUMN IF NOT EXISTS hide_extras boolean NOT NULL DEFAULT false;
