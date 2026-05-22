# SESSION_LOG — Porra Mundial 2026

> Contexto táctico (corto plazo). Se rota por sprint/feature.
> Consultar al inicio de cada sesión via `/rehydrate`.

---

## Estado actual del proyecto

**Fase:** 4 — Feature Development
**Tier:** B
**Deadline:** 2026-06-11 18:00 CEST (partido inaugural)

### Infraestructura completada

| Área | Estado | Notas |
|---|---|---|
| Supabase project | Activo | `funcrmqctwjoiovtccbh`, región eu-west-1, Postgres 17 |
| DB Schema | 7 migraciones aplicadas | tournaments + pools (multi-porra), 12 tablas, RLS + trigger join |
| Data seeding | Completo | 48 equipos, 72 partidos de grupos, 1 pool, 1 participación |
| Auth (Magic Link) | Funcional | Login form + server action + callback |
| Scoring engine | Completo + 33 tests | Incluye 8 bonus categories (desde 2026-05-20) |

### Pantallas diseñadas (DOCS/design/)

Ficheros: `screens-mobile.jsx` + `screens-desktop.jsx`, renderizados en `Porra Mundial 2026 - Pantallas.html`
Clasificación: `C:\Users\david\Downloads\PORRA WC\screens-clasificacion.jsx` + `shared.jsx`

| Pantalla | Mobile | Desktop | Implementada |
|---|---|---|---|
| Pronósticos — Fase de grupos | `MobilePronosticos` | `DesktopPronosticos` | ~90% — navegación secciones + responsive |
| Clasificación — Live ranking | `MobileClasificacion` | `DesktopClasificacion` | ~90% — podio + tabla expandible |
| Bracket — Eliminatorias | `MobileBracket` | `DesktopBracket` | No (placeholder con lock) |

**Sin diseño todavía:** Login, extras/bonus, mi porra, admin, comparar porras.

### Features implementadas

| Feature | Ficheros clave | Estado |
|---|---|---|
| Auth Magic Link | `src/app/(auth)/login/` (page, form, actions) | Funcional |
| Layout principal | `src/app/(main)/layout.tsx`, TopBar, BottomNav | Funcional (datos hardcoded en TopBar) |
| Predicciones grupos | `src/app/(main)/predictions/` (page, actions, client) | ~90% — secciones + responsive ok |
| Leaderboard | `src/app/(main)/leaderboard/` (page, client) | ~90% — podio + tabla expandible por categorías |
| Scoring engine | `src/lib/scoring/engine.ts` + `engine.test.ts` | 100% — 33 tests verdes |

### Componentes UI existentes

| Componente | Fichero | Notas |
|---|---|---|
| ScoreInput | `src/components/predictions/score-input.tsx` | tel input, 44x44 mobile / 52x52 xl desktop |
| MatchCard | `src/components/predictions/match-card.tsx` | Card con equipos + inputs (mobile) |
| DesktopMatchCard | `predictions-client.tsx` (inline) | Match card desktop con inputs responsive |
| TeamBadge | `src/components/predictions/team-badge.tsx` | Flag emoji + nombre |
| StandingsStrip | `src/components/predictions/standings-strip.tsx` | Mini-tabla de grupo (mobile) |
| DesktopStandingsCard | `predictions-client.tsx` (inline) | Tabla clasificación sidebar derecho |
| ProgressBar | `src/components/predictions/progress-bar.tsx` | Barra horizontal de progreso |
| TopBar | `src/components/top-bar.tsx` | Desktop header (datos hardcoded) |
| BottomNav | `src/components/bottom-nav.tsx` | Mobile bottom nav 3 tabs |
| TeamFlag | `src/components/team-flag.tsx` | Flag emoji renderer |
| LeaderboardClient | `src/app/(main)/leaderboard/leaderboard-client.tsx` | Podio + tabla expandible, mobile + desktop |
| shadcn/ui | `src/components/ui/` | badge, button, card, input, table, tabs, toggle, toggle-group |

