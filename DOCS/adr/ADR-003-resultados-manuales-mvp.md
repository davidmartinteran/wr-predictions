# ADR-003 — Resultados oficiales vía API-Football + override manual

**Estado:** Sustituido (2026-06-11) — ver revisión abajo
**Fecha:** 2026-05-20
**Contexto:** Fase 1 — Architecture & Design

> **Revisión 2026-06-11:** API-Football free tier no cubre la temporada 2026 y
> OpenFootball se actualiza a mano ~1×/día (inválido para live). Implementado
> con la **API no oficial de ESPN** (`site.api.espn.com/.../soccer/fifa.world/scoreboard`):
> gratis, sin key, estado + marcador en vivo. Edge Function `poll-results`
> (cron pg_cron cada 5 min, solo actúa en ventana de partido) actualiza
> `matches.status/home_score/away_score/finished` y recalcula `scores` (RESULTS).
> El override manual del admin se mantiene tal como describe este ADR:
> `matches.source='MANUAL'` nunca es sobrescrito por el polling.
> Mitigación del riesgo de API no oficial: si ESPN falla, el admin mete
> resultados a mano y el badge EN VIVO degrada a heurística de reloj.

---

## Contexto

El sistema necesita resultados oficiales de los partidos para calcular puntuaciones, incluyendo goleadores de cada partido (necesario para evaluar `top_scorer`). El admin no quiere meter resultados a mano durante un mes.

## Decisión

**API-Football (vía RapidAPI)** como fuente automática de resultados y goleadores. Polling post-partido o cada hora (no realtime). El admin conserva la capacidad de **override manual** para corregir errores o meter datos que la API no cubra (mejor jugador del torneo).

## Alternativas evaluadas

| Opción | Pros | Contras |
|---|---|---|
| **API-Football (RapidAPI)** | Automático; datos ricos (marcadores, goleadores por partido, eventos); 100 req/día gratis; la más popular | Dependencia externa; latencia 10-30min post-partido; requiere cuenta RapidAPI |
| **Football-Data.org** | Free tier generoso (10 req/min); sin RapidAPI | No tiene goleadores por partido (solo resultados); insuficiente para evaluar `top_scorer` |
| **Manual** | 0 dependencias; 100% fiable | ~3.5h de trabajo manual en un mes; el admin no quiere hacerlo |
| **Híbrido API + manual** | Lo mejor de ambos mundos | Es lo que elegimos: API como fuente primaria, manual como fallback |

## Diseño del polling

### Estrategia: post-partido, no realtime

No necesitamos datos al segundo. Basta con actualizar tras finalizar cada partido o en ventanas horarias. Con ~4 partidos/día en fase de grupos:

```
Polling diario estimado:
- 1 req: fixtures del día (¿qué partidos hay?)
- 4 req: resultado + eventos de cada partido finalizado
- 1 req: tabla de goleadores actualizada
= ~6 req/día en fase de grupos (de 100 disponibles)
```

Incluso con margen de retries y días con más partidos, estamos muy por debajo del límite de 100 req/día.

### Implementación

```
Supabase Edge Function (cron cada 30 min durante días de partido)
    │
    ├── GET /fixtures?date=YYYY-MM-DD&league=1&season=2026
    │   → ¿Hay partidos finalizados sin actualizar?
    │
    ├── GET /fixtures/{id}
    │   → Marcador final + eventos (goles)
    │
    ├── UPDATE matches SET home_score, away_score, finished = true
    │   → Trigger recalculate_scores()
    │
    └── GET /players/topscorers?league=1&season=2026
        → Actualizar tabla de goleadores acumulados
```

### Scheduling

| Momento | Frecuencia de polling |
|---|---|
| Día sin partidos | 0 requests (cron desactivado o skip rápido) |
| Día con partidos, antes del primer kickoff | 1 req (verificar fixtures) |
| Día con partidos, ventana de partidos (±2h del kickoff) | Cada 30 min |
| Post-último partido del día + 2h | Última pasada, luego stop |

### Datos que extraemos de la API

| Dato | Endpoint | Para qué |
|---|---|---|
| Marcador final | `/fixtures/{id}` | `predictions_match` scoring |
| Goles por jugador | `/fixtures/{id}` → events | Acumular goleadores |
| Tabla de goleadores | `/players/topscorers` | `predictions_extra` (TOP_SCORER) |
| Clasificación de grupos | Calculada desde resultados | `predictions_group` scoring |

### Dato que NO cubre la API

| Dato | Solución |
|---|---|
| **Mejor jugador del torneo** | El admin lo mete manualmente al final (1 dato, 1 vez). No hay API fiable para esto hasta que FIFA lo anuncia. |

## Override manual

El admin puede siempre:
1. **Corregir un resultado** que la API trajo mal (edge case).
2. **Forzar un resultado** si la API tarda demasiado o está caída.
3. **Meter el "mejor jugador"** al final del torneo.

La UI de admin muestra el origen del dato: `[API]` o `[MANUAL]`. Los overrides manuales no se sobrescriben en el siguiente polling.

## Tradeoffs aceptados

- **Dependencia externa:** Si API-Football se cae durante el Mundial, el admin puede meter resultados a mano (el panel sigue existiendo). Es un fallback, no el flujo principal.
- **Latencia de 10-30min:** Los resultados no aparecen al instante post-partido. Aceptable — los amigos no esperan actualización al segundo; si quieren, miran el partido.
- **Coste:** Free tier de RapidAPI (100 req/día). Si se necesita más, el plan básico es ~$10/mes. Dentro del presupuesto.
- **Mejor jugador:** No automatizable. El admin lo mete 1 vez al final del torneo.

## Consecuencias

- Se necesita una **Edge Function** (cron) que haga polling a API-Football.
- La tabla `matches` sigue teniendo `home_score`, `away_score`, `finished` pero ahora los escribe la Edge Function (o el admin como override).
- Se añade una tabla `match_goals` o campo en matches para trackear goleadores por partido (input para `top_scorer`).
- RLS de `matches`: la Edge Function usa service_role key (bypassa RLS); el admin escribe vía su JWT con política de admin.
- El recálculo de scores se dispara igual: trigger en `UPDATE matches SET finished = true`.
- `SUPABASE_API_FOOTBALL_KEY` se guarda como secret en Supabase.
