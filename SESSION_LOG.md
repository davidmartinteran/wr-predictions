# SESSION_LOG — Porra Mundial 2026

> Snapshot del estado actual del proyecto. Se regenera al final de cada sesión.
> Consultar al inicio de cada sesión via `/rehydrate`.

---

## Estado actual del proyecto

**Fase:** Producción — MVP lanzado, Mundial 2026 en curso (fase de grupos)
**Tier:** B
**Deadline porras:** 2026-06-11 18:00 CEST (pasado — pools bloqueadas y reveladas)
**Deploy:** https://wr-predictions.vercel.app (Vercel, CI/CD desde GitHub `main`)

### Infraestructura completada

| Área | Estado | Notas |
|---|---|---|
| Supabase project | Activo | `funcrmqctwjoiovtccbh`, región eu-west-1, Postgres 17 |
| DB Schema | 18 migraciones aplicadas | tournaments + pools (multi-porra), 12+ tablas, RLS + trigger join. ⚠️ Colisión de prefijo `015` (`20260611_015` y `20260612_015`, ambas aplicadas) |
| Data seeding | Completo | 48 equipos, 72 partidos de grupos + 32 placeholders de eliminatorias (R32→final, con kickoff/sede/`api_fixture_id` de ESPN), 1 pool, 7 participaciones |
| Auth | Funcional | OTP 6 dígitos + magic link fallback, Brevo SMTP, email con branding. Dev login bloqueado en prod |
| Scoring engine | Completo + 91 tests | Scoring v2: 3 categorías (results/classifications/extras), función pura. Tests: `engine`, `full-tournament`, `actual-rounds`, `predicted-rounds` |
| Bracket engine | Completo | Standings, tiebreaks, R32→Final con estructura FIFA oficial + 495 combinaciones Anexo C |
| Resultados automáticos | Activo | ESPN (API no oficial, gratis) → Edge Function `poll-results` + pg_cron **cada minuto**. Recalcula `scores` RESULTS (grupos) y CLASSIFICATIONS (eliminatorias). Pase de cruces cada 30 min. Respeta overrides `source='MANUAL'` |
| Lock/Reveal pools | Activo | pg_cron SQL puro (migración 014): OPEN→LOCKED→REVEALED al pasar deadline |
| PWA | Instalable | Manifest + SW + iconos placeholder. Shell con `fixed inset-0` + `viewport-fit=cover` + safe-area insets (fix def. del corte de layout en standalone Android tras soft-nav) |
| CI/CD | Activo | Push a `main` → deploy automático en Vercel |

### Pantallas diseñadas (DOCS/design/)

Ficheros: `screens-mobile.jsx` + `screens-desktop.jsx`, renderizados en `Porra Mundial 2026 - Pantallas.html`

| Pantalla | Mobile | Desktop | Implementada |
|---|---|---|---|
| Pronósticos — Fase de grupos | `MobilePronosticos` | `DesktopPronosticos` | ✅ Completa — secciones + responsive + auto-save |
| Clasificación — Live ranking | `MobileClasificacion` | `DesktopClasificacion` | ✅ — podio + tabla expandible, 3 categorías |
| Bracket — Eliminatorias | `MobileBracket` | `DesktopBracket` | ✅ Completa — derivación auto + tiebreaks + persistencia |
| Extras/Bonus | — | — | ✅ Completa — 5 extras (3 jugadores + 2 equipos) |
| Calendario | — | — | ✅ — live + marcador parcial + "Otros pronósticos" post-deadline |

**Sin diseño todavía:** Mi Porra (resumen), admin override resultados, comparar porras lado a lado.

### Features implementadas

| Feature | Ficheros clave | Estado |
|---|---|---|
| Auth OTP + Magic Link | `src/app/(auth)/login/`, `auth/callback/` | ✅ OTP + magic link, Brevo SMTP, branding |
| Dev login | `src/app/dev/login/route.ts` | ✅ Funcional, bloqueado en prod |
| Welcome flow | `src/app/(main)/welcome/` | ✅ hero + crear porra / tengo código |
| Layout principal + nav | `src/app/(main)/layout.tsx`, `top-bar.tsx`, `bottom-nav.tsx` | ✅ BottomNav 4 tabs persistente (Calendario/Pronósticos/Clasificación/Mi Porra) |
| Multi-porra routing | `src/app/(main)/pools/[poolId]/` | ✅ pools list, create, join, invite codes |
| Pools list + creación + join | `pools/page.tsx`, `pools/new/`, `join/[code]/` | ✅ mis porras, código invite, landing pública |
| Predicciones grupos | `pools/[poolId]/predictions/` | ✅ 3 secciones (grupos/bracket/extras), responsive, auto-save |
| Bracket eliminatorias | `src/lib/bracket/`, `src/components/bracket/` | ✅ engine + UI mobile/desktop + tiebreaks |
| Extras/Bonus | `src/components/predictions/extras-section.tsx` | ✅ 5 categorías, player autocomplete |
| Admin resultados extras | `src/components/predictions/admin-extras-section.tsx` | ✅ pestaña Admin (solo admins del pool) |
| View modes + comparación | `predictions/page.tsx`, `predictions-client.tsx` | ✅ own-open / own-closed / viewing-other (porra ajena post-deadline) |
| Leaderboard | `pools/[poolId]/leaderboard/` | ✅ podio + tabla expandible, 3 categorías, auto-refresh 120s post-deadline |
| Calendario live | `pools/[poolId]/calendar/`, `lib/calendar/` | ✅ badge EN VIVO, marcador parcial, auto-refresh 60s en ventana, dropdown "Otros pronósticos" post-deadline |
| Resultados + scoring auto | `supabase/functions/poll-results/` | ✅ polling ESPN, RESULTS + CLASSIFICATIONS automáticos, pase de cruces |
| Scoring CLASSIFICATIONS auto | `predicted_team_rounds`, `scripts/materialize-predicted-rounds.ts` | ✅ ronda predicha materializada + `winner_team` ESPN + recálculo progresivo |
| Cerrar sesión | `src/app/(main)/pools/sign-out-button.tsx` | ✅ botón en Mis Porras |
| Player data | `src/data/players.ts` | ~250 jugadores para autocomplete |
| PWA | `public/manifest.json`, `public/sw.js`, `sw-register.tsx` | ✅ instalable, iconos placeholder |

