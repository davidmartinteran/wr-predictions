# DATA MODEL — Porra Mundial 2026

**Fase 1 — Architecture & Design**
**Versión:** 0.1.0

---

## 1. Diagrama de relaciones

```
auth.users (Supabase Auth)
    │
    ├──< participations >── pools
    │                         │
    │                         ├──< matches (72 grupo + 32 eliminatorias)
    │                         │      │
    │                         │      ├── home_team ──> teams
    │                         │      └── away_team ──> teams
    │                         │
    │                         └──< teams (48 selecciones)
    │
    ├──< predictions_match    (user × match → marcador)
    ├──< predictions_group    (user × grupo → 1º y 2º)
    ├──< predictions_knockout (user × stage × slot → equipo)
    ├──< predictions_extra    (user × kind → jugador)
    │
    └──< scores               (user × pool × category → puntos)
```

## 2. Tablas

### 2.1 pools

La tabla central. Un pool = una porra completa para un torneo.

```sql
CREATE TABLE pools (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  status      text NOT NULL DEFAULT 'CONFIG'
              CHECK (status IN ('CONFIG','OPEN','LOCKED','REVEALED','LIVE','CLOSED')),
  deadline    timestamptz NOT NULL,
  scoring_rules jsonb NOT NULL DEFAULT '{
    "version": 1,
    "rules": {
      "group_match_sign": 1,
      "group_match_exact": 3,
      "group_qualifier_any": 2,
      "group_qualifier_first": 3,
      "knockout_r16": 4,
      "knockout_qf": 8,
      "knockout_sf": 16,
      "champion": 40,
      "top_scorer": 15,
      "best_player": 10
    }
  }'::jsonb,
  scoring_frozen_at timestamptz,
  created_by  uuid REFERENCES auth.users NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
```

**Transiciones de estado válidas:**
```
CONFIG → OPEN → LOCKED → REVEALED → LIVE → CLOSED
```

**Regla:** `scoring_rules` se congela (se fija `scoring_frozen_at`) al pasar a LOCKED. Desde ese momento es inmutable.

### 2.2 teams

Las 48 selecciones del Mundial 2026.

```sql
CREATE TABLE teams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,           -- 'España'
  code         text NOT NULL UNIQUE,    -- 'ESP'
  flag_emoji   text,                    -- '🇪🇸'
  group_letter text NOT NULL            -- 'A'..'L'
              CHECK (group_letter ~ '^[A-L]$'),
  pool_id      uuid REFERENCES pools NOT NULL
);
```

**Nota:** 12 grupos de 4 equipos = 48 equipos. El Mundial 2026 tiene formato de 48 selecciones.

### 2.3 matches

Todos los partidos: 72 de fase de grupos + hasta 32 de eliminatorias.

```sql
CREATE TABLE matches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id         uuid REFERENCES pools NOT NULL,
  stage           text NOT NULL
                  CHECK (stage IN ('GROUP','R32','R16','QF','SF','3RD','FINAL')),
  group_letter    text,                    -- Solo para stage = 'GROUP'
  match_number    int NOT NULL,            -- Orden del partido en el torneo
  home_team       uuid REFERENCES teams,   -- NULL en eliminatorias hasta que se sepa
  away_team       uuid REFERENCES teams,
  kickoff         timestamptz NOT NULL,
  home_score      int,                     -- NULL hasta que llegue resultado
  away_score      int,
  finished        boolean NOT NULL DEFAULT false,
  source          text DEFAULT 'PENDING'   -- PENDING | API | MANUAL
                  CHECK (source IN ('PENDING','API','MANUAL')),
  api_fixture_id  int,                     -- ID del partido en API-Football (para polling)
  created_at      timestamptz DEFAULT now()
);
```

**`source`:** Indica el origen del resultado. `API` = vino del polling automático. `MANUAL` = el admin lo metió/corrigió a mano. Los resultados `MANUAL` no se sobrescriben en el siguiente ciclo de polling.

