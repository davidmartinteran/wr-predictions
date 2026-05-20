# ADR-002 — Anonimato vía RLS, no vía aplicación

**Estado:** Aceptado
**Fecha:** 2026-05-20
**Contexto:** Fase 1 — Architecture & Design

---

## Contexto

La promesa central del producto es que **nadie ve pronósticos ajenos antes del 11 de junio**. Si esto falla, el producto pierde todo su sentido (los amigos copian y la porra deja de ser divertida). Es el requisito de mayor impacto del sistema.

## Decisión

Garantizar el anonimato **a nivel base de datos** con Row-Level Security de Postgres/Supabase. El frontend nunca es la fuente de verdad de seguridad.

## Alternativas evaluadas

| Opción | Pros | Contras |
|---|---|---|
| **RLS en Postgres** | Imposible bypassear desde frontend; una sola fuente de verdad; auditarle con SQL directo; Supabase lo soporta nativamente | Debugging más difícil (errores silenciosos: query devuelve 0 rows sin error); requiere entender bien `auth.uid()` y las políticas |
| **Middleware en API** | Más familiar para devs frontend; errores más explícitos | Depende de que TODAS las rutas estén protegidas; un endpoint olvidado = filtración; más superficie de ataque |
| **Frontend-only (hide/show)** | Rápido de implementar | Cero seguridad real; cualquier herramienta de red (DevTools, Postman) expone los datos |

## Implementación

### Política de lectura de predicciones

```sql
CREATE POLICY "predictions_read" ON predictions_match FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_match.pool_id
    AND p.status IN ('REVEALED', 'LIVE', 'CLOSED')
  )
);
```

Misma política para `predictions_group`, `predictions_knockout`, `predictions_extra`.

### Política de escritura de predicciones

```sql
CREATE POLICY "predictions_write" ON predictions_match FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_match.pool_id
    AND p.status IN ('OPEN')
  )
);

CREATE POLICY "predictions_update" ON predictions_match FOR UPDATE USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM pools p
    WHERE p.id = predictions_match.pool_id
    AND p.status IN ('OPEN')
  )
);
```

### Estados del pool y permisos

| Estado | Leer propios | Leer ajenos | Escribir |
|---|---|---|---|
| CONFIG | - | - | - |
| OPEN | Si | No | Si |
| LOCKED | Si | No | No |
| REVEALED | Si | Si | No |
| LIVE | Si | Si | No |
| CLOSED | Si | Si | No |

## Test obligatorio (E2E)

```
DADO que el pool está en estado OPEN
Y el usuario A tiene predicciones guardadas
CUANDO el usuario B hace una request REST a Supabase con su JWT
  pidiendo predicciones WHERE user_id = A.id
ENTONCES la respuesta es un array vacío (RLS filtra silenciosamente)
```

Este test ataca la API REST de Supabase directamente (no pasa por el frontend) para verificar que RLS funciona independientemente de la UI.

## Consecuencias

- El frontend NUNCA recibe datos de predicciones ajenas antes del reveal. No hay "esconderlos en la UI" — simplemente no existen en la respuesta.
- Los errores de RLS son silenciosos (devuelven 0 rows). Esto es bueno para seguridad pero requiere cuidado al debuggear.
- Cualquier nueva tabla de predicciones necesita su propia política RLS antes de exponerse.
