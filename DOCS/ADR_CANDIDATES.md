# ADRs Candidatos — Porra Mundial 2026

**Fase 1 — Architecture & Design**

Lista priorizada de Architecture Decision Records a redactar antes de empezar Fase 2. En Tier B con plazo corto, redactamos los **críticos** (1-4) y dejamos los demás como decisiones implícitas documentadas en `CLAUDE.md`.

---

## ADR-001 — Supabase como BaaS [CRÍTICO]

**Estado:** Por redactar
**Contexto:** Necesitamos auth + BD + realtime + reglas de seguridad declarativas. Plazo corto.
**Decisión candidata:** Supabase.
**Alternativas a evaluar:** Firebase (auth excelente pero RLS más débil), Neon + Auth.js + custom (más control pero más código), PocketBase (single binary pero menos maduro).
**Tradeoffs clave:** Vendor lock-in vs. velocidad de desarrollo. Para Tier B con 3 semanas, lock-in es aceptable.

## ADR-002 — Anonimato vía RLS, no vía aplicación [CRÍTICO]

**Estado:** Por redactar
**Contexto:** La promesa central del producto es que nadie ve pronósticos ajenos antes del 11/jun. Si esto falla, el producto pierde sentido.
**Decisión candidata:** Garantizar anonimato a nivel base de datos con Row-Level Security; el frontend nunca es la fuente de verdad de seguridad.
**Test obligatorio:** E2E que ataca la API REST con JWT de usuario A intentando leer predicciones de B mientras el pool está OPEN. Debe fallar.

## ADR-003 — Resultados oficiales: entrada manual en MVP [CRÍTICO]

**Estado:** Por redactar
**Contexto:** ¿Integrar API de fútbol (api-football, football-data.org) o meter resultados a mano?
**Decisión candidata:** Manual en MVP, vía panel admin móvil-first. APIs externas se evalúan post-MVP.
**Por qué:** APIs gratuitas tienen rate limits y a veces tardan en actualizar resultados oficiales. Para 104 partidos en 1 mes, meter a mano cuesta ~2min/partido y es 100% fiable. Reduce dependencias externas en MVP.
**Trigger de revisión:** Si en Fase 4 el admin se quema metiendo resultados, evaluar integración.

## ADR-004 — Auth por Magic Link sin password [CRÍTICO]

**Estado:** Por redactar
**Contexto:** Onboarding de 20-50 amigos no técnicos.
**Decisión candidata:** Supabase Auth con Magic Link por email. Sin password, sin OAuth (no necesitamos perfiles).
**Por qué:** Fricción mínima, 0 soporte por "olvidé mi contraseña", suficientemente seguro para un grupo cerrado.

---

## ADRs no-críticos (decisiones implícitas en CLAUDE.md)

- **ADR-005** — Next.js App Router vs Pages Router → App Router (estándar 2026).
- **ADR-006** — Tailwind + shadcn/ui vs CSS Modules → shadcn/ui (velocidad).
- **ADR-007** — Estado servidor: React Query vs RSC + Server Actions → RSC + Server Actions (alineado con App Router).
- **ADR-008** — PWA: next-pwa vs manifest manual → manifest manual + service worker mínimo (next-pwa añade complejidad innecesaria).
- **ADR-009** — Despliegue: Vercel vs alternativa → Vercel (free tier + DX).
- **ADR-010** — Testing: Vitest + Playwright → estándar del ecosistema Next.