### Componentes UI existentes

| Componente | Fichero | Notas |
|---|---|---|
| ScoreInput | `predictions/score-input.tsx` | tel input, 44x44 mobile / 52x52 xl desktop |
| MatchCard | `predictions/match-card.tsx` | Card equipos + score inputs (mobile) |
| TeamBadge / TeamFlag | `predictions/team-badge.tsx`, `team-flag.tsx` | Flag emoji + nombre |
| StandingsStrip | `predictions/standings-strip.tsx` | Mini-tabla de grupo (mobile, pinned bajo la lista) |
| ProgressBar | `predictions/progress-bar.tsx` | Barra horizontal de progreso |
| ExtrasSection / AdminExtrasSection | `predictions/extras-section.tsx`, `admin-extras-section.tsx` | 5 extras + versión admin |
| TopBar | `top-bar.tsx` | Desktop header |
| BottomNav / PoolsBottomNav | `bottom-nav.tsx`, `pools/pools-bottom-nav.tsx` | Mobile nav 4 tabs |
| CalendarClient + CalendarMatchCard | `calendar/`, `components/calendar/` | Calendario live + otros pronósticos |
| Bracket* | `components/bracket/` | bracket-mobile, bracket-desktop, bracket-match, group-tiebreak-modal, thirds-tiebreaker |
| LeaderboardClient | `leaderboard/leaderboard-client.tsx` | Podio + tabla expandible |
| CopyCodeButton | `copy-code-button.tsx` | Copiar código invite |
| SWRegister | `sw-register.tsx` | Registro de service worker |
| shadcn/ui | `components/ui/` | badge, button, card, input, table, tabs, toggle, toggle-group |

---

## Pendiente (priorizado)

### Próximas features (comprometidas — candidatas a la siguiente)

- [ ] **Notificaciones por favoritos** — marcar un partido como favorito y recibir: (a) notificación 15 min antes del kickoff con frases de Vicente Maroto, (b) notificación final con el resultado. Requiere Web Push en la PWA (suscripción + permiso), tabla de favoritos por usuario y disparo desde `poll-results`/pg_cron.
- [ ] **Enlace predicción → calendario** — en la vista de predicción, cada partido enlaza al mismo partido del calendario para ver cómo va (en vivo/resultado) o cuándo se juega.

### Media prioridad

- [ ] **Recálculo automático de EXTRAS** — hoy RESULTS y CLASSIFICATIONS son automáticos; EXTRAS sigue manual via pestaña Admin
- [ ] **TopBar** — datos dinámicos (nombre pool, nº jugadores, user) si quedan hardcodeados
- [ ] **Estados de pool en UI** — pulir banners LOCKED/REVEALED/LIVE (ya hay "Pronósticos congelados" + badge deadline dinámico)
- [ ] Verificar migración formal de `predictions_group_tiebreak` y constraint de kinds en `predictions_extra`

### Baja prioridad / Post-launch

- [ ] Comparar porras lado a lado (diff visual) — hoy solo vista individual de porra ajena
- [ ] Admin: pantallas `admin/results` y `admin/invites` (rutas existen, revisar estado)
- [ ] Admin: scoring config
- [ ] E2E test anonimato (Playwright: pre-reveal no se ven predicciones ajenas)
- [ ] PWA: iconos definitivos (reemplazar placeholder) + screenshots para "Richer Install UI"

---

## Pantallas pendientes de diseño/implementación

| # | Pantalla | Estado | Notas |
|---|---|---|---|
| 1 | **Mi Porra** | Pendiente diseño | Tab "Mi Porra" hoy redirige a la lista de pools. Falta resumen read-only + info para compartir |
| 2 | **Admin: override resultados** | Pendiente diseño | Rutas `admin/results` / `admin/invites` existen; UI mínima para corregir API o meter "mejor jugador" |
| 3 | **Comparar porras** | Pendiente diseño | Diff visual lado a lado |

## Decisiones pendientes

(ninguna abierta — las decisiones técnicas tomadas viven en `DOCS/adr/`)

Gotchas conocidos a tener presentes:
- **Fechas ESPN:** ESPN agrupa eventos por día US Eastern (UTC-4); los kickoffs de madrugada UTC caen en el día anterior. `poll-results` pide siempre un rango que empieza un día antes.
- **Layout PWA standalone:** el shell usa `fixed inset-0` (no `h-dvh`); en el WebView de Android la unidad `dvh` se quedaba obsoleta tras soft-nav y rompía el pinned de la clasificación. No volver a `h-dvh` en contenedores que persisten entre pestañas.

---

## Docs de referencia obligatorios

Consultar antes de implementar:
- `DOCS/design.md` — tokens de color, tipografía, espaciado, reglas de UI
- `DOCS/COMPONENT_SYSTEM.md` — componentes existentes antes de crear nuevos
- `DOCS/design/screens-mobile.jsx` + `screens-desktop.jsx` — diseños de pantallas
- `DOCS/DATA_MODEL.md` — schema de BD
- `DOCS/ARCHITECTURE.md` — patrones y decisiones técnicas
