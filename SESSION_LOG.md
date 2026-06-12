# SESSION_LOG — Porra Mundial 2026

> Snapshot del estado actual del proyecto. Se regenera al final de cada sesión.
> Consultar al inicio de cada sesión via `/rehydrate`.

---

## Estado actual del proyecto

**Fase:** 4 — Feature Development
**Tier:** B
**Deadline:** 2026-06-11 18:00 CEST (partido inaugural)
**Deploy:** https://wr-predictions.vercel.app (Vercel, CI/CD desde GitHub `main`)

### Infraestructura completada

| Área | Estado | Notas |
|---|---|---|
| Supabase project | Activo | `funcrmqctwjoiovtccbh`, región eu-west-1, Postgres 17 |
| DB Schema | 17 migraciones aplicadas | tournaments + pools (multi-porra), 12+ tablas, RLS + trigger join. 015-017: cron cada minuto, 32 placeholders eliminatorias, `winner_team` + `predicted_team_rounds` |
| Data seeding | Completo | 48 equipos, 72 partidos de grupos + 32 placeholders de eliminatorias (R32→final, con kickoff/sede/`api_fixture_id` de ESPN), 1 pool, 7 participaciones |
| Auth (Magic Link) | Funcional (limitada) | Login + callback + dev login. **Pendiente: SMTP propio + redirect URL producción** |
| Scoring engine | Completo + 91 tests | Scoring v2: 3 categorías (results/classifications/extras), 39 unit + 30 simulación + 13 nuevos (actual-rounds, predicted-rounds) + 9 más |
| Bracket engine | Completo | Standings, tiebreaks, R32→Final con estructura FIFA oficial + 495 combinaciones Anexo C |
| Extras section | Completo | 5 categorías con player autocomplete + team selector |
| PWA | Instalable | Manifest + SW + iconos placeholder (PM 2026). Deploy en Vercel con HTTPS. Safe-area insets corregidos (`viewport-fit=cover`, `h-dvh`→`flex-1`) |
| CI/CD | Activo | Push a `main` → deploy automático en Vercel |
| Resultados automáticos | Activo | ESPN (API no oficial, gratis) → Edge Function `poll-results` + pg_cron **cada minuto**. Recalcula `scores` RESULTS (grupos) y CLASSIFICATIONS (eliminatorias) automáticamente. Pase de cruces cada 30 min |

### Pantallas diseñadas (DOCS/design/)