### Cambios de la sesión 2026-05-22 (login contextual + welcome + dev login)

1. **Login contextual con invite**
   - `src/app/(auth)/login/page.tsx`: si `next=/join/[code]`, llama a la RPC `pool_lookup_by_invite_code` y pasa `invitePool` a `LoginForm`
   - `src/app/(auth)/login/login-form.tsx`: header extraído a `<Header>`. Renderiza "Te han invitado a `<PoolName>` · N jugadores" si hay `invitePool`; si no, branding por defecto ("Porra Mundial 2026 / Pronósticos entre amigos"). También se usa en el estado "sent" tras enviar magic link.

2. **Pantalla welcome** (`src/app/(main)/welcome/`)
   - `page.tsx`: hero "Bienvenido a la Porra del Mundial" + 2 cards (Crear porra → `/pools/new` · Tengo un código → input)
   - `code-form.tsx`: client component con input que hace `router.push('/join/' + code)`
   - `src/app/page.tsx` dispatcher: 0 porras → `/welcome` (antes era `/pools/new`)

3. **Dev login (sin gastar magic links)** (`src/app/dev/login/route.ts`)
   - Endpoint que usa `auth.admin.generateLink` (Admin API, no consume rate limit de `/otp` 2/hora)
   - Requiere `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` (añadido también a `.env.example`)
   - Bloqueado en producción (`NODE_ENV === "production"` → 404)
   - Middleware actualizado para permitir `/dev/*` sin sesión
   - Uso: `/dev/login?email=test@example.com&next=/welcome|/join/<code>|/pools/new`
   - Permite emular los 3 journeys (welcome, invite link, vuelta de user existente) sin tocar bandeja de entrada

4. **Verificación journeys** (manual con `/dev/login`):
   - Invite code actual: `808c3e6c` (porra "Mundial 2026")
   - Journey A nuevo: email nuevo → `/welcome`
   - Journey B nuevo: email nuevo + `next=/join/<code>` → form display_name → predictions de esa porra
   - Journey B repetido: email participante + `next=/join/<code>` → redirige directo a predictions
   - Login contextual visible en `/login?next=/join/808c3e6c` (incógnito)

### Cambios de la sesión 2026-05-21 (multi-porra)

1. **Refactor data model: tournaments + pools** (migraciones 006/007)
   - Nueva tabla `tournaments`; `teams`/`matches`/`goal_events` ahora referencian `tournament_id` (datos del torneo compartidos)
   - Pools añade `tournament_id` (FK) y `invite_code` (UNIQUE, autogenerado)
   - Backfill limpio: WC2026 + 48 equipos + 72 partidos
   - RLS: lectura pública para authenticated en tournaments/teams/matches/goal_events; pools.INSERT autenticada con `created_by=auth.uid()`; participations.INSERT propio
   - Función RPC `pool_lookup_by_invite_code(text)` (SECURITY DEFINER) para flujo de join
   - Trigger `trg_on_pool_created`: al crear pool, auto-crea participation con `is_admin=true` y `display_name=email local-part`

2. **Routing multi-porra**
   - `/predictions` y `/leaderboard` movidos a `/pools/[poolId]/predictions` y `/pools/[poolId]/leaderboard`
   - Nuevo `(main)/pools/[poolId]/layout.tsx` con TopBar/BottomNav y validación de participación
   - `(main)/layout.tsx` solo hace auth check
   - Root `/` redirige según nº de pools: 0 → /welcome · 1 → predictions · 2+ → /pools
   - TopBar/BottomNav reciben `poolId` por prop; links se construyen dinámicos

3. **Nuevas pantallas pools**
   - `/pools` — lista de "Mis porras" con código de invitación visible para admins
   - `/pools/new` — formulario crear porra (selector de torneo, deadline, nombre); muestra código + enlace tras crear
   - `/join/[code]` — landing pública: si no logueado redirige a /login con `next=/join/[code]`; flow forwarda `next` por el magic link

