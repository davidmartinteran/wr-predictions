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
| DB Schema | 5 migraciones aplicadas | 11 tablas con RLS, trigger freeze scoring |
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

### Cambios de la última sesión (2026-05-21)

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