**`api_fixture_id`:** Mapea el partido local con el fixture de API-Football. Se rellena en el seed con los IDs del calendario FIFA.

**Nota sobre eliminatorias:** En MVP, `home_team`/`away_team` de eliminatorias se rellenan automáticamente cuando la API reporta los cruces, o manualmente por el admin. Los enfrentamientos de R32 se calculan desde los resultados de grupo.

**Nota sobre R32 (ronda de 32):** El Mundial 2026 con 48 equipos tiene una ronda de 32avos de final tras la fase de grupos (pasan 32 de 48). El bracket es: R32 → R16 → QF → SF → FINAL. También hay partido por el 3er puesto (3RD).

### 2.3b goal_events

Goles de cada partido. Alimenta el ranking de goleadores para evaluar `top_scorer`.

```sql
CREATE TABLE goal_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    uuid REFERENCES matches NOT NULL,
  pool_id     uuid REFERENCES pools NOT NULL,
  player_name text NOT NULL,             -- Nombre del goleador
  team_id     uuid REFERENCES teams NOT NULL,
  minute      int,                       -- Minuto del gol
  is_own_goal boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_goal_events_match ON goal_events(match_id);
CREATE INDEX idx_goal_events_player ON goal_events(pool_id, player_name);
```

**Uso:** Al evaluar `top_scorer`, se hace `SELECT player_name, COUNT(*) FROM goal_events WHERE NOT is_own_goal GROUP BY player_name ORDER BY count DESC LIMIT 1`. Los autogoles no cuentan.

**Vista materializada (opcional, si el cálculo se hace frecuente):**
```sql
CREATE VIEW top_scorers AS
  SELECT player_name, team_id, pool_id, COUNT(*) as goals
  FROM goal_events
  WHERE NOT is_own_goal
  GROUP BY player_name, team_id, pool_id
  ORDER BY goals DESC;
```

### 2.4 participations

Relación usuario ↔ pool con datos del participante.

```sql
CREATE TABLE participations (
  user_id      uuid REFERENCES auth.users,
  pool_id      uuid REFERENCES pools,
  display_name text NOT NULL,
  is_admin     boolean NOT NULL DEFAULT false,
  joined_at    timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id)
);
```

**Nota:** `is_admin` es redundante con el rol en `auth.users.raw_app_meta_data`, pero tener un flag por pool permite que en el futuro otro usuario administre otro pool distinto.

### 2.5 predictions_match

Pronóstico de marcador exacto por partido.

```sql
CREATE TABLE predictions_match (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  pool_id     uuid REFERENCES pools NOT NULL,
  match_id    uuid REFERENCES matches NOT NULL,
  home_score  int NOT NULL CHECK (home_score BETWEEN 0 AND 15),
  away_score  int NOT NULL CHECK (away_score BETWEEN 0 AND 15),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, match_id)
);
```

### 2.6 predictions_group

Pronóstico de clasificados por grupo (1º y 2º).

```sql
CREATE TABLE predictions_group (
  user_id       uuid REFERENCES auth.users,
  pool_id       uuid REFERENCES pools,
  group_letter  text NOT NULL CHECK (group_letter ~ '^[A-L]$'),
  first_team    uuid REFERENCES teams NOT NULL,
  second_team   uuid REFERENCES teams NOT NULL,
  CHECK (first_team != second_team),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id, group_letter)
);
```

### 2.7 predictions_knockout

Pronóstico de eliminatorias: quién pasa en cada cruce.

```sql
CREATE TABLE predictions_knockout (
  user_id     uuid REFERENCES auth.users,
  pool_id     uuid REFERENCES pools,
  stage       text NOT NULL
              CHECK (stage IN ('R32','R16','QF','SF','FINAL','CHAMPION')),
  slot        int NOT NULL,             -- Posición en el bracket (1..N)
  team_id     uuid REFERENCES teams NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id, stage, slot)
);
```

