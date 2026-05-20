# ARCHITECTURE — Porra Mundial 2026

**Fase 1 — Architecture & Design**
**Versión:** 0.1.0

---

## 1. Vista general

```
┌─────────────────────────────────────────────┐
│              Vercel (Hosting)                │
│  ┌───────────────────────────────────────┐  │
│  │     Next.js 15 (App Router + RSC)     │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │  Pages  │ │  Server  │ │ Static │ │  │
│  │  │  (RSC)  │ │ Actions  │ │ Assets │ │  │
│  │  └────┬────┘ └────┬─────┘ └────────┘ │  │
│  └───────┼───────────┼──────────────────-┘  │
└──────────┼───────────┼──────────────────────┘
           │           │
           ▼           ▼
┌─────────────────────────────────────────────┐
│            Supabase (BaaS)                  │
│  ┌──────────┐ ┌──────┐ ┌────────────────┐  │
│  │ Postgres │ │ Auth │ │   Realtime     │  │
│  │  + RLS   │ │(ML)  │ │ (WebSockets)   │  │
│  └──────────┘ └──────┘ └────────────────┘  │
│  ┌──────────────────────────────────────┐   │
│  │  Edge Functions                      │   │
│  │  - cron: revelado (11/jun 18:00)     │   │
│  │  - cron: poll-results (cada 30 min)  │──────> API-Football (RapidAPI)
│  └──────────────────────────────────────┘   │     100 req/día free tier
└─────────────────────────────────────────────┘
```

## 2. Stack técnico (decisiones en ADRs)

| Capa | Tecnología | ADR |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript | Implícita (ADR-005) |
| UI | Tailwind CSS 4 + shadcn/ui | Implícita (ADR-006) |
| Estado servidor | React Server Components + Server Actions | Implícita (ADR-007) |
| Estado cliente | Mínimo: React `useState`/`useOptimistic` para UI local | - |
| PWA | Manifest manual + Service Worker mínimo | Implícita (ADR-008) |
| Backend | Supabase (Postgres + Auth + Realtime + RLS) | ADR-001 |
| Auth | Supabase Auth (Magic Link) | ADR-004 |
| Seguridad | Row-Level Security en Postgres | ADR-002 |
| Datos del Mundial | API-Football (polling) + override manual | ADR-003 |
| Hosting | Vercel (free tier) | Implícita (ADR-009) |
| Testing | Vitest (unit) + Playwright (E2E) | Implícita (ADR-010) |

## 3. Estructura del proyecto

```
porra-wc/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Route group: login, callback
│   │   │   ├── login/
│   │   │   └── auth/callback/
│   │   ├── (main)/             # Route group: app autenticada
│   │   │   ├── predictions/    # Meter/editar pronósticos
│   │   │   ├── leaderboard/    # Clasificación
│   │   │   ├── compare/        # Comparar porras (post-reveal)
│   │   │   └── profile/        # Perfil mínimo
│   │   ├── admin/              # Panel admin (resultados, config)
│   │   │   ├── results/        # Meter resultados
│   │   │   ├── scoring/        # Configurar puntos
│   │   │   └── invites/        # Invitar amigos
│   │   ├── layout.tsx          # Root layout + providers
│   │   ├── page.tsx            # Landing / redirect
│   │   └── manifest.ts         # PWA manifest
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── predictions/        # Componentes de pronósticos
│   │   ├── leaderboard/        # Componentes de clasificación
│   │   └── admin/              # Componentes de admin
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client (RSC/Actions)
│   │   │   ├── middleware.ts   # Auth middleware
│   │   │   └── types.ts        # Generated DB types
│   │   ├── scoring/
│   │   │   ├── engine.ts       # Motor de puntuación (TDD estricto)
│   │   │   ├── types.ts        # Tipos del scoring
│   │   │   └── engine.test.ts  # Tests del motor
│   │   └── utils.ts
│   ├── hooks/                  # Custom hooks
│   └── types/                  # Shared types
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── functions/
│   │   ├── poll-results/       # Cron: polling API-Football
│   │   └── reveal-pool/        # Cron: transición a REVEALED
│   ├── seed.sql                # Datos iniciales (equipos, grupos, partidos)
│   └── config.toml             # Config de Supabase CLI
├── public/
│   ├── icons/                  # PWA icons
│   └── sw.js                   # Service Worker
├── tests/
│   ├── e2e/                    # Playwright E2E
│   └── integration/            # Integration tests
├── DOCS/                       # Documentación del proyecto
└── .claude/                    # Config Claude Code
```

## 4. Patrones clave

### 4.1 Server Components por defecto

Toda página es RSC por defecto. Solo se marca `'use client'` cuando hay interactividad (inputs de pronósticos, realtime).

### 4.2 Server Actions para mutaciones

No hay API routes custom. Todas las mutaciones (guardar pronóstico, meter resultado) van por Server Actions con validación Zod.

```typescript
// Patrón: Server Action con validación
'use server'
async function savePrediction(formData: FormData) {
  const parsed = predictionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }
  
  const supabase = await createServerClient()
  const { error } = await supabase.from('predictions_match').upsert(parsed.data)
  if (error) return { error: error.message }
  
  revalidatePath('/predictions')
  return { success: true }
}
```

### 4.3 Realtime para clasificación

