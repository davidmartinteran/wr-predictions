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
| **Admin** | David (única persona con rol admin en MVP) | Crear pool, configurar scoring, override de resultados si falla la API, invitar amigos |

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
| **`group_match_result`** | Marcador exacto de cada partido de grupos | Tras finalizar el partido | 11/jun 18:00 |
| **`group_qualifiers`** | Los 2 equipos que pasan de cada grupo (1º y 2º) | Tras finalizar la fase de grupos | 11/jun 18:00 |
| **`knockout_qualifiers`** | Quién pasa cada eliminatoria (16avos → final) | Tras cada ronda | 11/jun 18:00 |
| **`top_scorer`** | Máximo goleador del torneo (Bota de Oro) | Final del torneo | 11/jun 18:00 |
| **`best_player`** | Mejor jugador del torneo (Balón de Oro FIFA) | Final del torneo | 11/jun 18:00 |
| **`top_assister`** | Máximo asistente del torneo | Final del torneo | 11/jun 18:00 |
| **`runner_up`** | Subcampeón (finalista perdedor) | Tras la final | 11/jun 18:00 |
| **`third_place`** | Tercer puesto (ganador partido 3er/4º puesto) | Tras partido de 3er puesto | 11/jun 18:00 |
| **`most_goals_team`** | Equipo que más goles marca en todo el torneo | Final del torneo | 11/jun 18:00 |
| **`most_conceded_team`** | Equipo que más goles recibe en todo el torneo | Final del torneo | 11/jun 18:00 |
| **`spain_elim_round`** | En qué ronda se elimina España (o "CHAMPION") | Cuando España sea eliminada o gane | 11/jun 18:00 |
| **`spain_elim_rival`** | Contra quién pierde España (o "-" si campeona) | Cuando España sea eliminada o gane | 11/jun 18:00 |
| **`first_scorer_esp`** | Primer goleador de cada partido de España | Tras cada partido de España | 11/jun 18:00 |

> **Decisión de scope MVP:** Marcadores de eliminatorias = fuera. Solo se predice "quién pasa". Si sobra tiempo en Fase 4, se añade.

> **Decisión sobre deadline:** En MVP, deadline único = **11 de junio de 2026 18:00 hora peninsular española** (inicio del partido inaugural). Tras ese momento, ningún pronóstico se puede editar y todos se revelan. Simplifica vs. deadline por partido y se ajusta al espíritu de "antes del Mundial".

> **Fuente de datos bonus:** `top_scorer`, `top_assister`, `most_goals_team`, `most_conceded_team` se obtienen automáticamente de API-Football. `first_scorer_esp` se obtiene del endpoint `/fixtures/{id}/events`. `best_player` es el premio FIFA Golden Ball, se mete manual. `runner_up` y `third_place` se deducen del bracket. `spain_elim_round` y `spain_elim_rival` se deducen de los resultados de eliminatorias.

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
| Subcampeón | Acierta finalista perdedor | 20 |
| Tercer puesto | Acierta ganador del 3er/4º puesto | 15 |
| Máximo goleador (Bota de Oro) | Acierta exacto | 15 |
| Mejor jugador (Balón de Oro) | Acierta exacto | 10 |
| Máximo asistente | Acierta exacto | 15 |
| Equipo más goleador | Equipo con más goles en el torneo | 10 |
| Equipo más goleado | Equipo con más goles encajados | 10 |
| Ronda eliminación España | Acierta en qué ronda cae (o CHAMPION) | 15 |
| Rival eliminación España | Acierta contra quién pierde España | 10 |
| Primer goleador España (por partido) | Acierta el 1er goleador de cada partido de ESP | 10 |

**Total máximo teórico aproximado:** ~800 pts. Los bonus individuales/equipo suman ~120 pts extra, los de primer goleador de España ~70 pts (7 partidos si llega a la final).

### 4.3 Reglas de desempate (tiebreakers, en orden)
1. Más marcadores exactos acertados.
2. Más clasificados de grupo correctos.
3. Mejor pronóstico del partido inaugural.
4. Sorteo entre los implicados.

### 4.4 Formato de almacenamiento (JSON)