4. **Server actions** en `src/app/(main)/pools/actions.ts`
   - `createPool({ name, tournament_id, deadline })` con validación Zod
   - `joinPool({ invite_code, display_name })` usa RPC + INSERT participation

5. **Verificación**: 33 tests scoring verdes (sin cambios), `next build` ok, type-check limpio.

### Cambios de sesiones anteriores (2026-05-21)

1. **Migración 005 aplicada**: `bonus_categories.sql` verificada en Supabase remoto (constraints, tabla, indexes ok)

2. **Navegación por secciones en predicciones:**
   - 3 secciones: Grupos / Bracket / Extras con pills coloreadas (mobile) y sidebar items (desktop)
   - Bracket y Extras bloqueados con placeholder hasta completar fase de grupos
   - `hexAlpha()` helper para colores con transparencia
   - CSS-based responsive (`contents lg:hidden` / `hidden lg:contents`) para evitar flash en back button

3. **Responsive 1000–1440px:**
   - Sidebars 220/240px en `lg`, 260/280px en `xl`
   - Match grid: 1 columna en `lg`, 2 en `xl`
   - Score inputs: 44px en `lg`, 52px en `xl`
   - Team names + flags compactos con truncate en `lg`
   - Section nav: números movidos a la derecha de la fila
   - Standings table: posiciones centradas verticalmente, spacing mejorado

4. **Leaderboard (clasificación):**
   - Server component: carga participations + scores de Supabase, calcula totales por categoría
   - Client component: podio horizontal (desktop) / vertical (mobile), tabla expandible con breakdown por categoría
   - 5 categorías coloreadas: GROUP_MATCHES, GROUP_QUALIFIERS, KNOCKOUT, EXTRAS, FIRST_SCORER_ESP
   - Category filter pills, tap-to-expand rows, stacked bar charts
   - Highlight del usuario actual con `inset box-shadow`
   - `PlayerEntry` type con scores, maxScores, exactHits, signHits

---

## Pendiente (priorizado)

### Alta prioridad (MVP)
- [ ] Admin: meter resultados — sin diseño, necesita UI + actions
- [ ] Bracket eliminatorias — tiene diseño mobile + desktop, no implementado (placeholder listo)
- [ ] Edge Functions: reveal-pool cron (LOCKED → REVEALED el 11/jun 18:00)
- [ ] E2E test anonimato (Playwright: pre-reveal no se ven predicciones ajenas)

### Media prioridad
- [ ] UI predicciones extras/bonus (9 categorías) — sin diseño
- [ ] UI primer goleador España (por partido) — sin diseño
- [ ] Root page `/` — redirigir a /login o /predictions
- [ ] TopBar — datos dinámicos (nombre pool, nº jugadores, user)
- [ ] Leaderboard: pulir estilos finales, verificar con datos reales

### Baja prioridad
- [ ] PWA manifest + service worker
- [ ] Mi Porra / perfil — sin diseño
- [ ] Comparar porras — sin diseño
- [ ] Admin: scoring config — sin diseño
- [ ] Admin: invitaciones — sin diseño

---

## Decisiones pendientes

1. **Puntuación final** — los puntos sugeridos en SPEC.md v2 son orientativos, el grupo debe confirmar
2. **Lista de jugadores para goleador/asistente/mejor jugador** — ¿texto libre o lista cerrada?
3. **UI de bonus** — no hay diseño, ¿diseñar antes de implementar?

---

## Docs de referencia obligatorios

Consultar antes de implementar:
- `DOCS/design.md` — tokens de color, tipografía, espaciado, reglas de UI
- `DOCS/COMPONENT_SYSTEM.md` — componentes existentes antes de crear nuevos
- `DOCS/design/screens-mobile.jsx` + `screens-desktop.jsx` — diseños de pantallas
- `DOCS/DATA_MODEL.md` — schema de BD
- `DOCS/ARCHITECTURE.md` — patrones y decisiones técnicas
