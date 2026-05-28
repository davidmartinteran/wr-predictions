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
| DB Schema | 7 migraciones aplicadas | tournaments + pools (multi-porra), 12+ tablas, RLS + trigger join |
| Data seeding | Completo | 48 equipos, 72 partidos de grupos, 1 pool, 1 participación |
| Auth (Magic Link) | Funcional | Login form + server action + callback + dev login |
| Scoring engine | Completo + 69 tests | Scoring v2: 3 categorías (results/classifications/extras), 39 unit + 30 simulación |
| Bracket engine | Completo | Standings, tiebreaks, R32→Final derivation, cascade invalidation |
| Extras section | Completo | 5 categorías con player autocomplete + team selector |

### Pantallas diseñadas (DOCS/design/)

Ficheros: `screens-mobile.jsx` + `screens-desktop.jsx`, renderizados en `Porra Mundial 2026 - Pantallas.html`
Clasificación: `C:\Users\david\Downloads\PORRA WC\screens-clasificacion.jsx` + `shared.jsx`

| Pantalla | Mobile | Desktop | Implementada |
|---|---|---|---|
| Pronósticos — Fase de grupos | `MobilePronosticos` | `DesktopPronosticos` | ✅ Completa — secciones + responsive + auto-save |
| Clasificación — Live ranking | `MobileClasificacion` | `DesktopClasificacion` | ~90% — podio + tabla expandible |
| Bracket — Eliminatorias | `MobileBracket` | `DesktopBracket` | ✅ Completa — derivación auto + tiebreaks + persistencia |
| Extras/Bonus | — | — | ✅ Completa — 5 extras (3 jugadores + 2 equipos) |

**Sin diseño todavía:** Login, mi porra, admin, comparar porras.

### Features implementadas

| Feature | Ficheros clave | Estado |
|---|---|---|
| Auth Magic Link | `src/app/(auth)/login/` (page, form, actions) | Funcional + login contextual con invite |
| Dev login | `src/app/dev/login/route.ts` | Funcional (no consume magic links, bloqueado en prod) |
| Layout principal | `src/app/(main)/layout.tsx`, TopBar, BottomNav | Funcional (datos hardcoded en TopBar) |
| Multi-porra routing | `src/app/(main)/pools/[poolId]/` | Funcional — pools list, create, join, invite codes |
| Predicciones grupos | `src/app/(main)/pools/[poolId]/predictions/` | ✅ Completa — 3 secciones, responsive, auto-save |
| Bracket eliminatorias | `src/lib/bracket/` + `src/components/bracket/` | ✅ Completa — engine + UI mobile/desktop |
| Extras/Bonus | `src/components/predictions/extras-section.tsx` | ✅ Completa — 5 categorías, player autocomplete |
| Bracket engine | `src/lib/bracket/engine.ts`, `standings.ts`, `mapping.ts` | ✅ — standings, tiebreaks, R32→Final, cascade |
| Group tiebreak modal | `src/components/bracket/group-tiebreak-modal.tsx` | ✅ — drag reorder para empates de grupo |
| Thirds tiebreaker | `src/components/bracket/thirds-tiebreaker.tsx` | ✅ — selección de 3ros clasificados |
| View modes | `predictions/page.tsx` (ViewMode type) | ✅ — own-open, own-closed, viewing-other |
| Player comparison | `predictions-client.tsx` | ✅ — ver porra de otro post-deadline con comparación |
| Leaderboard | `src/app/(main)/pools/[poolId]/leaderboard/` | ~90% — podio + tabla expandible, 3 categorías (scoring v2) |
| Scoring engine | `src/lib/scoring/engine.ts` + `engine.test.ts` + `full-tournament.test.ts` | 100% — 69 tests verdes (scoring v2) |
| Welcome flow | `src/app/(main)/welcome/` | ✅ — hero + crear porra / tengo código |
| Pools list | `src/app/(main)/pools/page.tsx` | ✅ — mis porras, código invite, copy button |
| Pool creation | `src/app/(main)/pools/new/` | ✅ — formulario + código generado |
| Join flow | `src/app/(main)/join/[code]/` | ✅ — landing pública, redirige a login si no auth |
| Player data | `src/data/players.ts` | 257 líneas, datos de jugadores para autocomplete |

### Componentes UI existentes