```json
{
  "version": 2,
  "frozen_at": null,
  "rules": {
    "group_match_sign": 1,
    "group_match_exact": 3,
    "group_qualifier_any": 2,
    "group_qualifier_first": 3,
    "knockout_r16": 4,
    "knockout_qf": 8,
    "knockout_sf": 16,
    "champion": 40,
    "runner_up": 20,
    "third_place": 15,
    "top_scorer": 15,
    "best_player": 10,
    "top_assister": 15,
    "most_goals_team": 10,
    "most_conceded_team": 10,
    "spain_elim_round": 15,
    "spain_elim_rival": 10,
    "first_scorer_esp": 10
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

### US-03 — Clasificados de grupo (derivados)
**Como** participante, mis clasificados de grupo **se calculan automáticamente** a partir de mis marcadores predichos en US-02.
- El sistema calcula la tabla de cada grupo usando los marcadores del usuario (puntos, gol diferencia, goles a favor).
- 1º y 2º de cada grupo se derivan de esa tabla — no hay input separado.
- Estos clasificados alimentan automáticamente el bracket de eliminatorias (US-04).
- Nota: la tabla `predictions_group` almacena el resultado derivado para consulta rápida, no input directo del usuario.

### US-04 — Meter eliminatorias
**Como** participante, **quiero** rellenar el bracket completo **para que** se evalúe ronda a ronda.
- Vista de bracket: octavos → cuartos → semis → final.
- Los enfrentamientos de octavos se calculan automáticamente desde las predicciones de US-03 del usuario.
- En cada cruce el usuario elige ganador.
- Campeón se deduce del último cruce.

### US-05 — Meter goleador, mejor jugador y asistente
**Como** participante, **quiero** elegir jugadores para "máximo goleador", "mejor jugador" y "máximo asistente" **para que** se evalúe al final.
- Tres selectores con autocomplete sobre lista de jugadores convocados.
- Búsqueda por nombre con datos cargados desde JSON estático (~500 jugadores convocados). No requiere API.
- Incluido en la sección "Extras" de predicciones junto con las categorías de equipo y España.

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

### US-09 — Ver porra de otro participante
**Como** participante, **quiero** ver la porra de otro participante tras el reveal **para que** pueda comentar con ellos.
- Tap en un jugador en el leaderboard → abre su porra completa en vista individual.
- Misma estructura que "Mi Porra" (resumen compacto read-only) pero con datos del otro.
- Solo disponible cuando el pool está en REVEALED/LIVE/CLOSED (RLS lo garantiza).
- *Post-launch:* vista lado a lado comparando tu porra con la de otro (diff visual).

### US-10 — Resultados automáticos vía API
**Como** sistema, **quiero** obtener resultados de partidos automáticamente de API-Football **para que** se recalculen los puntos sin intervención manual.
- Fuente principal: API-Football (RapidAPI). Polling cada 30 min en días de partido via Edge Function cron.
- Datos obtenidos: marcadores finales, goleadores por partido, tabla de goleadores acumulados.
- `top_scorer`, `top_assister`, `most_goals_team`, `most_conceded_team`, `first_scorer_esp` se obtienen de la API.
- `best_player` (Balón de Oro FIFA) se mete manualmente al final del torneo (único dato manual).
- `runner_up`, `third_place` y `champion` se deducen automáticamente de los resultados del bracket — no se meten manualmente.
- Override manual: el admin puede corregir un resultado si la API trae datos incorrectos o tarda. Los overrides manuales no se sobrescriben en el siguiente polling.
- Trigger automático recalcula scores cuando un partido pasa a `finished = true`.

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
  kind text,          -- TOP_SCORER|BEST_PLAYER|TOP_ASSISTER|MOST_GOALS_TEAM|
                      -- MOST_CONCEDED_TEAM|RUNNER_UP|THIRD_PLACE|
                      -- SPAIN_ELIM_ROUND|SPAIN_ELIM_RIVAL
  value text,         -- nombre del jugador/equipo/ronda (texto libre)
  PRIMARY KEY (user_id, pool_id, kind)
);

predictions_first_scorer (
  user_id uuid,
  pool_id uuid,
  match_id uuid REFERENCES matches, -- solo partidos de España
  player_name text NOT NULL,
  PRIMARY KEY (user_id, pool_id, match_id)
);

scores (  -- materialized; recalculado tras cada resultado
  user_id uuid,
  pool_id uuid,
  category text,      -- GROUP_MATCHES|GROUP_QUALIFIERS|KNOCKOUT|EXTRAS|FIRST_SCORER_ESP|TOTAL
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