Ficheros: `screens-mobile.jsx` + `screens-desktop.jsx`, renderizados en `Porra Mundial 2026 - Pantallas.html`

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
| Auth OTP + Magic Link | `src/app/(auth)/login/` (page, form, actions) | ✅ — OTP 6 dígitos + magic link fallback, Brevo SMTP, email con branding |
| Dev login | `src/app/dev/login/route.ts` | Funcional (no consume magic links, bloqueado en prod) |
| Layout principal | `src/app/(main)/layout.tsx`, TopBar, BottomNav | Funcional (datos hardcoded en TopBar) |
| Multi-porra routing | `src/app/(main)/pools/[poolId]/` | Funcional — pools list, create, join, invite codes |
| Predicciones grupos | `src/app/(main)/pools/[poolId]/predictions/` | ✅ Completa — 3 secciones, responsive, auto-save |
| Bracket eliminatorias | `src/lib/bracket/` + `src/components/bracket/` | ✅ Completa — engine + UI mobile/desktop |
| Extras/Bonus | `src/components/predictions/extras-section.tsx` | ✅ Completa — 7 categorías, player autocomplete |
| Admin resultados extras | `src/components/predictions/admin-extras-section.tsx` | ✅ — pestaña Admin en predicciones, solo para admins del pool |
| Bracket engine | `src/lib/bracket/engine.ts`, `standings.ts`, `mapping.ts` | ✅ — standings, tiebreaks, R32→Final (FIFA oficial), cascade |
| Group tiebreak modal | `src/components/bracket/group-tiebreak-modal.tsx` | ✅ — drag reorder para empates de grupo |
| Thirds tiebreaker | `src/components/bracket/thirds-tiebreaker.tsx` | ✅ — selección de 3ros clasificados |
| View modes | `predictions/page.tsx` (ViewMode type) | ✅ — own-open, own-closed, viewing-other |
| Player comparison | `predictions-client.tsx` | ✅ — ver porra de otro post-deadline con comparación |
| Leaderboard | `src/app/(main)/pools/[poolId]/leaderboard/` | ~90% — podio + tabla expandible, 3 categorías (scoring v2) |
| Scoring engine | `src/lib/scoring/engine.ts` + tests | 100% — 69 tests verdes (scoring v2) |
| Welcome flow | `src/app/(main)/welcome/` | ✅ — hero + crear porra / tengo código |
| Pools list | `src/app/(main)/pools/page.tsx` | ✅ — mis porras, código invite, copy button |
| Pool creation | `src/app/(main)/pools/new/` | ✅ — formulario + código generado |
| Join flow | `src/app/join/[code]/` | ✅ — landing pública, redirige a login si no auth |
| Player data | `src/data/players.ts` | ~250 jugadores, datos actualizados para autocomplete |
| PWA | `public/manifest.json`, `public/sw.js`, `src/components/sw-register.tsx` | ✅ — instalable, iconos placeholder |
| Cerrar sesión | `src/app/(main)/pools/sign-out-button.tsx` | ✅ — botón en Mis Porras |
| Resultados live + scoring auto | `supabase/functions/poll-results/`, migraciones 012–013 | ✅ — polling ESPN cada 5 min (solo en ventana de partido), respeta overrides `source='MANUAL'`, upsert scores RESULTS. 72 partidos mapeados a ESPN event id (`api_fixture_id`) |
| Calendario live | `calendar-client.tsx`, `lib/calendar/utils.ts` | ✅ — badge EN VIVO por `matches.status` + fallback reloj, marcador parcial, auto-refresh 60s en ventana de juego. Leaderboard auto-refresh 120s post-deadline |

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
| LeaderboardClient | `leaderboard/leaderboard-client.tsx` | Podio + tabla expandible, mobile + desktop |
| SWRegister | `src/components/sw-register.tsx` | Registro de service worker |
| shadcn/ui | `src/components/ui/` | badge, button, card, input, table, tabs, toggle, toggle-group |

---

## Pendiente (priorizado)

### Alta prioridad (MVP — antes del 11 jun)

- [x] **Auth: SMTP + OTP + redirect URL producción** — ✅ Brevo SMTP + OTP flow (código 6 dígitos + magic link fallback) + email template con branding + `NEXT_PUBLIC_SITE_URL` en Vercel + cerrar sesión en Mis Porras
- [x] **Admin: resultados extras** — ✅ Tabla `pool_results_extra` + pestaña "Admin" en predicciones (solo visible para admins) + server actions + UI con autocomplete jugadores y selector equipos
- [ ] **Migración predictions_group_tiebreak** — tabla usada en código pero sin migración formal
- [x] **Migración scores CHECK constraint** — ✅ migración 012: categorías RESULTS/CLASSIFICATIONS/EXTRAS/TOTAL
- [ ] **Migración predictions_extra kind constraint** — actualizar a 5 kinds
- [ ] **Estados de pool en UI** — banners LOCKED/REVEALED/LIVE, inputs disabled
- [ ] Edge Function: reveal-pool cron (LOCKED → REVEALED el 11/jun 18:00)
- [ ] E2E test anonimato (Playwright: pre-reveal no se ven predicciones ajenas)

### Próximas releases (comprometidas)

