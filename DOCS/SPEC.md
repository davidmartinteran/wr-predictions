# SPEC — Porra Mundial 2026

**Fase 0 — Discovery & Spec**
**Versión:** 0.1.0 — Borrador para revisión

---

## 1. Visión y objetivos

### 1.1 Visión
Sustituir el Excel/grupo de WhatsApp por una PWA donde el grupo mete pronósticos anónimos del Mundial 2026, los revela el día del kick-off, y sigue una clasificación en vivo durante el torneo.

### 1.2 Objetivos medibles del MVP
- 100% de los amigos invitados pueden meter pronóstico antes del 11 de junio.
- 0 pronósticos visibles a otros usuarios antes del deadline (verificado por test E2E).
- Clasificación actualizada en <5 segundos tras meter un resultado oficial.
- Funcional en móvil iOS y Android instalada como PWA.

### 1.3 No-objetivos
Ver "Fuera de scope" en `PROJECT_PROFILE.md`.

---

## 2. Personas

| Persona | Descripción | Necesidades |
|---|---|---|
| **Participante** | Amigo del grupo, ~20-50 personas | Meter pronóstico fácil desde el móvil, ver clasificación, sentir que es justo |
| **Admin** | David (única persona con rol admin en MVP) | Crear pool, configurar scoring, meter resultados oficiales, invitar amigos |

---

## 3. Modelo conceptual

### 3.1 Entidades principales

```
Pool (1) ──── (N) Participation ──── (1) User
  │                  │
  │                  └── (N) Prediction
  │
  ├── (N) Group (A, B, C, ..., L)  → 12 grupos del Mundial 2026
  ├── (N) Match                      → ~104 partidos
  ├── (N) Team                       → 48 selecciones
  ├── (1) ScoringRules               → JSON configurable
  └── (1) RevealConfig               → fecha deadline + flag revealed
```

### 3.2 Tipos de pronóstico

El MVP cubre **5 categorías** alineadas con la porra histórica del grupo:

| Categoría | Qué se predice | Cuándo se evalúa | Editable hasta |
|---|---|---|---|
| **`group_match_result`** | Marcador exacto de cada partido de grupos | Tras finalizar el partido | Inicio del partido específico (regla simple en MVP: 11/jun 18:00 corta todo) |
| **`group_qualifiers`** | Los 2 equipos que pasan de cada grupo (1º y 2º) | Tras finalizar la fase de grupos | 11/jun 18:00 |
| **`knockout_qualifiers`** | Quién pasa cada eliminatoria (16avos → final) | Tras cada ronda | 11/jun 18:00 |
| **`top_scorer`** | Máximo goleador del torneo | Final del torneo | 11/jun 18:00 |
| **`best_player`** | Mejor jugador del torneo | Final del torneo | 11/jun 18:00 |

> **Decisión de scope MVP:** Marcadores de eliminatorias = fuera. Solo se predice "quién pasa". Si sobra tiempo en Fase 4, se añade.

> **Decisión sobre deadline:** En MVP, deadline único = **11 de junio de 2026 18:00 hora peninsular española** (inicio del partido inaugural). Tras ese momento, ningún pronóstico se puede editar y todos se revelan. Simplifica vs. deadline por partido y se ajusta al espíritu de "antes del Mundial".

---

## 4. Sistema de puntuación (parametrizable)

### 4.1 Principio
Los puntos viven en una tabla `scoring_rules` editable por el admin **hasta el deadline**. Tras el deadline, **se congelan** (auditable). Todo cálculo de scoring lee de esa fuente única.

### 4.2 Puntuación propuesta (a acordar con el grupo)

Esta es una propuesta de partida; ajustadla entre todos antes del deadline:

| Concepto | Acierto | Puntos sugeridos |
|---|---|---|
| Partido de grupos — signo (1/X/2) | Acierta resultado pero no marcador | 1 |
| Partido de grupos — marcador exacto | Acierta marcador exacto | 3 |
| Clasificado de grupo (cualquier posición) | Acierta que un equipo pasa, sin orden | 2 |
| 1º de grupo exacto | Acierta posición exacta | 3 |
| Pasa de octavos | Acierta equipo en cuartos | 4 |
| Pasa de cuartos | Acierta equipo en semis | 8 |
| Pasa de semis | Acierta finalista | 16 |
| Campeón | Acierta ganador del Mundial | 40 |
| Máximo goleador | Acierta exacto | 15 |
| Mejor jugador | Acierta exacto | 10 |

**Total máximo teórico aproximado:** ~600 pts. Ratio campeón/total ≈ 7%, alto pero no absurdo.

### 4.3 Reglas de desempate (tiebreakers, en orden)
1. Más marcadores exactos acertados.
2. Más clasificados de grupo correctos.
3. Mejor pronóstico del partido inaugural.
4. Sorteo entre los implicados.