| Componente | Fichero | Notas |
|---|---|---|
| ScoreInput | `src/components/predictions/score-input.tsx` | tel input, 44x44 mobile / 52x52 xl desktop |
| MatchCard | `src/components/predictions/match-card.tsx` | Card con equipos + score inputs (mobile) |
| DesktopMatchCard | `predictions-client.tsx` (inline) | Match card desktop con score inputs responsive |
| TeamBadge | `src/components/predictions/team-badge.tsx` | Flag emoji + nombre |
| StandingsStrip | `src/components/predictions/standings-strip.tsx` | Mini-tabla de grupo (mobile) |
| DesktopStandingsCard | `predictions-client.tsx` (inline) | Tabla clasificación sidebar derecho |
| ProgressBar | `src/components/predictions/progress-bar.tsx` | Barra horizontal de progreso |
| ExtrasSection | `src/components/predictions/extras-section.tsx` | 5 extras: 3 jugadores (autocomplete) + 2 equipos |
| TopBar | `src/components/top-bar.tsx` | Desktop header (datos hardcoded) |
| BottomNav | `src/components/bottom-nav.tsx` | Mobile bottom nav 3 tabs |
| PoolsBottomNav | `src/app/(main)/pools/pools-bottom-nav.tsx` | Bottom nav para vista pools list |
| TeamFlag | `src/components/team-flag.tsx` | Flag emoji renderer |
| CopyCodeButton | `src/components/copy-code-button.tsx` | Botón copiar código invite al clipboard |
| BracketMobileView | `src/components/bracket/bracket-mobile.tsx` | Bracket eliminatorias mobile |
| BracketDesktopView | `src/components/bracket/bracket-desktop.tsx` | Bracket eliminatorias desktop |
| BracketMatch | `src/components/bracket/bracket-match.tsx` | Match card para bracket |
| GroupTiebreakModal | `src/components/bracket/group-tiebreak-modal.tsx` | Modal drag-reorder para empates de grupo |
| ThirdsTiebreaker | `src/components/bracket/thirds-tiebreaker.tsx` | Selección de terceros clasificados |
| LeaderboardClient | `src/app/(main)/pools/[poolId]/leaderboard/leaderboard-client.tsx` | Podio + tabla expandible, mobile + desktop |
| shadcn/ui | `src/components/ui/` | badge, button, card, input, table, tabs, toggle, toggle-group |

### Cambios de la sesión 2026-05-28 (bracket FIFA oficial)

1. **Bracket R32 reescrito con estructura FIFA oficial** (`src/lib/bracket/mapping.ts`)
   - Estructura anterior (inventada): 12 partidos 1ro vs 2do + 4 partidos 3ro vs 3ro
   - **Estructura real FIFA:** 8 partidos 1ro vs 3ro + 4 de 1ro vs 2do + 4 de 2do vs 2do
   - 16 slots del R32 ordenados para que el árbol binario reproduzca el cuadro FIFA (M73-M88)
   - `possibleGroups` por partido de terceros en vez del antiguo `thirdSlot` indexado
   - Fuente: [Wikipedia - 2026 FIFA World Cup knockout stage](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage)

2. **495 combinaciones oficiales FIFA (Anexo C)** (`src/lib/bracket/third-place-combinations.json`, 40KB)
   - Parseadas y validadas de la tabla de Wikipedia (basada en regulaciones FIFA)
   - Cada entrada: clave = 8 grupos ordenados, valor = asignación de grupo a slot del R32
   - `assignThirdsToSlots()` reemplaza backtracking heurístico por lookup determinista
   - Todas las 495 combinaciones tienen múltiples soluciones válidas → necesario usar la tabla FIFA exacta

3. **Engine actualizado** (`src/lib/bracket/engine.ts`)
   - `buildBracketState()` usa `assignThirdsToSlots()` para resolver qué tercero va a qué partido
   - Lookup por grupo de origen en vez de índice de ranking

### Cambios de sesiones 2026-05-23→27 (bracket, extras, view modes, multipool UX)

1. **Bracket engine** (`src/lib/bracket/`)
   - `engine.ts`: `deriveAllGroupStandings`, `rankThirdPlacedTeams`, `resolveThirds`, `buildBracketState`, `cascadeInvalidation`
   - `standings.ts`: `computeStandings`, `detectGroupTies` con FIFA tiebreak rules
   - `mapping.ts`: R32 matchup table, stages R32→FINAL, parent/child slot helpers
   - Propagación de ganadores: al seleccionar ganador en Rn, se rellena el slot correcto en Rn+1
   - Invalidación en cascada: si cambias un marcador de grupo, se recalculan standings y se invalidan picks downstream