Supabase Realtime escucha cambios en la tabla `scores`. Cuando el admin mete un resultado y se recalculan puntos, todos los clientes conectados ven la clasificación actualizada.

```typescript
// Patrón: Realtime subscription en client component
supabase
  .channel('scores')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scores' }, 
    (payload) => setScores(prev => updateScore(prev, payload.new))
  )
  .subscribe()
```

### 4.4 Scoring engine puro (TDD estricto)

El motor de puntuación es una función pura: recibe predicciones + resultados + reglas → devuelve puntos. Sin side effects, sin BD, sin estado. Testeable al 100%.

```typescript
// lib/scoring/engine.ts — función pura
function calculateScore(
  predictions: UserPredictions,
  results: OfficialResults,
  rules: ScoringRules
): ScoreBreakdown { ... }
```

### 4.5 Polling de resultados (API-Football)

Una Edge Function se ejecuta cada 30 min en días de partido (vía pg_cron o Supabase Cron). Flujo:

```
Edge Function: poll-results (cada 30 min en días de partido)
│
├── GET api-football.com/v3/fixtures?date=today&league=1&season=2026
│   → Lista de partidos del día con estado
│
├── Para cada partido finalizado no registrado:
│   ├── GET /fixtures/{id} → marcador + eventos (goles)
│   ├── UPDATE matches SET home_score, away_score, finished = true, source = 'API'
│   │   WHERE api_fixture_id = {id} AND source != 'MANUAL'
│   └── INSERT INTO goal_events → goleadores del partido
│
└── GET /players/topscorers?league=1&season=2026
    → Referencia para verificación (no se usa directamente)
```

La Edge Function usa `service_role` key (bypassa RLS). Los resultados con `source = 'MANUAL'` no se sobrescriben.

Coste estimado: ~6 req/día en fase de grupos, muy por debajo del free tier de 100 req/día.

### 4.6 Recálculo de scores

Trigger: cuando un partido pasa a `finished = true`, una database function recalcula los scores de todos los usuarios para las categorías afectadas y actualiza la tabla `scores`.

Implementación: Postgres function + trigger (no Edge Function) para evitar latencia y cold start.

```sql
CREATE OR REPLACE FUNCTION recalculate_scores_after_result()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_pool_scores(NEW.pool_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_match_finished
  AFTER UPDATE OF finished ON matches
  FOR EACH ROW
  WHEN (NEW.finished = true AND OLD.finished = false)
  EXECUTE FUNCTION recalculate_scores_after_result();
```

### 4.7 Transición de estado del pool

El estado del pool (`CONFIG → OPEN → LOCKED → REVEALED → LIVE → CLOSED`) se gestiona con:

- **OPEN:** Admin lo activa manualmente tras configurar todo.
- **LOCKED:** Cron job (Supabase pg_cron o Edge Function) que a las 18:00 del 11/jun ejecuta `UPDATE pools SET status = 'LOCKED'`.
- **REVEALED:** Inmediatamente después de LOCKED (o con delay de minutos), mismo cron cambia a `REVEALED`.
- **LIVE:** Admin lo activa cuando empieza a meter resultados.
- **CLOSED:** Admin lo activa al finalizar el torneo.

Backup: el admin puede forzar cualquier transición desde el panel.

## 5. Seguridad

### 5.1 Capas

1. **Auth:** Supabase Auth (Magic Link). JWT en cada request.
2. **Authorization:** RLS en cada tabla. No hay forma de acceder a datos sin pasar por RLS.
3. **Admin:** Verificado por `auth.jwt() ->> 'role' = 'admin'` en políticas RLS.
4. **Validación:** Zod en Server Actions para inputs del usuario.

### 5.2 Superficie de ataque

| Vector | Mitigación |
|---|---|
| Leer pronósticos ajenos pre-reveal | RLS (ADR-002) + test E2E |
| Modificar pronósticos post-deadline | RLS: solo INSERT/UPDATE si pool OPEN |
| Inyección SQL | Supabase client usa prepared statements |
| XSS | React escapa por defecto; CSP headers en Vercel |
| CSRF en Server Actions | Next.js valida origin por defecto |

## 6. Observabilidad (mínima viable, Tier B)

- **Logs:** Supabase Dashboard (queries, auth events, errors).
- **Analytics:** Vercel Analytics (free, automatic).
- **Errores:** `console.error` en Server Actions + Vercel logs. Sin Sentry en MVP.
- **Monitoring:** Vercel speed insights para Core Web Vitals.

## 7. Decisiones implícitas (ADR-005 a ADR-010)

Documentadas aquí en lugar de ADRs formales (Tier B):

- **Next.js App Router** sobre Pages Router: estándar en 2026, RSC nativo, Server Actions.
- **Tailwind + shadcn/ui** sobre CSS Modules: velocidad de scaffolding, componentes accesibles out-of-the-box.
- **RSC + Server Actions** sobre React Query: menos código cliente, menos estado que gestionar, alineado con App Router.
- **Manifest manual** sobre next-pwa: next-pwa añade Workbox completo que no necesitamos. Un manifest.json + service worker mínimo (cache de shell) basta.
- **Vercel** sobre Netlify/Cloudflare: mejor DX con Next.js, free tier suficiente, zero-config deploys.
- **Vitest + Playwright** sobre Jest + Cypress: Vitest es más rápido y compatible con ESM; Playwright es el estándar para E2E en 2026.