### 4.4 Formato de almacenamiento (JSON)

```json
{
  "version": 1,
  "frozen_at": null,
  "rules": {
    "group_match_sign": 1,
    "group_match_exact": 3,
    "group_qualifier_any": 2,
    "group_qualifier_first": 3,
    "knockout_r16_to_qf": 4,
    "knockout_qf_to_sf": 8,
    "knockout_sf_to_final": 16,
    "champion": 40,
    "top_scorer": 15,
    "best_player": 10
  }
}
```

---

## 5. Flujo de anonimato (crítico)

### 5.1 Estados del pool

```
[CONFIG] → [OPEN] → [LOCKED] → [REVEALED] → [LIVE] → [CLOSED]
```

- **CONFIG:** Admin configura grupos, partidos, scoring. Nadie más entra.
- **OPEN:** Usuarios invitados pueden meter/editar pronósticos. **Nadie ve pronósticos ajenos.**
- **LOCKED:** Tras deadline (11/jun 18:00). Pronósticos congelados, aún no revelados (ventana de gracia de minutos).
- **REVEALED:** Pronósticos visibles para todos. Empieza la clasificación.
- **LIVE:** Admin va metiendo resultados, clasificación se actualiza.
- **CLOSED:** Mundial terminado, ranking final, premios.

### 5.2 Implementación del anonimato

**No depende del frontend.** Se garantiza a nivel base de datos con Row-Level Security:

```sql
-- Política de lectura de pronósticos
CREATE POLICY "predictions_read" ON predictions
FOR SELECT USING (
  user_id = auth.uid()  -- Siempre puedo leer los míos
  OR
  EXISTS (              -- Puedo leer ajenos solo si el pool está revelado
    SELECT 1 FROM pools p
    WHERE p.id = predictions.pool_id
    AND p.status IN ('REVEALED', 'LIVE', 'CLOSED')
  )
);
```

**Test E2E obligatorio:** un usuario A no puede leer pronósticos del usuario B mientras el pool esté en OPEN/LOCKED, ni siquiera saltándose el frontend (test atacando directamente la API REST de Supabase con su JWT).

### 5.3 Transición a REVEALED

Cron job (Supabase Edge Function o GitHub Action) que el 11/jun a las 18:00 ejecute:
```sql
UPDATE pools SET status = 'REVEALED' WHERE status = 'LOCKED' AND deadline <= now();
```

Backup manual: el admin puede forzar el revelado desde el panel.

---

## 6. Casos de uso (user stories)

### US-01 — Invitar amigos al pool
**Como** admin, **quiero** generar invitaciones por email **para que** mis amigos accedan al pool.
- Admin introduce lista de emails.
- Sistema envía Magic Link a cada email.
- Al hacer clic, se crea User + Participation en el pool.

### US-02 — Meter pronóstico de fase de grupos
**Como** participante, **quiero** introducir mi marcador para cada partido de grupos **para que** se evalúe cuando se jueguen.
- Lista de los 72 partidos de grupos agrupados por grupo (A, B, C...).
- Cada partido tiene inputs de goles local/visitante.
- Auto-save al cambiar valor (con debounce).
- Validación: ambos goles entre 0 y 15.

### US-03 — Meter clasificados de grupo
**Como** participante, **quiero** elegir 1º y 2º de cada grupo **para que** se evalúe al terminar la fase de grupos.
- Para cada grupo, dos dropdowns (1º y 2º) con los 4 equipos del grupo.
- Validación: no puede elegir el mismo equipo en 1º y 2º del mismo grupo.

### US-04 — Meter eliminatorias
**Como** participante, **quiero** rellenar el bracket completo **para que** se evalúe ronda a ronda.
- Vista de bracket: octavos → cuartos → semis → final.
- Los enfrentamientos de octavos se calculan automáticamente desde las predicciones de US-03 del usuario.
- En cada cruce el usuario elige ganador.
- Campeón se deduce del último cruce.

### US-05 — Meter goleador y mejor jugador
**Como** participante, **quiero** elegir un jugador para "máximo goleador" y otro para "mejor jugador" **para que** se evalúe al final.
- Dos selectores con lista de jugadores convocados.
- Búsqueda por nombre.
- *Nota MVP:* lista de jugadores cargada manualmente desde fuente pública (FIFA squad lists). Si retrasa, MVP permite texto libre y se valida manualmente.

### US-06 — Editar pronóstico
**Como** participante, **quiero** modificar mi pronóstico hasta el deadline **para que** pueda ajustar a última hora.
- Cualquier cambio antes del deadline pisa el anterior.
- Tras deadline: read-only.

### US-07 — Ver mi pronóstico tras el reveal
**Como** participante, **quiero** ver mis predicciones tras el reveal **para que** pueda recordar qué dije.
- Vista de "mi porra" en read-only.