2. **Bracket UI** (`src/components/bracket/`)
   - `bracket-mobile.tsx` / `bracket-desktop.tsx`: vistas completas de eliminatorias con todas las rondas
   - `bracket-match.tsx`: card de partido con equipos seleccionables (tap para elegir ganador)
   - `group-tiebreak-modal.tsx`: modal para resolver empates de grupo arrastrando equipos
   - `thirds-tiebreaker.tsx`: UI para elegir qué terceros clasifican de entre los empatados

3. **Extras section** (`src/components/predictions/extras-section.tsx`)
   - 5 categorías: Bota de Oro, Mejor Jugador, Máximo Asistente, Equipo más goleador, Equipo más goleado
   - Player categories: autocomplete con búsqueda sobre `src/data/players.ts` (257 jugadores)
   - Team categories: selector con flags
   - Auto-save por categoría

4. **View modes y comparación de jugadores**
   - 3 modos: `own-open` (editable), `own-closed` (read-only post-deadline), `viewing-other` (porra ajena)
   - `viewing-other`: comparación lado a lado con las predicciones propias, header con nombre del jugador
   - Leaderboard link → `/pools/[id]/predictions?player=[userId]` post-deadline

5. **Multipool UX improvements** (commit `3106b13`)
   - Pools list rediseñada con cards, conteo de participantes, código invite copiable
   - `PoolsBottomNav` para la vista de pools (no dentro de un pool específico)
   - Welcome simplificada
   - Dev login mejorado con redirect flow
   - Límite de 30 jugadores por pool

6. **Fixes** (commit `dce47dd`)
   - 3xl breakpoint para pantallas ultra-anchas
   - TeamBadge alignment fix
   - Supabase types actualizados en `src/lib/supabase/types.ts`

7. **Server actions nuevas** (`predictions/actions.ts`)
   - `saveKnockoutPrediction` / `deleteKnockoutPredictions` — persistencia bracket picks
   - `saveGroupTiebreak` / `deleteGroupTiebreak` — persistencia resolución empates
   - `saveExtra` / `deleteExtra` — persistencia extras

8. **Tabla pendiente de migración**: `predictions_group_tiebreak` — se usa en actions.ts pero no tiene migración en `supabase/migrations/`. Posiblemente creada directamente en Supabase dashboard o pendiente de formalizar.

### Cambios de la sesión 2026-05-27 (scoring v2 — engine + frontend)

1. **Scoring engine v2** (`src/lib/scoring/engine.ts`)
   - Reescritura completa: 3 categorías (RESULTS/CLASSIFICATIONS/EXTRAS) en lugar de 5
   - `scoreGroupMatch(pred, result, rules, isSpain)` — signo(1)/exacto(3), España ×2
   - `scoreElimination(predicted, actual, rules, isSpain)` — rondas GROUP→CHAMPION, distancia ±1=50%, ±2=25%, ±3+=0%
   - `scoreExtra(pred, actualValue, rules)` — 5 extras (goleador, asistente, mejor jugador, equipo más/menos goleador)
   - `calculateTotal({matchResults, eliminations, extras})` — devuelve `{results, classifications, extras, total, exact_hits}`
   - Eliminado: `scoreGroupQualifiers`, `scoreKnockout`, `scoreFirstScorer`, tipos antiguos

2. **Tests scoring** (`engine.test.ts` + `full-tournament.test.ts`)
   - 39 unit tests: match scoring (9), elimination (16), extras (7), totals (3), custom rules (4)
   - 30 tests de simulación: 48 equipos, 12 grupos, 72 partidos, 3 perfiles (Oráculo 527pts, Buen Ojo 271pts, Bote 58pts)
   - MAX_SCORES verificados: RESULTS=225, CLASSIFICATIONS=242, EXTRAS=60, TOTAL=527

