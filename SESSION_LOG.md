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
| DB Schema | 7 migraciones aplicadas | tournaments + pools (multi-porra), 12+ tablas, RLS + trigger join |
| Data seeding | Completo | 48 equipos, 72 partidos de grupos, 1 pool, 1 participación |
| Auth (Magic Link) | Funcional (limitada) | Login + callback + dev login. **Pendiente: SMTP propio + redirect URL producción** |
| Scoring engine | Completo + 69 tests | Scoring v2: 3 categorías (results/classifications/extras), 39 unit + 30 simulación |
| Bracket engine | Completo | Standings, tiebreaks, R32→Final con estructura FIFA oficial + 495 combinaciones Anexo C |
| Extras section | Completo | 5 categorías con player autocomplete + team selector |
| PWA | Instalable | Manifest + SW + iconos placeholder (PM 2026). Deploy en Vercel con HTTPS |
| CI/CD | Activo | Push a `main` → deploy automático en Vercel |

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
| Auth Magic Link | `src/app/(auth)/login/` (page, form, actions) | Funcional + login contextual con invite |
| Dev login | `src/app/dev/login/route.ts` | Funcional (no consume magic links, bloqueado en prod) |
| Layout principal | `src/app/(main)/layout.tsx`, TopBar, BottomNav | Funcional (datos hardcoded en TopBar) |
| Multi-porra routing | `src/app/(main)/pools/[poolId]/` | Funcional — pools list, create, join, invite codes |
| Predicciones grupos | `src/app/(main)/pools/[poolId]/predictions/` | ✅ Completa — 3 secciones, responsive, auto-save |
| Bracket eliminatorias | `src/lib/bracket/` + `src/components/bracket/` | ✅ Completa — engine + UI mobile/desktop |
| Extras/Bonus | `src/components/predictions/extras-section.tsx` | ✅ Completa — 5 categorías, player autocomplete |
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

- [ ] **Auth: SMTP propio + redirect URL producción** — bloqueante para compartir con amigos
  - ✅ `getBaseUrl()` actualizado para usar `NEXT_PUBLIC_SITE_URL` como primera opción
  - **Pasos manuales pendientes:**
    1. **SMTP (Brevo):** Crear cuenta en brevo.com → Settings → SMTP & API → copiar credenciales. En Supabase Dashboard → Project Settings → Auth → SMTP Settings → "Enable Custom SMTP" → meter datos de Brevo. Nota: free tier 300 emails/día, añade logo Brevo al pie
    2. **Redirect URL:** Supabase Dashboard → Auth → URL Configuration → Site URL: `https://wr-predictions.vercel.app`. Añadir en Redirect URLs: `https://wr-predictions.vercel.app/**`
    3. **Env var:** Vercel → Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL=https://wr-predictions.vercel.app`
    4. **Email template:** Supabase Dashboard → Auth → Email Templates → Magic Link. Pegar HTML con branding "Porra Mundial 2026" (preparar template con Claude antes de pegar)
- [ ] **Migración predictions_group_tiebreak** — tabla usada en código pero sin migración formal
- [ ] **Migración scores CHECK constraint** — actualizar categorías a RESULTS/CLASSIFICATIONS/EXTRAS
- [ ] **Migración predictions_extra kind constraint** — actualizar a 5 kinds
- [ ] **Estados de pool en UI** — banners LOCKED/REVEALED/LIVE, inputs disabled
- [ ] Edge Function: reveal-pool cron (LOCKED → REVEALED el 11/jun 18:00)
- [ ] E2E test anonimato (Playwright: pre-reveal no se ven predicciones ajenas)

### Media prioridad

- [ ] Resultados automáticos — integración con OpenFootball (GitHub JSON) para scores. Polling cada 30 min via Edge Function cron en días de partido. Sin API key, sin rate limits.
- [ ] Admin override — UI mínima para corregir datos o meter "mejor jugador" (dato manual al final del torneo)
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

- **Fuente de resultados live:** OpenFootball (GitHub JSON estático, gratis) como fuente principal. Goleadores/asistentes/mejor jugador → admin manual. API-Football Pro ($19/mes) como alternativa si se necesita automatización completa (free tier no cubre temporada 2026).

---

## Docs de referencia obligatorios

Consultar antes de implementar:
- `DOCS/design.md` — tokens de color, tipografía, espaciado, reglas de UI
- `DOCS/COMPONENT_SYSTEM.md` — componentes existentes antes de crear nuevos
- `DOCS/design/screens-mobile.jsx` + `screens-desktop.jsx` — diseños de pantallas
- `DOCS/DATA_MODEL.md` — schema de BD
- `DOCS/ARCHITECTURE.md` — patrones y decisiones técnicas