### US-08 — Ver clasificación
**Como** participante, **quiero** ver el ranking de puntos del grupo **para que** sepa cómo voy.
- Tabla ordenada por puntos desc.
- Filtro por categoría: total / grupos / eliminatorias / extras.
- Mi fila destacada.
- Actualización en realtime al meter resultados.

### US-09 — Comparar mi porra con la de otro
**Como** participante, **quiero** ver la porra de otro participante tras el reveal **para que** pueda comentar con ellos.
- Vista lado a lado de dos porras.
- Diff marcado visualmente.

### US-10 — Admin: meter resultado oficial
**Como** admin, **quiero** introducir el marcador real de un partido **para que** se recalculen los puntos.
- Vista de partidos pendientes, mobile-first.
- Input rápido de marcador.
- Trigger automático que recalcula scores afectados.

### US-11 — Admin: configurar scoring
**Como** admin, **quiero** editar la tabla de puntuación **para que** refleje lo acordado con el grupo.
- Solo editable mientras pool está en CONFIG u OPEN.
- Cambios se congelan automáticamente al pasar a LOCKED.

---

## 7. Esquema de base de datos (resumen)

```sql
-- Auth lo gestiona Supabase
-- Tablas principales:

pools (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL,  -- CONFIG|OPEN|LOCKED|REVEALED|LIVE|CLOSED
  deadline timestamptz NOT NULL,
  scoring_rules jsonb NOT NULL,
  scoring_frozen_at timestamptz
);

participations (
  user_id uuid REFERENCES auth.users,
  pool_id uuid REFERENCES pools,
  display_name text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id)
);

teams (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL,  -- ESP, BRA...
  group_letter text NOT NULL  -- A..L
);

matches (
  id uuid PRIMARY KEY,
  pool_id uuid REFERENCES pools,
  home_team uuid REFERENCES teams,
  away_team uuid REFERENCES teams,
  stage text NOT NULL,  -- GROUP|R32|R16|QF|SF|F
  kickoff timestamptz NOT NULL,
  home_score int,
  away_score int,
  finished boolean DEFAULT false
);

predictions_match (
  id uuid PRIMARY KEY,
  user_id uuid,
  pool_id uuid,
  match_id uuid,
  home_score int,
  away_score int,
  updated_at timestamptz,
  UNIQUE (user_id, match_id)
);

predictions_group (
  user_id uuid,
  pool_id uuid,
  group_letter text,
  first_team uuid REFERENCES teams,
  second_team uuid REFERENCES teams,
  PRIMARY KEY (user_id, pool_id, group_letter)
);

predictions_knockout (
  user_id uuid,
  pool_id uuid,
  stage text,         -- R16|QF|SF|F|CHAMPION
  slot int,           -- posición en el bracket
  team_id uuid REFERENCES teams,
  PRIMARY KEY (user_id, pool_id, stage, slot)
);

predictions_extra (
  user_id uuid,
  pool_id uuid,
  kind text,          -- TOP_SCORER|BEST_PLAYER
  value text,         -- nombre del jugador (MVP: texto libre)
  PRIMARY KEY (user_id, pool_id, kind)
);

scores (  -- materialized; recalculado tras cada resultado
  user_id uuid,
  pool_id uuid,
  category text,      -- GROUP_MATCHES|GROUP_QUALIFIERS|KNOCKOUT|EXTRAS|TOTAL
  points int,
  PRIMARY KEY (user_id, pool_id, category)
);
```

---

## 8. Criterios de aceptación globales

- [ ] Test E2E: usuario A no puede leer predicciones de usuario B mientras pool en OPEN.
- [ ] Test unitario: módulo de scoring devuelve los puntos correctos para los 10+ casos de la tabla §4.2.
- [ ] Test integración: al meter un resultado, los scores de todos los usuarios se actualizan.
- [ ] Test E2E: al cambiar el reloj a 11/jun 18:01, los pronósticos pasan a read-only y se revelan.
- [ ] PWA instalable verificado en iOS Safari y Chrome Android.
- [ ] Lighthouse performance > 80 en móvil 4G.

---

## 9. Preguntas abiertas (para resolver con el grupo de amigos)

1. **Puntuación final** — ¿Confirmáis la tabla de §4.2 o ajustamos?
2. **¿Pronosticáis marcadores de eliminatorias o solo "quién pasa"?** — MVP solo "quién pasa", confirmar.
3. **¿Premio único al campeón o varios premios por categorías?** — Afecta a UX de clasificación pero no a la app en sí.
4. **Lista de jugadores para goleador/mejor jugador** — ¿Aceptable texto libre en MVP o necesitamos lista cerrada?
5. **¿Hay porra de "último de grupo" o algo similar histórico que estoy olvidando?**
6. **Empates entre dos personas en el ranking final** — ¿Validar reglas de desempate de §4.3?