- [ ] **Notificaciones por favoritos** — marcar un partido como favorito y recibir: (a) notificación previa 15 min antes del kickoff con frases de Vicente Maroto, (b) notificación final con el resultado al acabar. Requiere Web Push en la PWA (suscripción + permiso), tabla de favoritos por usuario y disparo desde `poll-results`/pg_cron.
- [ ] **Enlace predicción → calendario** — en la vista de predicción, cada partido enlaza al mismo partido en el calendario para ver cómo va (en vivo/resultado) o cuándo se juega.

### Media prioridad

- [x] Resultados automáticos — ✅ ESPN scoreboard API (gratis, sin key) via Edge Function `poll-results` + pg_cron cada minuto. Secretos en Vault (`project_url`, `service_role_key`)
- [x] Recalcular CLASSIFICATIONS al avanzar el torneo — ✅ automático y progresivo (12/jun): `predicted_team_rounds` materializado + `winner_team` + recálculo en `poll-results`. EXTRAS sigue manual via pestaña Admin
- [ ] TopBar — datos dinámicos (nombre pool, nº jugadores, user)
- [ ] Leaderboard: pulir estilos finales, verificar con datos reales
- [ ] Actualizar `src/data/players.ts` con convocatorias oficiales cuando se publiquen (~primera semana junio)

### Baja prioridad / Post-launch

- [ ] Comparar porras lado a lado (diff visual) — MVP solo vista individual
- [ ] Admin: scoring config
- [ ] Admin: invitaciones
- [ ] PWA: iconos definitivos (reemplazar placeholder PM 2026)
- [ ] PWA: screenshots para "Richer Install UI" en manifest

---

## Pantallas pendientes de diseño/implementación

| # | Pantalla | Estado | Notas |
|---|---|---|---|
| 1 | **Mi Porra** | Pendiente diseño | Tercer tab bottom nav. Resumen read-only + info para compartir |
| 2 | **Admin: override resultados** | Pendiente diseño | UI mínima para corregir API o meter "mejor jugador". Solo `is_admin=true` |
| 3 | **Estados de pool** | Pendiente implementación | Banners LOCKED/REVEALED/LIVE, inputs disabled, badge EN VIVO |

## Decisiones pendientes

- ~~Fuente de resultados live~~ **Resuelto (2026-06-11):** ESPN scoreboard API no oficial (`site.api.espn.com/.../soccer/fifa.world/scoreboard`) — gratis, sin key, estado y marcador en vivo. Fallback: override manual del admin (`matches.source='MANUAL'` nunca se pisa). OpenFootball descartado (actualización manual ~1×/día); API-Football free no cubre 2026. Alias de códigos ESPN→BD: HAI→HTI (resto coinciden, verificado 1:1).
- ~~Scoring automático de eliminatorias~~ **Resuelto (2026-06-12):** `predicted_team_rounds` materializa la ronda predicha por usuario/equipo desde la porra congelada (`scripts/materialize-predicted-rounds.ts`, re-ejecutable). `matches.winner_team` se escribe del flag `winner` de ESPN (válido en penaltis). `poll-results` deriva rondas reales definitivas (`deriveActualRounds`) y recalcula CLASSIFICATIONS con `scoreElimination`. El 3er puesto no altera la ronda (ambos SF). Primer reparto grande al cerrar grupos (27-28 jun).
- **Fechas ESPN (gotcha):** ESPN agrupa eventos por día US Eastern (UTC-4); los kickoffs de madrugada UTC caen en el día anterior. `poll-results` pide siempre un rango que empieza un día antes (causó el fallo del Corea-Chequia del 12/jun).

---

## Docs de referencia obligatorios

Consultar antes de implementar:
- `DOCS/design.md` — tokens de color, tipografía, espaciado, reglas de UI
- `DOCS/COMPONENT_SYSTEM.md` — componentes existentes antes de crear nuevos
- `DOCS/design/screens-mobile.jsx` + `screens-desktop.jsx` — diseños de pantallas
- `DOCS/DATA_MODEL.md` — schema de BD
- `DOCS/ARCHITECTURE.md` — patrones y decisiones técnicas