**Slots por stage:**
- R32: 16 slots (16 ganadores de 32 partidos)
- R16: 8 slots
- QF: 4 slots
- SF: 2 slots
- FINAL: 1 slot (finalista del lado opuesto al SF winner)
- CHAMPION: 1 slot

**Nota MVP:** Los cruces de R32 se derivan automáticamente de las predictions_group del usuario. Ejemplo: si el usuario pone España 1ª del grupo A y México 2ª del grupo B, el cruce de R32 será España vs México (siguiendo el bracket oficial FIFA).

### 2.8 predictions_extra

Goleador y mejor jugador (texto libre en MVP).

```sql
CREATE TABLE predictions_extra (
  user_id     uuid REFERENCES auth.users,
  pool_id     uuid REFERENCES pools,
  kind        text NOT NULL CHECK (kind IN ('TOP_SCORER','BEST_PLAYER')),
  value       text NOT NULL,            -- Nombre del jugador (texto libre en MVP)
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id, kind)
);
```

### 2.9 scores (materializada)

Puntuación calculada. Se recalcula tras cada resultado oficial.

```sql
CREATE TABLE scores (
  user_id     uuid REFERENCES auth.users,
  pool_id     uuid REFERENCES pools,
  category    text NOT NULL
              CHECK (category IN (
                'GROUP_MATCHES','GROUP_QUALIFIERS','KNOCKOUT','EXTRAS','TOTAL'
              )),
  points      int NOT NULL DEFAULT 0,
  exact_hits  int NOT NULL DEFAULT 0,   -- Para tiebreaker §4.3
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pool_id, category)
);
```

**`exact_hits`:** Cuenta marcadores exactos acertados. Es el primer criterio de desempate (SPEC §4.3).

## 3. Row-Level Security (resumen)

Detalle completo en ADR-002. Resumen de políticas por tabla:

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| pools | Participantes del pool | Solo admin | Solo admin (status, scoring) | No |
| teams | Participantes | Solo admin | Solo admin | No |
| matches | Participantes | Solo admin | Admin + Edge Function (service_role) | No |
| goal_events | Participantes si pool REVEALED+ | Admin + Edge Function | Admin + Edge Function | No |
| participations | Participantes del pool | Sistema (via invite) | Solo propio display_name | No |
| predictions_* | Propias siempre; ajenas solo si pool REVEALED+ | Propias si pool OPEN | Propias si pool OPEN | No |
| scores | Participantes si pool REVEALED+ | Sistema (trigger) | Sistema (trigger) | No |

## 4. Funciones SQL críticas

### 4.1 Recálculo de scores

```sql
CREATE OR REPLACE FUNCTION recalculate_pool_scores(p_pool_id uuid)
RETURNS void AS $$
  -- Lógica: para cada usuario en el pool,
  -- calcular puntos por categoría según scoring_rules del pool
  -- y upsert en tabla scores.
  -- Implementación detallada en Fase 3 con TDD.
$$;
```

### 4.2 Congelado de scoring rules

```sql
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
```

## 5. Seed data

El seed incluirá:
- 48 equipos con grupo asignado (fuente: FIFA official draw).
- 72 partidos de fase de grupos con fecha/hora de kickoff.
- Partidos de eliminatorias como placeholders (sin equipos asignados).
- 1 pool configurado para el Mundial 2026.

Los datos del calendario del Mundial 2026 se tomarán de la web oficial de FIFA una vez publicados.

## 6. Índices recomendados

```sql
CREATE INDEX idx_predictions_match_user ON predictions_match(user_id, pool_id);
CREATE INDEX idx_predictions_group_user ON predictions_group(user_id, pool_id);
CREATE INDEX idx_predictions_knockout_user ON predictions_knockout(user_id, pool_id);
CREATE INDEX idx_scores_pool_category ON scores(pool_id, category, points DESC);
CREATE INDEX idx_matches_pool_stage ON matches(pool_id, stage);
```