3. **Leaderboard adaptado a scoring v2** (`leaderboard/page.tsx` + `leaderboard-client.tsx`)
   - `PlayerEntry.scores`: `{RESULTS, CLASSIFICATIONS, EXTRAS, TOTAL}` (antes eran 5 categorías)
   - `MAX_SCORES = {RESULTS: 225, CLASSIFICATIONS: 242, EXTRAS: 60, TOTAL: 527}`
   - 3 categorías en UI: Resultados (#1B9E5B), Clasificación (#A855F7), Extras (#F59E0B)
   - Eliminado `signHits` de PlayerEntry y de la UI

4. **Eliminado firstScorer de todo el frontend**
   - `predictions-client.tsx`: eliminados `handleFirstScorerChange`, `ownFirstScorers`, `isSpainMatch()`, props de firstScorer en sharedProps/LayoutProps/MobileLayout/DesktopLayout/DesktopMatchCard, sección "Primer gol España" en DesktopMatchCard
   - `match-card.tsx`: eliminados props `firstScorer`, `onFirstScorerChange`, `isSpainMatch` y sección UI de primer goleador
   - `actions.ts`: eliminado `saveFirstScorer` y su schema. `EXTRA_KINDS` reducido a 5 (sin SPAIN_ELIM_ROUND/SPAIN_ELIM_RIVAL)
   - `predictions/page.tsx`: eliminadas queries de `firstScorerPreds` y `ownFirstScorerPredictions`

5. **Build verificado** — `next build` limpio, sin errores TypeScript

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

5. **Verificación**: 69 tests scoring verdes (scoring v2), `next build` ok, type-check limpio.

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
   - 3 categorías coloreadas: RESULTS (#1B9E5B, 225), CLASSIFICATIONS (#A855F7, 242), EXTRAS (#F59E0B, 60)
   - Category filter pills, tap-to-expand rows, stacked bar charts
   - Highlight del usuario actual con `inset box-shadow`
   - `PlayerEntry` type con scores, maxScores, exactHits

---

## Pendiente (priorizado)

### Alta prioridad (MVP — antes del 11 jun)
- [x] **Extras/Bonus** — ✅ 5 categorías con autocomplete jugadores + selector equipos
- [x] **Bracket eliminatorias** — ✅ Engine completo + UI mobile/desktop + tiebreaks + persistencia
- [x] **Ver porra de otro** — ✅ Desde leaderboard post-deadline, comparación lado a lado con predicciones propias
- [x] **Bracket R32 oficial FIFA** — ✅ Reescrito con estructura real (1ro vs 3ro, 2do vs 2do) + 495 combinaciones Anexo C
- [ ] **Mi Porra** — tercer tab del bottom nav. Resumen compacto read-only de predicciones del usuario en el pool actual + link a "/pools".
- [ ] **Estados de pool en UI** — feedback visual para LOCKED (banner + inputs disabled), REVEALED (banner + habilitar ver porras ajenas), LIVE (badge EN VIVO + resultados reales junto a predicciones).
- [ ] **Migración predictions_group_tiebreak** — tabla usada en código pero sin migración formal
- [ ] **Migración scores CHECK constraint** — actualizar categorías a RESULTS/CLASSIFICATIONS/EXTRAS (antes GROUP_MATCHES/GROUP_QUALIFIERS/KNOCKOUT/EXTRAS/FIRST_SCORER_ESP)
- [ ] **Migración predictions_extra kind constraint** — actualizar a 5 kinds (eliminar SPAIN_ELIM_ROUND/SPAIN_ELIM_RIVAL)
- [ ] Edge Functions: reveal-pool cron (LOCKED → REVEALED el 11/jun 18:00)
- [ ] E2E test anonimato (Playwright: pre-reveal no se ven predicciones ajenas)

### Media prioridad
- [ ] API de resultados — integración con API-Football para resultados automáticos + goleadores. Requiere Edge Function cron.
- [ ] Admin override — UI mínima para corregir datos de la API o meter "mejor jugador" (1 dato manual al final).
- [ ] TopBar — datos dinámicos (nombre pool, nº jugadores, user)
- [ ] Leaderboard: pulir estilos finales, verificar con datos reales

### Baja prioridad / Post-launch
- [ ] PWA manifest + service worker
- [ ] Comparar porras lado a lado (diff visual) — MVP solo vista individual
- [ ] Admin: scoring config
- [ ] Admin: invitaciones

---

## Pantallas pendientes de diseño/implementación

| # | Pantalla | Estado | Notas |
|---|---|---|---|
| ~~1~~ | ~~Extras/Bonus~~ | ✅ Implementada | 5 categorías con autocomplete + selector equipos |
| 2 | **Mi Porra** | Pendiente diseño | Tercer tab bottom nav. Resumen read-only + "¿Cómo se puntúa?" |
| ~~3~~ | ~~Ver porra de otro~~ | ✅ Implementada | Desde leaderboard `?player=userId`, comparación lado a lado |
| 4 | **Admin: override resultados** | Pendiente diseño | UI mínima para corregir API o meter "mejor jugador". Solo `is_admin=true` |
| 5 | **Estados de pool** | Pendiente implementación | Banners LOCKED/REVEALED/LIVE, inputs disabled, badge EN VIVO |

## Decisiones tomadas (sesión 2026-05-22/23)

1. **Clasificados de grupo** — se derivan automáticamente de los marcadores predichos, NO input manual separado
2. **Resultados oficiales** — API-Football como fuente principal (polling automático). Admin solo override para correcciones y "mejor jugador"
3. **Jugadores (goleador/asistente/mejor)** — autocomplete con datos de API (misma fuente que resultados), NO texto libre
4. **Comparar porras** — post-launch. MVP solo vista individual de la porra de otro
5. **Mi Porra** — reemplaza tab "Mis porras" en bottom nav. Resumen compacto + link a lista de pools
6. ~~**Primer goleador España**~~ — eliminado en scoring v2, reemplazado por multiplicador España ×2 en resultados y clasificaciones
7. **Campeón/subcampeón/tercer puesto** — se deducen del bracket, NO son extras que el usuario elija aparte. Cuentan como puntos de clasificaciones.

## Decisiones tomadas (sesión 2026-05-23→27)

1. **Fuente de convocados** — JSON estático en `src/data/players.ts` (~500 jugadores convocados). No requiere API. Se contrasta con datos reales de API-Football al puntuar.
2. **Bracket tiebreaks** — empates de grupo se resuelven manualmente por el usuario (modal drag-reorder). Terceros empatados se eligen con UI dedicada.
3. **Comparar porras** — implementado directamente en predictions con `?player=userId`, comparación inline (no modal/drawer separado)

## Decisiones tomadas (sesión 2026-05-27)

1. **Scoring v2** — Sistema simplificado a 3 categorías:
   - **Resultados (45%, max 225):** signo(1)/exacto(3) en 72 partidos de grupo. España ×2 (signo 2, exacto 6).
   - **Clasificaciones (45%, max ~242):** predicción de ronda de eliminación por equipo (48 equipos). Puntos según ronda: GROUP(2), R32(3), R16(5), QF(8), SF(12), Subcampeón(18), Campeón(25). Descuento por distancia: ±1 ronda=50%, ±2=25%, ±3+=0%. España ×2.
   - **Extras (10%, max 60):** goleador(15), asistente(15), mejor jugador(10), equipo más goleador(10), más goleado(10).
   - **Eliminado:** primer goleador España (reemplazado por ×2 en resultados), clasificados de grupo como categoría aparte (fusionado en clasificaciones), runner_up/third_place/spain_elim como extras (ahora en clasificaciones).
   - **Max total: ~527 pts.** Verificado con simulación completa (69 tests, 3 perfiles de jugador).

2. **Resultados vía API** — API-Football como fuente principal. Admin solo override + "mejor jugador" manual. No hay panel admin de entrada manual de resultados.

3. **Jugadores para autocomplete** — JSON estático (~500 convocados), sin API. Se contrasta con API-Football al puntuar.

## Decisiones tomadas (sesión 2026-05-28)

1. **Bracket R32 oficial FIFA** — La estructura inventada (1ro×2do cruzados + 3ro×3ro) se reemplazó por la oficial de FIFA: 8 partidos de 1ro vs 3ro, 4 de 1ro vs 2do cruzados, 4 de 2do vs 2do. Las 495 combinaciones del Anexo C se parsean de un JSON (lookup determinista) en vez de resolverse por backtracking, ya que todas tienen múltiples soluciones válidas y solo la de FIFA es la correcta.

## Decisiones pendientes

(ninguna crítica para MVP)

---

## Docs de referencia obligatorios

Consultar antes de implementar:
- `DOCS/design.md` — tokens de color, tipografía, espaciado, reglas de UI
- `DOCS/COMPONENT_SYSTEM.md` — componentes existentes antes de crear nuevos
- `DOCS/design/screens-mobile.jsx` + `screens-desktop.jsx` — diseños de pantallas
- `DOCS/DATA_MODEL.md` — schema de BD
- `DOCS/ARCHITECTURE.md` — patrones y decisiones técnicas
